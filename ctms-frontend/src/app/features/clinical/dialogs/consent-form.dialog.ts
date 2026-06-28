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
import { ConsentService } from '../services/consents.service';
import { PatientService } from '../services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { PatientResponse, TrialResponse } from '../../../core/models/domain.models';
import { CONSENT_STATUSES } from '../../../core/models/enums';
import { toIsoDate } from '../clinical.util';

interface ConsentDialogData { trial: TrialResponse; }

@Component({
  selector: 'ctms-consent-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>New consent record</h2>
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
          <mat-label>Consent version</mat-label>
          <input matInput formControlName="consentVersion" placeholder="e.g. v1.0" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Consent date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="consentDate" />
          <mat-datepicker-toggle matIconSuffix [for]="dp" />
          <mat-datepicker #dp />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Initial status</mat-label>
          <mat-select formControlName="consentStatus">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>File path (optional)</mat-label>
          <input matInput formControlName="filePath" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Create }
      </button>
    </mat-dialog-actions>
  `,
})
export class ConsentFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly consents = inject(ConsentService);
  private readonly patientSvc = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<ConsentFormDialogComponent>);
  readonly data = inject<ConsentDialogData>(MAT_DIALOG_DATA);

  readonly statuses = CONSENT_STATUSES;
  readonly saving = signal(false);
  readonly patients = signal<PatientResponse[]>([]);

  readonly form = this.fb.group({
    patientId: this.fb.control<number | null>(null, [Validators.required]),
    consentVersion: this.fb.control(''),
    consentDate: this.fb.control<Date | null>(null),
    consentStatus: this.fb.control('Pending'),
    filePath: this.fb.control(''),
  });

  constructor() {
    this.patientSvc.list({ page: 0, size: 200, sort: 'patientId,desc' }).subscribe({
      next: (p) => this.patients.set(p.content),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.consents.create({
      trialId: this.data.trial.trialId,
      patientId: v.patientId!,
      consentVersion: v.consentVersion || undefined,
      consentDate: toIsoDate(v.consentDate),
      consentStatus: v.consentStatus || undefined,
      filePath: v.filePath || undefined,
    }).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Consent record created.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
