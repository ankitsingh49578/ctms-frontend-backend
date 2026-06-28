import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PortalService } from '../services/portal.service';
import { UiService } from '../../../core/services/ui.service';
import { AuthService } from '../../../core/services/auth.service';
import { PatientResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

@Component({
  selector: 'ctms-portal-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDividerModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">My Profile</h1>
          <p class="page__subtitle">Keep your contact details up to date.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading profile…</p></div>
      } @else if (patient()) {
        @let p = patient()!;
        <div class="grid" style="grid-template-columns:minmax(0,1fr);gap:20px">

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
              <div>
                <h3 style="margin:0">{{ p.fullName }}</h3>
                <p class="muted" style="margin:4px 0 0">
                  {{ p.patientCode }}
                  @if (p.gender) { · {{ p.gender }} }
                  @if (p.dob) { · DOB {{ p.dob | date:'mediumDate' }} }
                </p>
              </div>
              <span class="chip" [class]="'chip--' + tone(p.status)">{{ p.status }}</span>
            </div>
            <p class="muted" style="margin:14px 0 0;font-size:.82rem">
              Name, date of birth and patient code are managed by your clinical team and
              can only be changed by an administrator.
            </p>
          </div>

          <div class="card">
            <h3 style="margin:0 0 14px">Contact details</h3>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" />
                  @if (profileForm.controls.email.hasError('email')) {
                    <mat-error>Enter a valid email address</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Blood group</mat-label>
                  <mat-select formControlName="bloodGroup">
                    <mat-option [value]="null">—</mat-option>
                    @for (bg of bloodGroups; track bg) {
                      <mat-option [value]="bg">{{ bg }}</mat-option>
                    }
                  </mat-select>
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
export class PortalProfileComponent {
  private readonly portal = inject(PortalService);
  private readonly ui = inject(UiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly bloodGroups = BLOOD_GROUPS;
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly changingPassword = signal(false);
  readonly patient = signal<PatientResponse | null>(null);

  readonly profileForm = this.fb.group({
    email: this.fb.control<string | null>(null, [Validators.email]),
    phone: this.fb.control<string | null>(null),
    bloodGroup: this.fb.control<string | null>(null),
    address: this.fb.control<string | null>(null),
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: this.fb.nonNullable.control('', [Validators.required]),
    newPassword: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.portal.myProfile().subscribe({
      next: (p) => {
        this.patient.set(p);
        this.patchForm(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchForm(p: PatientResponse): void {
    this.profileForm.reset({
      email: p.email ?? null,
      phone: p.phone ?? null,
      bloodGroup: p.bloodGroup ?? null,
      address: p.address ?? null,
    });
  }

  resetProfile(): void {
    const p = this.patient();
    if (p) this.patchForm(p);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const v = this.profileForm.getRawValue();
    this.portal
      .updateMyProfile({
        email: v.email ?? undefined,
        phone: v.phone ?? undefined,
        bloodGroup: v.bloodGroup ?? undefined,
        address: v.address ?? undefined,
      })
      .subscribe({
        next: (p) => {
          this.patient.set(p);
          this.patchForm(p);
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
    this.portal.changeMyPassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset({ currentPassword: '', newPassword: '' });
        this.ui.success('Password updated. Please use it next time you sign in.');
      },
      error: () => this.changingPassword.set(false),
    });
  }
}
