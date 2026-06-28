import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from '../services/portal.service';
import { UiService } from '../../../core/services/ui.service';
import { EnrollmentResponse } from '../../../core/models/domain.models';

@Component({
  selector: 'ctms-portal-adverse-event-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Report Adverse Event</h1>
          <p class="page__subtitle">Provide details about the safety event or side effect.</p>
        </div>
      </header>

      <div class="card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <h3 style="margin:0 0 14px">Event Information</h3>
          
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Select Trial</mat-label>
              <mat-select formControlName="trialId" required>
                @if (myEnrollments().length === 0) {
                  <mat-option disabled>No active trials available</mat-option>
                }
                @for (e of myEnrollments(); track e.enrollmentId) {
                  <mat-option [value]="e.trialId">{{ e.trialName || 'Trial #' + e.trialId }} ({{ e.status }})</mat-option>
                }
              </mat-select>
              <mat-error>Please select a trial</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Severity</mat-label>
              <mat-select formControlName="severity" required>
                <mat-option value="Mild">Mild</mat-option>
                <mat-option value="Moderate">Moderate</mat-option>
                <mat-option value="Severe">Severe</mat-option>
                <mat-option value="Life Threatening">Life Threatening</mat-option>
              </mat-select>
              <mat-error>Severity is required</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Event Title (Optional)</mat-label>
              <input matInput formControlName="title" placeholder="e.g., Severe Headaches" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date (Optional)</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Symptoms Experienced</mat-label>
              <textarea matInput formControlName="symptoms" rows="2" placeholder="Describe your symptoms..."></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Detailed Description</mat-label>
              <textarea matInput formControlName="description" required rows="4" placeholder="Provide a detailed description of the event..."></textarea>
              <mat-error>Description is required</mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="field-full">
              <mat-label>Actions Taken (Optional)</mat-label>
              <textarea matInput formControlName="actionsTaken" rows="2" placeholder="What actions did you take? (e.g. took medication)"></textarea>
            </mat-form-field>
          </div>
          
          <div style="margin-top: 12px; margin-bottom: 24px;">
            <mat-checkbox formControlName="requiresMedicalAttention" color="warn">
              This event required immediate medical attention
            </mat-checkbox>
          </div>

          <div class="row-actions" style="margin-top:8px">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Submitting...' : 'Submit Report' }}
            </button>
            <button mat-button type="button" (click)="location.back()" [disabled]="saving()">Cancel</button>
          </div>
        </form>
      </div>
    </section>
  `
})
export class PortalAdverseEventReportComponent {
  readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly portal = inject(PortalService);
  private readonly ui = inject(UiService);
  private readonly router = inject(Router);

  readonly myEnrollments = signal<EnrollmentResponse[]>([]);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    trialId: [null as number | null, Validators.required],
    title: [''],
    severity: ['', Validators.required],
    startDate: [null as Date | null],
    endDate: [null as Date | null],
    symptoms: [''],
    description: ['', Validators.required],
    actionsTaken: [''],
    requiresMedicalAttention: [false]
  });

  constructor() {
    this.portal.myEnrollments().subscribe((enrollments) => {
      // Allow 'Screening', 'Enrolled' and 'Completed' as valid trial contexts for reporting.
      // Often symptoms can appear after completion, or during screening.
      this.myEnrollments.set(enrollments.filter(e => !['Withdrawn', 'Terminated'].includes(e.status)));
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.getRawValue();
    
    // Default event date to now
    const eventDate = new Date().toISOString();

    const payload = {
      trialId: val.trialId!,
      title: val.title,
      severity: val.severity,
      startDate: val.startDate ? val.startDate.toISOString() : undefined,
      endDate: val.endDate ? val.endDate.toISOString() : undefined,
      symptoms: val.symptoms,
      description: val.description,
      actionsTaken: val.actionsTaken,
      requiresMedicalAttention: val.requiresMedicalAttention,
      eventDate,
      attachments: '[]' // Hardcoded as requested
    };

    this.portal.reportAdverseEvent(payload).subscribe({
      next: () => {
        this.ui.success('Adverse event reported successfully');
        this.router.navigate(['/portal/adverse-events']);
      },
      error: (err) => {
        this.saving.set(false);
        this.ui.error('Failed to report event: ' + err.error?.message);
      }
    });
  }
}
