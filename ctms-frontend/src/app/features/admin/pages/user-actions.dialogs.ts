import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserAdminService } from '../services/user-admin.service';
import { UiService } from '../../../core/services/ui.service';
import { UserResponse } from '../../../core/models/auth.models';
import { RoleResponse } from '../../../core/models/domain.models';

/* ---- Change role --------------------------------------------------------- */

export interface ChangeRoleData {
  user: UserResponse;
  roles: RoleResponse[];
}

@Component({
  selector: 'ctms-change-role-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Change role</h2>
    <mat-dialog-content>
      <p class="muted" style="margin:0 0 10px">
        Updating the role for <strong>{{ data.user.username }}</strong>
        (currently {{ data.user.roleName }}).
      </p>
      <mat-form-field appearance="outline" class="field-full">
        <mat-label>Role</mat-label>
        <mat-select [formControl]="roleId">
          @for (r of data.roles; track r.roleId) {
            <mat-option [value]="r.roleId">{{ r.roleName }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" [disabled]="saving()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="roleId.invalid || saving()" (click)="save()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Update role }
      </button>
    </mat-dialog-actions>
  `,
})
export class ChangeRoleDialogComponent {
  readonly data = inject<ChangeRoleData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ChangeRoleDialogComponent>);
  private readonly users = inject(UserAdminService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly roleId = this.fb.control<number | null>(this.data.user.roleId, [Validators.required]);

  save(): void {
    if (this.roleId.invalid) return;
    this.saving.set(true);
    this.users.changeRole(this.data.user.userId, { roleId: this.roleId.value! }).subscribe({
      next: (u) => {
        this.ui.success('Role updated.');
        this.ref.close(u);
      },
      error: () => this.saving.set(false),
    });
  }
}

/* ---- Reset password ------------------------------------------------------ */

@Component({
  selector: 'ctms-reset-password-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Reset password</h2>
    <mat-dialog-content>
      <p class="muted" style="margin:0 0 10px">
        Set a new password for <strong>{{ user.username }}</strong>. They should change it
        after signing in.
      </p>
      <mat-form-field appearance="outline" class="field-full">
        <mat-label>New password</mat-label>
        <input matInput type="password" [formControl]="newPassword" autocomplete="new-password" />
        @if (newPassword.hasError('required')) { <mat-error>Required</mat-error> }
        @else if (newPassword.hasError('minlength')) { <mat-error>At least 8 characters</mat-error> }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false" [disabled]="saving()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="newPassword.invalid || saving()" (click)="save()">
        @if (saving()) { <mat-spinner diameter="18" /> } @else { Reset password }
      </button>
    </mat-dialog-actions>
  `,
})
export class ResetPasswordDialogComponent {
  readonly user = inject<UserResponse>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ResetPasswordDialogComponent>);
  private readonly users = inject(UserAdminService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly saving = signal(false);
  readonly newPassword = this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]);

  save(): void {
    if (this.newPassword.invalid) return;
    this.saving.set(true);
    // Admin reset: currentPassword is not required by the backend for this endpoint.
    this.users.changePassword(this.user.userId, { newPassword: this.newPassword.value }).subscribe({
      next: () => {
        this.ui.success('Password reset.');
        this.ref.close(true);
      },
      error: () => this.saving.set(false),
    });
  }
}
