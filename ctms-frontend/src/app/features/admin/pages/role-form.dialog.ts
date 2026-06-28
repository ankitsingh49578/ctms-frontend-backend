import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RoleService } from '../services/role.service';
import { UiService } from '../../../core/services/ui.service';
import { RoleResponse } from '../../../core/models/domain.models';
import { USER_STATUSES } from '../../../core/models/enums';

export interface RoleFormData {
  /** Present => edit mode; absent => create mode. */
  role?: RoleResponse;
}

/**
 * Create / edit a role. We deliberately expose name, description and status
 * only: the backend accepts permissionIds but authorization is enforced by role
 * NAME via @PreAuthorize, so a permission editor here would be misleading.
 */
@Component({
  selector: 'ctms-role-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit role' : 'New role' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:grid;gap:4px;padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>Role name</mat-label>
          <input matInput formControlName="roleName" autocomplete="off" />
          @if (form.controls.roleName.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" autocomplete="off"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </form>
      <p class="muted" style="margin:4px 0 0;font-size:.8rem">
        Access is granted by role name across the API. Renaming a role that the
        backend gates on (e.g. Admin, Doctor) can change who can sign in.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" [disabled]="saving()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || saving()" (click)="save()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { {{ isEdit ? 'Save' : 'Create' }} }
      </button>
    </mat-dialog-actions>
  `,
})
export class RoleFormDialogComponent {
  readonly data = inject<RoleFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<RoleFormDialogComponent>);
  private readonly roles = inject(RoleService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly statuses = USER_STATUSES;
  readonly isEdit = !!this.data.role;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    roleName: this.fb.control(this.data.role?.roleName ?? '', [Validators.required]),
    description: this.fb.control(this.data.role?.description ?? ''),
    status: this.fb.control(this.data.role?.status ?? 'Active', [Validators.required]),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();

    if (this.isEdit && this.data.role) {
      this.roles
        .update(this.data.role.roleId, {
          roleName: v.roleName ?? '',
          description: v.description || undefined,
          status: v.status ?? 'Active',
        })
        .subscribe({
          next: (r) => {
            this.ui.success('Role updated.');
            this.ref.close(r);
          },
          error: () => this.saving.set(false),
        });
    } else {
      this.roles
        .create({
          roleName: v.roleName ?? '',
          description: v.description || undefined,
          status: v.status ?? undefined,
        })
        .subscribe({
          next: (r) => {
            this.ui.success('Role created.');
            this.ref.close(r);
          },
          error: () => this.saving.set(false),
        });
    }
  }
}
