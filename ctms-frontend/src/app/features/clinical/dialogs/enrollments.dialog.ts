import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PatientService, EnrollmentService } from '../services/patients.service';
import { TrialService } from '../services/trials.service';
import { UiService } from '../../../core/services/ui.service';
import { EnrollmentResponse, PatientResponse, TrialResponse } from '../../../core/models/domain.models';
import { ENROLLMENT_STATUSES, statusTone } from '../../../core/models/enums';
import { PickStatusDialogComponent, PickStatusData } from './pick-status.dialog';

interface EnrollDialogData { patient: PatientResponse; canManage: boolean; }

@Component({
  selector: 'ctms-enrollments-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatSelectModule, MatProgressSpinnerModule, MatIconModule, MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>Enrollments</h2>
    <mat-dialog-content>
      <p class="muted" style="margin:0 0 14px">{{ data.patient.fullName }} ({{ data.patient.patientCode }})</p>

      @if (loading()) {
        <div class="state" style="padding:24px"><mat-spinner diameter="28" /></div>
      } @else if (rows().length) {
        <div class="table-wrap" style="margin-bottom:6px">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="text-align:left;color:var(--ctms-ink-soft);font-size:.78rem">
                <th style="padding:6px 8px">Trial</th><th style="padding:6px 8px">Enrolled</th>
                <th style="padding:6px 8px">Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (e of rows(); track e.enrollmentId) {
                <tr style="border-top:1px solid var(--ctms-border)">
                  <td style="padding:8px">Trial #{{ e.trialId }}</td>
                  <td style="padding:8px">{{ e.enrollmentDate ? (e.enrollmentDate | date:'mediumDate') : '—' }}</td>
                  <td style="padding:8px"><span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span></td>
                  <td style="padding:8px;text-align:right">
                    @if (data.canManage) {
                      <button mat-button (click)="changeStatus(e)">Status</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="muted" style="margin:0 0 8px">This patient is not enrolled in any trial yet.</p>
      }

      @if (data.canManage) {
        <mat-divider style="margin:16px 0" />
        <h3 style="margin:0 0 10px;font-size:1rem">Enroll into a trial</h3>
        <form [formGroup]="form" style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
          <mat-form-field appearance="outline" style="flex:1 1 260px">
            <mat-label>Trial</mat-label>
            <mat-select formControlName="trialId">
              @for (t of trials(); track t.trialId) {
                <mat-option [value]="t.trialId">{{ t.trialCode }} — {{ t.trialName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-flat-button (click)="enroll()" [disabled]="form.invalid || enrolling()" style="margin-top:4px">
            @if (enrolling()) { <mat-spinner diameter="18" /> } @else { <span style="display:inline-flex;align-items:center;gap:6px"><mat-icon>how_to_reg</mat-icon>Enroll</span> }
          </button>
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class EnrollmentsDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patients = inject(PatientService);
  private readonly enrollments = inject(EnrollmentService);
  private readonly trialSvc = inject(TrialService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);
  readonly data = inject<EnrollDialogData>(MAT_DIALOG_DATA);

  readonly tone = statusTone;
  readonly loading = signal(true);
  readonly enrolling = signal(false);
  readonly rows = signal<EnrollmentResponse[]>([]);
  readonly trials = signal<TrialResponse[]>([]);

  readonly form = this.fb.group({
    trialId: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    this.refresh();
    if (this.data.canManage) {
      this.trialSvc.list({ page: 0, size: 200, sort: 'trialName,asc' }).subscribe({
        next: (p) => this.trials.set(p.content),
      });
    }
  }

  refresh(): void {
    this.loading.set(true);
    this.patients.enrollments(this.data.patient.patientId).subscribe({
      next: (list) => { this.rows.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  enroll(): void {
    if (this.form.invalid) return;
    this.enrolling.set(true);
    this.enrollments.enroll({ patientId: this.data.patient.patientId, trialId: this.form.getRawValue().trialId! }).subscribe({
      next: () => {
        this.enrolling.set(false);
        this.ui.success('Patient enrolled.');
        this.form.reset({ trialId: null });
        this.refresh();
      },
      error: () => this.enrolling.set(false),
    });
  }

  changeStatus(e: EnrollmentResponse): void {
    const data: PickStatusData = {
      title: `Enrollment status — Trial #${e.trialId}`, label: 'Status', current: e.status,
      options: ENROLLMENT_STATUSES, confirmLabel: 'Update',
    };
    this.dialog.open(PickStatusDialogComponent, { data, width: '380px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((status?: string) => {
        if (!status || status === e.status) return;
        this.enrollments.updateStatus(e.enrollmentId, { status }).subscribe({
          next: () => { this.ui.success('Enrollment status updated.'); this.refresh(); },
        });
      });
  }
}
