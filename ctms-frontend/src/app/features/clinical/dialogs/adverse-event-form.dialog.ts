import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdverseEventService } from '../services/safety.service';
import { PatientService, EnrollmentService } from '../services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { forkJoin } from 'rxjs';
import { PatientResponse, TrialResponse, EnrollmentResponse } from '../../../core/models/domain.models';
import { ADVERSE_EVENT_STATUSES, SEVERITIES } from '../../../core/models/enums';
import { toIsoDate } from '../clinical.util';

interface AeDialogData { trial: TrialResponse; patientId?: number; }

@Component({
  selector: 'ctms-adverse-event-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Report adverse event</h2>
    <mat-dialog-content>
      <p class="muted" style="margin:0 0 12px">{{ data.trial.trialCode }} — {{ data.trial.trialName }}</p>
      <form [formGroup]="form" class="form-grid" style="padding-top:4px">
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Patient</mat-label>
          <mat-select formControlName="patientId">
            @for (p of patients(); track p.patientId) {
              <mat-option [value]="p.patientId">{{ p.patientCode }} — {{ p.fullName }}</mat-option>
            }
          </mat-select>
          @if (form.controls.patientId.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Severity</mat-label>
          <mat-select formControlName="severity">
            @for (s of severities; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
          @if (form.controls.severity.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Event date</mat-label>
          <input matInput [matDatepicker]="dp" [max]="today" formControlName="eventDate" />
          <mat-datepicker-toggle matIconSuffix [for]="dp" />
          <mat-datepicker #dp />
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Description</mat-label>
          <textarea matInput rows="3" formControlName="description"></textarea>
          @if (form.controls.description.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Initial status</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Report event }
      </button>
    </mat-dialog-actions>
  `,
})
export class AdverseEventFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly events = inject(AdverseEventService);
  private readonly patientSvc = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<AdverseEventFormDialogComponent>);
  readonly data = inject<AeDialogData>(MAT_DIALOG_DATA);

  readonly severities = SEVERITIES;
  readonly statuses = ADVERSE_EVENT_STATUSES;
  readonly today = new Date();
  readonly saving = signal(false);
  readonly patients = signal<PatientResponse[]>([]);

  readonly form = this.fb.group({
    patientId: this.fb.control<number | null>(this.data.patientId ?? null, [Validators.required]),
    severity: this.fb.control('', [Validators.required]),
    eventDate: this.fb.control<Date | null>(null),
    description: this.fb.control('', [Validators.required]),
    status: this.fb.control('Reported'),
  });

  private readonly enrollmentsSvc = inject(EnrollmentService);

  constructor() {
    forkJoin({
      patients: this.patientSvc.list({ page: 0, size: 200, sort: 'patientId,desc' }),
      enrollments: this.enrollmentsSvc.getByTrial(this.data.trial.trialId, { page: 0, size: 200 })
    }).subscribe({
      next: (res) => {
        const enrolledIds = new Set(res.enrollments.content.map(e => e.patientId));
        this.patients.set(res.patients.content.filter(p => enrolledIds.has(p.patientId)));
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.events.report({
      trialId: this.data.trial.trialId,
      patientId: v.patientId!,
      severity: v.severity!,
      eventDate: toIsoDate(v.eventDate),
      description: v.description!,
      status: v.status || undefined,
    }).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Adverse event reported.');
        this.ref.close(saved);
      },
      error: (err) => {
        this.saving.set(false);
        this.ui.error(err?.error?.message || err?.message || 'Failed to report adverse event');
      },
    });
  }
}
