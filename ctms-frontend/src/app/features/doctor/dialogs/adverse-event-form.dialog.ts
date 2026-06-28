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
import { AdverseEventService } from '../../clinical/services/safety.service';
import { PatientService } from '../../clinical/services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { TrialResponse, PatientResponse, EnrollmentResponse } from '../../../core/models/domain.models';
import { ADVERSE_EVENT_STATUSES, SEVERITIES } from '../../../core/models/enums';
import { toIsoDate } from '../../clinical/clinical.util';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

interface DoctorAeData { trials: TrialResponse[]; trialId: number | null; }

@Component({
  selector: 'ctms-doctor-ae-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Report adverse event</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid" style="padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>Trial</mat-label>
          <mat-select formControlName="trialId">
            @for (t of data.trials; track t.trialId) {
              <mat-option [value]="t.trialId">{{ t.trialCode }} — {{ t.trialName }}</mat-option>
            }
          </mat-select>
          @if (form.controls.trialId.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Patient ID</mat-label>
          <input matInput type="number" formControlName="patientId" />
          @if (form.controls.patientId.hasError('required')) { <mat-error>Required</mat-error> }
          <mat-hint>From the patient's visit or chart</mat-hint>
        </mat-form-field>
        
        @if (loadingPatient()) {
          <div class="field-full" style="display:flex;align-items:center;gap:8px;padding:12px;background:#f8fafc;border-radius:8px">
            <mat-spinner diameter="20"></mat-spinner>
            <span class="muted" style="font-size:0.9rem">Fetching patient details...</span>
          </div>
        } @else if (patientError()) {
          <div class="field-full" style="padding:12px;background:#fee2e2;color:#991b1b;border-radius:8px;font-size:0.9rem">
            {{ patientError() }}
          </div>
        } @else if (patientDetails()) {
          <div class="field-full" style="padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:16px">
            <h4 style="margin:0 0 8px;color:#166534">Patient Summary</h4>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:0.9rem;color:#166534">
              <div><strong>Name:</strong> {{ patientDetails()?.patient?.fullName }}</div>
              <div><strong>Status:</strong> {{ patientDetails()?.patient?.status }}</div>
              @if (patientDetails()?.enrollment) {
                <div><strong>Enrolled In:</strong> {{ patientDetails()?.enrollment?.trialName || 'Trial #' + patientDetails()?.enrollment?.trialId }} ({{ patientDetails()?.enrollment?.status }})</div>
              } @else {
                <div style="color:#991b1b"><strong>Warning:</strong> No active trial enrollments found.</div>
              }
            </div>
          </div>
        }
        
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
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving() || !!patientError() || !patientDetails()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Report event }
      </button>
    </mat-dialog-actions>
  `,
})
export class DoctorAdverseEventFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly events = inject(AdverseEventService);
  private readonly patientService = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<DoctorAdverseEventFormDialogComponent>);
  readonly data = inject<DoctorAeData>(MAT_DIALOG_DATA);

  readonly severities = SEVERITIES;
  readonly statuses = ADVERSE_EVENT_STATUSES;
  readonly today = new Date();
  readonly saving = signal(false);

  readonly form = this.fb.group({
    trialId: this.fb.control<number | null>(this.data.trialId, [Validators.required]),
    patientId: this.fb.control<number | null>(null, [Validators.required]),
    severity: this.fb.control('', [Validators.required]),
    eventDate: this.fb.control<Date | null>(null),
    description: this.fb.control('', [Validators.required]),
    status: this.fb.control('Reported'),
  });

  readonly loadingPatient = signal(false);
  readonly patientError = signal<string | null>(null);
  readonly patientDetails = signal<{ patient: PatientResponse, enrollment?: EnrollmentResponse } | null>(null);

  constructor() {
    this.form.controls.patientId.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.loadingPatient.set(false);
        this.patientError.set(null);
        this.patientDetails.set(null);
      }),
      filter(id => id != null && id > 0),
      tap(() => this.loadingPatient.set(true)),
      switchMap(id => forkJoin({
        patient: this.patientService.get(id!),
        enrollments: this.patientService.enrollments(id!)
      }).pipe(
        catchError(err => {
          this.patientError.set('This patient is not assigned to you.');
          return of(null);
        })
      ))
    ).subscribe((res: any) => {
      this.loadingPatient.set(false);
      if (res) {
        const enroll = res.enrollments?.length ? res.enrollments[0] : undefined;
        this.patientDetails.set({ patient: res.patient, enrollment: enroll });
        if (enroll && !this.form.controls.trialId.value) {
          this.form.controls.trialId.setValue(enroll.trialId);
        }
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.events.report({
      trialId: v.trialId!,
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
      error: () => this.saving.set(false),
    });
  }
}
