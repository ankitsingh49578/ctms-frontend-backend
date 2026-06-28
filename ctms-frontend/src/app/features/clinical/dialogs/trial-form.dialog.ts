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
import { TrialService } from '../services/trials.service';
import { UiService } from '../../../core/services/ui.service';
import { TrialResponse } from '../../../core/models/domain.models';
import { TRIAL_PHASES, TRIAL_STATUSES } from '../../../core/models/enums';
import { toIsoDate } from '../clinical.util';

@Component({
  selector: 'ctms-trial-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ editing ? 'Edit trial' : 'New trial' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid" style="padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>Trial code</mat-label>
          <input matInput formControlName="trialCode" placeholder="TRL-XXX-01" />
          @if (form.controls.trialCode.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Phase</mat-label>
          <mat-select formControlName="phase">
            @for (p of phases; track p) { <mat-option [value]="p">Phase {{ p }}</mat-option> }
          </mat-select>
          @if (form.controls.phase.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Trial name</mat-label>
          <input matInput formControlName="trialName" />
          @if (form.controls.trialName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Description</mat-label>
          <textarea matInput rows="2" formControlName="description"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Start date</mat-label>
          <input matInput [matDatepicker]="sp" formControlName="startDate" />
          <mat-datepicker-toggle matIconSuffix [for]="sp" />
          <mat-datepicker #sp />
          @if (form.controls.startDate.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>End date (optional)</mat-label>
          <input matInput [matDatepicker]="ep" formControlName="endDate" />
          <mat-datepicker-toggle matIconSuffix [for]="ep" />
          <mat-datepicker #ep />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined" [disabled]="saving()">Cancel</button>
      <button mat-flat-button (click)="save()" [disabled]="form.invalid || saving()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { {{ editing ? 'Save' : 'Create trial' }} }
      </button>
    </mat-dialog-actions>
  `,
})
export class TrialFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly trials = inject(TrialService);
  private readonly ui = inject(UiService);
  private readonly ref = inject(MatDialogRef<TrialFormDialogComponent>);
  readonly existing = inject<TrialResponse | null>(MAT_DIALOG_DATA);

  readonly phases = TRIAL_PHASES;
  readonly statuses = TRIAL_STATUSES;
  readonly editing = !!this.existing;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    trialCode: this.fb.control(this.existing?.trialCode ?? '', [Validators.required]),
    trialName: this.fb.control(this.existing?.trialName ?? '', [Validators.required]),
    phase: this.fb.control(this.existing?.phase ?? 'I', [Validators.required]),
    description: this.fb.control(this.existing?.description ?? ''),
    startDate: this.fb.control<Date | null>(this.existing?.startDate ? new Date(this.existing.startDate) : null, [Validators.required]),
    endDate: this.fb.control<Date | null>(this.existing?.endDate ? new Date(this.existing.endDate) : null),
    status: this.fb.control(this.existing?.status ?? 'Planned'),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const common = {
      trialCode: v.trialCode!,
      trialName: v.trialName!,
      phase: v.phase!,
      description: v.description || undefined,
      startDate: toIsoDate(v.startDate),
      endDate: toIsoDate(v.endDate),
      status: v.status || undefined,
    };
    const req = this.editing
      ? this.trials.update(this.existing!.trialId, { ...common, status: v.status! })
      : this.trials.create({ ...common, startDate: toIsoDate(v.startDate)! });
    req.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.ui.success(this.editing ? 'Trial updated.' : 'Trial created.');
        this.ref.close(saved);
      },
      error: () => this.saving.set(false),
    });
  }
}
