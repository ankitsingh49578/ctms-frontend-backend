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
import { USER_STATUSES } from '../../../core/models/enums';

export interface UserFormData {
  /** Present => edit mode; absent => create mode. */
  user?: UserResponse;
  roles: RoleResponse[];
}

@Component({
  selector: 'ctms-user-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit user' : 'New user' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid" style="padding-top:6px">
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" autocomplete="off" />
          @if (form.controls.username.hasError('required')) { <mat-error>Required</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="off" />
          @if (form.controls.email.hasError('required')) { <mat-error>Required</mat-error> }
          @else if (form.controls.email.hasError('email')) { <mat-error>Invalid email</mat-error> }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" autocomplete="off" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>

        @if (!isEdit) {
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password" />
            @if (form.controls.password.hasError('required')) { <mat-error>Required</mat-error> }
            @else if (form.controls.password.hasError('minlength')) { <mat-error>At least 8 characters</mat-error> }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="roleId">
              @for (r of data.roles; track r.roleId) {
                <mat-option [value]="r.roleId">{{ r.roleName }}</mat-option>
              }
            </mat-select>
            @if (form.controls.roleId.hasError('required')) { <mat-error>Required</mat-error> }
          </mat-form-field>
        }
      </form>

      @if (isEdit) {
        <p class="muted" style="margin:4px 0 0;font-size:.8rem">
          Role and password have dedicated actions (Change role / Reset password) and are not edited here.
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
export class UserFormDialogComponent {
  readonly data = inject<UserFormData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly users = inject(UserAdminService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly statuses = USER_STATUSES;
  readonly isEdit = !!this.data.user;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    username: this.fb.control(this.data.user?.username ?? '', [Validators.required]),
    email: this.fb.control(this.data.user?.email ?? '', [Validators.required, Validators.email]),
    phone: this.fb.control(this.data.user?.phone ?? ''),
    status: this.fb.control(this.data.user?.status ?? 'Active', [Validators.required]),
    password: this.fb.control('', this.data.user ? [] : [Validators.required, Validators.minLength(8)]),
    roleId: this.fb.control<number | null>(this.data.user?.roleId ?? null, this.data.user ? [] : [Validators.required]),
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();

    if (this.isEdit && this.data.user) {
      this.users
        .update(this.data.user.userId, {
          username: v.username ?? undefined,
          email: v.email ?? undefined,
          phone: v.phone || undefined,
          status: v.status ?? undefined,
        })
        .subscribe({
          next: (u) => {
            this.ui.success('User updated.');
            this.ref.close(u);
          },
          error: () => this.saving.set(false),
        });
    } else {
      this.users
        .create({
          username: v.username ?? '',
          email: v.email ?? '',
          password: v.password ?? '',
          roleId: v.roleId!,
          phone: v.phone || undefined,
          status: v.status ?? undefined,
        })
        .subscribe({
          next: (u) => {
            this.ui.success('User created.');
            this.ref.close(u);
          },
          error: () => this.saving.set(false),
        });
    }
  }
}
