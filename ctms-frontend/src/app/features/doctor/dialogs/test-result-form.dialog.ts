import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { TestResultService } from '../../clinical/services/safety.service';
import { UiService } from '../../../core/services/ui.service';
import { VisitResponse } from '../../../core/models/domain.models';
import { TEST_RESULT_STATUSES } from '../../../core/models/enums';
import { toIsoDate } from '../../clinical/clinical.util';

@Component({
  selector: 'ctms-test-result-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule, MatIconModule
  ],
  template: `
    <div class="medical-modal">
      <div class="modal-header">
        <h2 mat-dialog-title style="margin:0"><mat-icon style="vertical-align: middle">biotech</mat-icon> Record Test Result</h2>
        <p class="modal-subtitle">Clinical investigator panel</p>
      </div>
      
      <mat-dialog-content>
        <form [formGroup]="form" class="medical-form">
          <!-- Patient Summary Section -->
          <div class="section-card">
            <h3 class="section-title"><mat-icon>person</mat-icon> Patient Summary</h3>
            <div class="section-content">
              <mat-form-field appearance="outline" class="field-full" style="width:100%">
                <mat-label>Select Visit / Patient</mat-label>
                <mat-select formControlName="visitId">
                  @for (v of visits(); track v.visitId) {
                    <mat-option [value]="v.visitId">
                      Visit #{{ v.visitId }} — {{ v.patientName || 'Patient' }} (#{{ v.patientId }}) — {{ v.trialName || 'Unknown Trial' }}
                    </mat-option>
                  }
                </mat-select>
                @if (form.controls.visitId.hasError('required')) { <mat-error>Required</mat-error> }
                @if (!visits().length) { <mat-hint>No active patients assigned to you yet.</mat-hint> }
              </mat-form-field>

              @if (selectedVisit(); as visit) {
                <div class="patient-details-card">
                  <div class="detail-row"><span>Patient Name:</span> <strong>{{ visit.patientName }}</strong></div>
                  <div class="detail-row"><span>Patient ID:</span> <strong>{{ visit.patientId }}</strong></div>
                  <div class="detail-row"><span>Trial Name:</span> <strong>{{ visit.trialName }}</strong></div>
                  <div class="detail-row"><span>Visit Number:</span> <strong>{{ visit.visitId }}</strong></div>
                </div>
              }
            </div>
          </div>

          <!-- Test Information Section -->
          <div class="section-card">
            <h3 class="section-title"><mat-icon>science</mat-icon> Test Information</h3>
            <div class="section-content form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Test Name</mat-label>
                <input matInput formControlName="testName" placeholder="e.g. CBC, Lipid Panel" />
                @if (form.controls.testName.hasError('required')) { <mat-error>Required</mat-error> }
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Test Type</mat-label>
                <mat-select formControlName="testType">
                  <mat-option value="Blood">Blood</mat-option>
                  <mat-option value="Urine">Urine</mat-option>
                  <mat-option value="Imaging">Imaging</mat-option>
                  <mat-option value="Physical">Physical Exam</mat-option>
                  <mat-option value="Other">Other</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Result Value</mat-label>
                <input matInput formControlName="resultValue" placeholder="e.g. 120/80, 5.4" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Unit</mat-label>
                <input matInput formControlName="unit" placeholder="e.g. mg/dL" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Reference Range</mat-label>
                <input matInput formControlName="referenceRange" placeholder="e.g. 4.0 - 6.0" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Result Status</mat-label>
                <mat-select formControlName="resultStatus">
                  @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="field-full">
                <mat-label>Collected Date</mat-label>
                <input matInput [matDatepicker]="dp" [max]="today" formControlName="collectedDate" />
                <mat-datepicker-toggle matIconSuffix [for]="dp" />
                <mat-datepicker #dp />
              </mat-form-field>
            </div>
          </div>

          <!-- Interpretation Section -->
          <div class="section-card">
            <h3 class="section-title"><mat-icon>psychology</mat-icon> Interpretation</h3>
            <div class="section-content form-grid">
              <mat-form-field appearance="outline" class="field-full" style="width:100%">
                <mat-label>Clinical Notes</mat-label>
                <textarea matInput rows="2" formControlName="notes" placeholder="General observations..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="field-full" style="width:100%">
                <mat-label>Clinical Interpretation</mat-label>
                <textarea matInput rows="2" formControlName="clinicalInterpretation" placeholder="Medical interpretation of the result..."></textarea>
              </mat-form-field>
            </div>
          </div>

        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
        <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid || saving()">
          @if (saving()) { <mat-spinner diameter="18" /> } @else { Save Result }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .medical-modal {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }
    .modal-header {
      padding: 20px 24px 16px;
      background: #0f172a;
      color: white;
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #f8fafc;
    }
    .modal-subtitle {
      margin: 4px 0 0 36px;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .medical-form {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .section-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .section-title {
      margin: 0;
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title mat-icon {
      color: #475569;
    }
    .section-content {
      padding: 20px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .field-full {
      grid-column: 1 / -1;
    }
    .patient-details-card {
      margin-top: 16px;
      padding: 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      color: #166534;
      font-size: 0.95rem;
    }
    .detail-row {
      display: flex;
      flex-direction: column;
    }
    .detail-row span {
      font-size: 0.8rem;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .modal-actions {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      margin: 0;
    }
  `]
})
export class TestResultFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ctx = inject(DoctorContextService);
  private readonly visitSvc = inject(VisitService);
  private readonly results = inject(TestResultService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<TestResultFormDialogComponent>);

  readonly statuses = TEST_RESULT_STATUSES;
  readonly today = new Date();
  readonly saving = signal(false);
  readonly visits = signal<VisitResponse[]>([]);
  private doctorId: number | null = null;

  readonly form = this.fb.group({
    visitId: this.fb.control<number | null>(null, [Validators.required]),
    testName: this.fb.control('', [Validators.required]),
    testType: this.fb.control('Blood'),
    resultStatus: this.fb.control('Normal'),
    resultValue: this.fb.control(''),
    unit: this.fb.control(''),
    referenceRange: this.fb.control(''),
    collectedDate: this.fb.control<Date | null>(new Date()),
    notes: this.fb.control(''),
    clinicalInterpretation: this.fb.control('')
  });

  private readonly selectedVisitId = signal<number | null>(null);
  
  readonly selectedVisit = computed(() => {
    const id = this.selectedVisitId();
    return this.visits().find((v) => v.visitId === id) ?? null;
  });

  constructor() {
    this.form.controls.visitId.valueChanges.subscribe((v) => this.selectedVisitId.set(v));
    this.ctx.profile().subscribe({
      next: (doc) => {
        this.doctorId = doc.doctorId;
        this.visitSvc.byDoctor(doc.doctorId).subscribe({ next: (list) => this.visits.set(list) });
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.doctorId == null) return;
    const visit = this.selectedVisit();
    if (visit == null) { this.ui.error('Select a visit to attach this result to.'); return; }
    this.saving.set(true);
    const v = this.form.getRawValue();
    
    // We send only backend-supported fields
    this.results.record({
      visitId: v.visitId!,
      patientId: visit.patientId,
      doctorId: this.doctorId,
      testName: v.testName!,
      resultValue: v.resultValue || undefined,
      unit: v.unit || undefined,
      resultStatus: v.resultStatus || undefined,
      collectedDate: toIsoDate(v.collectedDate),
    }).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Test result recorded successfully.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
