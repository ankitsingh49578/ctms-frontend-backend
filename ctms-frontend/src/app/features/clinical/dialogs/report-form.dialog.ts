import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InsightsService } from '../services/insights.service';
import { TrialService } from '../services/trials.service';
import { UiService } from '../../../core/services/ui.service';
import { TrialResponse } from '../../../core/models/domain.models';
import { REPORT_TYPES } from '../../../core/models/enums';

@Component({
  selector: 'ctms-report-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Generate report</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid" style="padding-top:6px">
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Report name</mat-label>
          <input matInput formControlName="reportName" placeholder="e.g. Q1 Recruitment Summary" />
          @if (form.controls.reportName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Report type</mat-label>
          <mat-select formControlName="reportType">
            @for (t of types; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
          </mat-select>
          @if (form.controls.reportType.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Trial (optional)</mat-label>
          <mat-select formControlName="trialId">
            <mat-option [value]="null">— All trials —</mat-option>
            @for (t of trials(); track t.trialId) {
              <mat-option [value]="t.trialId">{{ t.trialCode }} — {{ t.trialName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Generate }
      </button>
    </mat-dialog-actions>
  `,
})
export class ReportFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly insights = inject(InsightsService);
  private readonly trialSvc = inject(TrialService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<ReportFormDialogComponent>);

  readonly types = REPORT_TYPES;
  readonly saving = signal(false);
  readonly trials = signal<TrialResponse[]>([]);

  readonly form = this.fb.group({
    reportName: this.fb.control('', [Validators.required]),
    reportType: this.fb.control('', [Validators.required]),
    trialId: this.fb.control<number | null>(null),
  });

  constructor() {
    this.trialSvc.list({ page: 0, size: 200, sort: 'trialName,asc' }).subscribe({
      next: (p) => this.trials.set(p.content),
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.insights.generateReport({
      reportName: v.reportName!,
      reportType: v.reportType!,
      trialId: v.trialId ?? undefined,
    }).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success('Report generated.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
