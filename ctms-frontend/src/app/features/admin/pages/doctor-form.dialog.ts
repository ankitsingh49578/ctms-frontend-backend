import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StaffDirectoryService } from '../services/staff-directory.service';
import { UiService } from '../../../core/services/ui.service';
import { DoctorResponse } from '../../../core/models/domain.models';

export interface DoctorFormData {
  /** Present => edit; absent => create. */
  doctor?: DoctorResponse;
}

/**
 * Create / edit a doctor directory record. On create the doctor must be linked
 * to an existing user account (userId); the link is immutable afterwards, so the
 * field is shown read-only in edit mode.
 */
@Component({
  selector: 'ctms-doctor-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit doctor' : 'New doctor' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:grid;gap:4px;padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>Linked user ID</mat-label>
          <input matInput type="number" inputmode="numeric" formControlName="userId" />
          @if (form.controls.userId.hasError('required')) { <mat-error>Required</mat-error> }
          @if (form.controls.userId.hasError('min')) { <mat-error>Must be a valid user ID</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Full name</mat-label>
          <input matInput formControlName="doctorName" autocomplete="off" />
          @if (form.controls.doctorName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Specialization</mat-label>
          <input matInput formControlName="specialization" autocomplete="off" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>License no.</mat-label>
          <input matInput formControlName="licenseNo" autocomplete="off" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" autocomplete="off" />
        </mat-form-field>
      </form>
      @if (!isEdit) {
        <p class="muted" style="margin:4px 0 0;font-size:.8rem">
          The user ID must belong to an existing account (ideally one with the Doctor role).
        </p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" [disabled]="saving()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || saving()" (click)="save()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { {{ isEdit ? 'Save' : 'Create' }} }
      </button>
    </mat-dialog-actions>
  `,
})
export class DoctorFormDialogComponent {
  readonly data = inject<DoctorFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DoctorFormDialogComponent>);
  private readonly directory = inject(StaffDirectoryService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly isEdit = !!this.data.doctor;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    userId: this.fb.control(
      { value: this.data.doctor?.userId ?? null, disabled: this.isEdit },
      [Validators.required, Validators.min(1)],
    ),
    doctorName: this.fb.control(this.data.doctor?.doctorName ?? '', [Validators.required]),
    specialization: this.fb.control(this.data.doctor?.specialization ?? ''),
    licenseNo: this.fb.control(this.data.doctor?.licenseNo ?? ''),
    phone: this.fb.control(this.data.doctor?.phone ?? ''),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();

    if (this.isEdit && this.data.doctor) {
      this.directory
        .updateDoctor(this.data.doctor.doctorId, {
          doctorName: v.doctorName ?? '',
          specialization: v.specialization || undefined,
          licenseNo: v.licenseNo || undefined,
          phone: v.phone || undefined,
        })
        .subscribe({
          next: (d) => {
            this.ui.success('Doctor updated.');
            this.ref.close(d);
          },
          error: () => this.saving.set(false),
        });
    } else {
      this.directory
        .createDoctor({
          userId: Number(v.userId),
          doctorName: v.doctorName ?? '',
          specialization: v.specialization || undefined,
          licenseNo: v.licenseNo || undefined,
          phone: v.phone || undefined,
        })
        .subscribe({
          next: (d) => {
            this.ui.success('Doctor created.');
            this.ref.close(d);
          },
          error: () => this.saving.set(false),
        });
    }
  }
}
