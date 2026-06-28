import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DoctorContextService } from '../doctor.context';
import { VisitService } from '../../clinical/services/visits.service';
import { PatientService } from '../../clinical/services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { ParticipantVisitSummaryResponse } from '../../../core/models/domain.models';
import { toIsoDate } from '../../clinical/clinical.util';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ctms-schedule-visit-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Schedule Participant Visit</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="padding-top:6px; display:flex; flex-direction:column; gap:16px;">
        
        <div class="card">
          <h3 style="margin-top:0;margin-bottom:12px;font-size:1.1rem;color:#0f172a;">Participant Information</h3>
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Patient ID</mat-label>
            <input matInput type="number" formControlName="patientId" placeholder="Enter Patient ID" />
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          
          @if (loadingPatient()) {
            <div style="display:flex;align-items:center;gap:8px;color:#64748b;margin-top:-8px;margin-bottom:8px">
              <mat-spinner diameter="16"></mat-spinner> Looking up participant...
            </div>
          } @else if (patientError()) {
            <div style="color:#ef4444;font-size:0.85rem;margin-top:-8px;margin-bottom:8px;display:flex;align-items:center;gap:4px">
              <mat-icon style="font-size:16px;width:16px;height:16px">error</mat-icon> {{ patientError() }}
            </div>
          }

          @if (summary(); as s) {
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <div style="font-size:0.8rem;color:#64748b">Name</div>
                  <div style="font-weight:500">{{ s.patientName }}</div>
                </div>
                <div>
                  <div style="font-size:0.8rem;color:#64748b">Enrollment Status</div>
                  <div><span class="chip chip--gray">{{ s.enrollmentStatus }}</span></div>
                </div>
                <div>
                  <div style="font-size:0.8rem;color:#64748b">Trial</div>
                  <div style="font-weight:500">{{ s.trialCode }}</div>
                </div>
                <div>
                  <div style="font-size:0.8rem;color:#64748b">Trial Name</div>
                  <div style="font-weight:500">{{ s.trialName }}</div>
                </div>
              </div>
            </div>
          }
        </div>

        @if (summary(); as s) {
          <div class="card">
            <h3 style="margin-top:0;margin-bottom:12px;font-size:1.1rem;color:#0f172a;">Visit Information</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Visit Type</mat-label>
                <mat-select formControlName="visitType">
                  @for (t of visitTypes; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
                </mat-select>
                @if (form.controls.visitType.hasError('required')) { <mat-error>Required</mat-error> }
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Scheduled Date</mat-label>
                <input matInput [matDatepicker]="dp" formControlName="scheduledDate" />
                <mat-datepicker-toggle matIconSuffix [for]="dp" />
                <mat-datepicker #dp />
                @if (form.controls.scheduledDate.hasError('required')) { <mat-error>Required</mat-error> }
              </mat-form-field>

              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3" placeholder="Optional visit notes"></textarea>
              </mat-form-field>
            </div>
          </div>

          <div class="card" style="background:#f0f9ff;border-color:#bae6fd">
            <h3 style="margin-top:0;margin-bottom:12px;font-size:1.1rem;color:#0369a1;">Trial Visit Summary</h3>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;text-align:center">
              <div>
                <div style="font-size:1.5rem;font-weight:600;color:#0369a1">{{ s.totalTrialVisits }}</div>
                <div style="font-size:0.75rem;color:#0ea5e9;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Total</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:600;color:#16a34a">{{ s.completedVisits }}</div>
                <div style="font-size:0.75rem;color:#22c55e;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Completed</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:600;color:#d97706">{{ s.remainingVisits }}</div>
                <div style="font-size:0.75rem;color:#f59e0b;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Remaining</div>
              </div>
              <div>
                <div style="font-size:1.5rem;font-weight:600;color:#4f46e5">{{ s.nextExpectedVisitNumber ? '#' + s.nextExpectedVisitNumber : '—' }}</div>
                <div style="font-size:0.75rem;color:#6366f1;text-transform:uppercase;font-weight:600;letter-spacing:0.5px">Next Visit</div>
              </div>
            </div>
            @if (s.nextExpectedVisitDate) {
              <div style="text-align:center;margin-top:12px;font-size:0.85rem;color:#0369a1">
                Next visit is scheduled for <strong>{{ s.nextExpectedVisitDate | date:'mediumDate' }}</strong>
              </div>
            }
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid || !summary() || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Schedule Visit }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
  `]
})
export class ScheduleVisitDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ctx = inject(DoctorContextService);
  private readonly visitSvc = inject(VisitService);
  private readonly patientSvc = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<ScheduleVisitDialogComponent>);

  readonly visitTypes = ['Screening', 'Baseline', 'Follow Up', 'Interim', 'Final', 'Unscheduled'];
  
  readonly form = this.fb.group({
    patientId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    visitType: this.fb.control('', [Validators.required]),
    scheduledDate: this.fb.control<Date | null>(null, [Validators.required]),
    notes: this.fb.control(''),
  });

  readonly loadingPatient = signal(false);
  readonly patientError = signal<string | null>(null);
  readonly summary = signal<ParticipantVisitSummaryResponse | null>(null);
  readonly saving = signal(false);

  private doctorId: number | null = null;

  constructor() {
    this.ctx.profile().subscribe(doc => this.doctorId = doc.doctorId);

    this.form.controls.patientId.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.loadingPatient.set(false);
        this.patientError.set(null);
        this.summary.set(null);
      }),
      filter(id => id != null && id > 0),
      tap(() => this.loadingPatient.set(true)),
      switchMap(id => this.patientSvc.visitSummary(id!).pipe(
        catchError(err => {
          this.patientError.set(err.error?.message || 'Participant not found or unauthorized.');
          return of(null);
        })
      ))
    ).subscribe(res => {
      this.loadingPatient.set(false);
      if (res) {
        this.summary.set(res);
      }
    });
  }

  save(): void {
    if (this.form.invalid || !this.summary() || !this.doctorId) return;
    this.saving.set(true);
    
    const v = this.form.getRawValue();
    const s = this.summary()!;
    
    // Auto increment visit number based on total visits + 1
    const nextVisitNum = s.totalTrialVisits + 1;

    this.visitSvc.schedule({
      trialId: s.trialId,
      patientId: s.patientId,
      doctorId: this.doctorId,
      visitNumber: nextVisitNum,
      visitType: v.visitType!,
      scheduledDate: toIsoDate(v.scheduledDate)!,
      notes: v.notes || undefined
    }).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Visit scheduled successfully.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false)
    });
  }
}
