import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DoctorProfileService } from '../services/doctor.service';
import { UiService } from '../../../core/services/ui.service';
import { DoctorResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-doctor-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatDividerModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">My Profile</h1>
          <p class="page__subtitle">Manage your personal and professional information.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading profile…</p></div>
      } @else if (doctor()) {
        @let d = doctor()!;
        <div class="grid" style="grid-template-columns:minmax(0,1fr);gap:20px">

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
              <div style="display:flex;gap:16px;align-items:center">
                <div class="avatar" style="width:64px;height:64px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;font-size:24px;color:#888;">
                  @if (d.profileImage) {
                    <img [src]="d.profileImage" alt="Profile" style="width:100%;height:100%;border-radius:50%;object-fit:cover" />
                  } @else {
                    {{ d.doctorName.charAt(0) }}
                  }
                </div>
                <div>
                  <h3 style="margin:0">{{ d.doctorName }}</h3>
                  <p class="muted" style="margin:4px 0 0">
                    {{ d.specialization || 'General Practitioner' }} 
                    @if (d.licenseNo) { · Lic: {{ d.licenseNo }} }
                  </p>
                </div>
              </div>
              <span class="chip" [class]="'chip--' + tone(d.status || 'Active')">{{ d.status || 'Active' }}</span>
            </div>
            <p class="muted" style="margin:14px 0 0;font-size:.82rem">
              Core professional details (Name, Specialization, License Number) are managed by the administrator.
            </p>
          </div>

          <div class="card">
            <h3 style="margin:0 0 14px">Professional Details</h3>
            <div class="grid" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px">
              <div>
                <p class="muted" style="margin:0;font-size:0.8rem">Employee ID</p>
                <p style="margin:4px 0 0;font-weight:500">{{ d.employeeId || 'N/A' }}</p>
              </div>
              <div>
                <p class="muted" style="margin:0;font-size:0.8rem">Department</p>
                <p style="margin:4px 0 0;font-weight:500">{{ d.department || 'N/A' }}</p>
              </div>
              <div>
                <p class="muted" style="margin:0;font-size:0.8rem">Designation</p>
                <p style="margin:4px 0 0;font-weight:500">{{ d.designation || 'N/A' }}</p>
              </div>
              <div>
                <p class="muted" style="margin:0;font-size:0.8rem">Qualification</p>
                <p style="margin:4px 0 0;font-weight:500">{{ d.qualification || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="margin:0 0 14px">Contact details</h3>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" [value]="d.email" disabled />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Emergency Contact</mat-label>
                  <input matInput formControlName="emergencyContact" />
                </mat-form-field>
                <mat-form-field appearance="outline" class="field-full">
                  <mat-label>Address</mat-label>
                  <textarea matInput rows="2" formControlName="address"></textarea>
                </mat-form-field>
              </div>
              <div class="row-actions" style="margin-top:8px">
                <button mat-flat-button type="submit" [disabled]="profileForm.invalid || profileForm.pristine || savingProfile()">
                  @if (savingProfile()) { <mat-spinner diameter="18" /> } @else { Save changes }
                </button>
                <button mat-button type="button" [disabled]="profileForm.pristine || savingProfile()" (click)="resetProfile()">
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div class="card">
            <h3 style="margin:0 0 14px">Change password</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Current password</mat-label>
                  <input matInput type="password" formControlName="currentPassword" autocomplete="current-password" />
                  @if (passwordForm.controls.currentPassword.hasError('required')) {
                    <mat-error>Required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>New password</mat-label>
                  <input matInput type="password" formControlName="newPassword" autocomplete="new-password" />
                  @if (passwordForm.controls.newPassword.hasError('required')) {
                    <mat-error>Required</mat-error>
                  } @else if (passwordForm.controls.newPassword.hasError('minlength')) {
                    <mat-error>At least 8 characters</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Confirm password</mat-label>
                  <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
                  @if (passwordForm.errors?.['passwordMismatch']) {
                    <mat-error>Passwords do not match</mat-error>
                  } @else if (passwordForm.controls.confirmPassword.hasError('required')) {
                    <mat-error>Required</mat-error>
                  }
                </mat-form-field>
              </div>
              <div class="row-actions" style="margin-top:8px">
                <button mat-flat-button type="submit" [disabled]="passwordForm.invalid || changingPassword()">
                  @if (changingPassword()) { <mat-spinner diameter="18" /> } @else { Update password }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </section>
  `,
})
export class DoctorProfileComponent {
  private readonly doctorService = inject(DoctorProfileService);
  private readonly ui = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly changingPassword = signal(false);
  readonly doctor = signal<DoctorResponse | null>(null);

  readonly profileForm = this.fb.group({
    phone: this.fb.control<string | null>(null),
    emergencyContact: this.fb.control<string | null>(null),
    address: this.fb.control<string | null>(null),
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: this.fb.nonNullable.control('', [Validators.required]),
    newPassword: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
  }, { validators: this.passwordMatchValidator });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.doctorService.getProfile().subscribe({
      next: (d) => {
        this.doctor.set(d);
        this.patchForm(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchForm(d: DoctorResponse): void {
    this.profileForm.reset({
      phone: d.phone ?? null,
      emergencyContact: d.emergencyContact ?? null,
      address: d.address ?? null,
    });
  }

  resetProfile(): void {
    const d = this.doctor();
    if (d) this.patchForm(d);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const v = this.profileForm.getRawValue();
    this.doctorService
      .updateProfile({
        phone: v.phone ?? undefined,
        emergencyContact: v.emergencyContact ?? undefined,
        address: v.address ?? undefined,
      })
      .subscribe({
        next: (d) => {
          this.doctor.set(d);
          this.patchForm(d);
          this.savingProfile.set(false);
          this.ui.success('Profile updated.');
        },
        error: () => this.savingProfile.set(false),
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.changingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.doctorService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        this.ui.success('Password updated successfully.');
      },
      error: () => this.changingPassword.set(false),
    });
  }

  passwordMatchValidator(g: any) {
    return g.get('newPassword').value === g.get('confirmPassword').value
      ? null : { passwordMismatch: true };
  }
}
