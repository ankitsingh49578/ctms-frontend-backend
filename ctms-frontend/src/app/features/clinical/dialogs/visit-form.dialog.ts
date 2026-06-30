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
import { VisitService } from '../services/visits.service';
import { PatientService } from '../services/patients.service';
import { DirectoryService } from '../services/insights.service';
import { UiService } from '../../../core/services/ui.service';
import { DoctorResponse, PatientResponse, TrialResponse } from '../../../core/models/domain.models';
import { toIsoDate } from '../clinical.util';

interface VisitDialogData { trial: TrialResponse; }

@Component({
  selector: 'ctms-visit-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Schedule visit</h2>
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
          <mat-label>Visit number</mat-label>
          <input matInput type="number" formControlName="visitNumber" />
          @if (form.controls.visitNumber.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Visit type</mat-label>
          <input matInput formControlName="visitType" placeholder="e.g. Screening, Follow-up" />
          @if (form.controls.visitType.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Scheduled date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="scheduledDate" />
          <mat-datepicker-toggle matIconSuffix [for]="dp" />
          <mat-datepicker #dp />
          @if (form.controls.scheduledDate.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Assigned doctor</mat-label>
          <mat-select formControlName="doctorId">
            @for (d of doctors(); track d.doctorId) {
              <mat-option [value]="d.doctorId">{{ d.doctorName }}</mat-option>
            }
          </mat-select>
          @if (form.controls.doctorId.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Window start (optional)</mat-label>
          <input matInput [matDatepicker]="ws" formControlName="windowStart" />
          <mat-datepicker-toggle matIconSuffix [for]="ws" />
          <mat-datepicker #ws />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Window end (optional)</mat-label>
          <input matInput [matDatepicker]="we" formControlName="windowEnd" />
          <mat-datepicker-toggle matIconSuffix [for]="we" />
          <mat-datepicker #we />
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Notes (optional)</mat-label>
          <textarea matInput rows="2" formControlName="notes"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Schedule }
      </button>
    </mat-dialog-actions>
  `,
})
export class VisitFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly visits = inject(VisitService);
  private readonly patientSvc = inject(PatientService);
  private readonly directory = inject(DirectoryService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<VisitFormDialogComponent>);
  readonly data = inject<VisitDialogData>(MAT_DIALOG_DATA);

  readonly saving = signal(false);
  readonly patients = signal<PatientResponse[]>([]);
  readonly doctors = signal<DoctorResponse[]>([]);

  readonly form = this.fb.group({
    patientId: this.fb.control<number | null>(null, [Validators.required]),
    visitNumber: this.fb.control<number | null>(1, [Validators.required]),
    visitType: this.fb.control('', [Validators.required]),
    scheduledDate: this.fb.control<Date | null>(null, [Validators.required]),
    doctorId: this.fb.control<number | null>(null, [Validators.required]),
    windowStart: this.fb.control<Date | null>(null),
    windowEnd: this.fb.control<Date | null>(null),
    notes: this.fb.control(''),
  });

  constructor() {
    this.patientSvc.list({ page: 0, size: 200, sort: 'patientId,desc' }).subscribe({
      next: (p) => this.patients.set(p.content),
    });
    this.directory.allDoctors().subscribe({ next: (d) => this.doctors.set(d) });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.visits.schedule({
      trialId: this.data.trial.trialId,
      patientId: v.patientId!,
      doctorId: v.doctorId!,
      visitNumber: v.visitNumber!,
      visitType: v.visitType!,
      scheduledDate: toIsoDate(v.scheduledDate)!,
      windowStart: toIsoDate(v.windowStart),
      windowEnd: toIsoDate(v.windowEnd),
      notes: v.notes || undefined,
    }).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Visit scheduled.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
