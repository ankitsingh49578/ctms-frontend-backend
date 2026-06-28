import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StaffDirectoryService } from '../services/staff-directory.service';
import { UiService } from '../../../core/services/ui.service';
import { ManagerResponse } from '../../../core/models/domain.models';

export interface ManagerFormData {
  /** Present => edit; absent => create. */
  manager?: ManagerResponse;
}

/**
 * Create / edit a manager directory record (clinical / trial management staff).
 * On create the record is linked to an existing user account (userId); the link
 * is immutable, so the field is read-only in edit mode.
 */
@Component({
  selector: 'ctms-manager-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit manager' : 'New manager' }}</h2>
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
          <input matInput formControlName="managerName" autocomplete="off" />
          @if (form.controls.managerName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" autocomplete="off" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" autocomplete="off" />
        </mat-form-field>
      </form>
      @if (!isEdit) {
        <p class="muted" style="margin:4px 0 0;font-size:.8rem">
          The user ID must belong to an existing account (a Clinical Manager or Trial Manager).
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
export class ManagerFormDialogComponent {
  readonly data = inject<ManagerFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ManagerFormDialogComponent>);
  private readonly directory = inject(StaffDirectoryService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly isEdit = !!this.data.manager;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    userId: this.fb.control(
      { value: this.data.manager?.userId ?? null, disabled: this.isEdit },
      [Validators.required, Validators.min(1)],
    ),
    managerName: this.fb.control(this.data.manager?.managerName ?? '', [Validators.required]),
    department: this.fb.control(this.data.manager?.department ?? ''),
    phone: this.fb.control(this.data.manager?.phone ?? ''),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();

    if (this.isEdit && this.data.manager) {
      this.directory
        .updateManager(this.data.manager.managerId, {
          managerName: v.managerName ?? '',
          department: v.department || undefined,
          phone: v.phone || undefined,
        })
        .subscribe({
          next: (m) => {
            this.ui.success('Manager updated.');
            this.ref.close(m);
          },
          error: () => this.saving.set(false),
        });
    } else {
      this.directory
        .createManager({
          userId: Number(v.userId),
          managerName: v.managerName ?? '',
          department: v.department || undefined,
          phone: v.phone || undefined,
        })
        .subscribe({
          next: (m) => {
            this.ui.success('Manager created.');
            this.ref.close(m);
          },
          error: () => this.saving.set(false),
        });
    }
  }
}
