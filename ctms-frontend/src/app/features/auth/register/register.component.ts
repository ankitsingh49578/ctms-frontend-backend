import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatStepperModule } from "@angular/material/stepper";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { ApiService } from "../../../core/services/api.service";
import { UiService } from "../../../core/services/ui.service";
import { ENDPOINTS } from "../../../core/constants/api-endpoints";

export function ageValidator(min: number, max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < min) {
      return {
        minAge: true,
        message: `Participant must be at least ${min} years old.`,
      };
    }
    if (age > max) {
      return {
        maxAge: true,
        message: `Participant age cannot exceed ${max} years.`,
      };
    }
    return null;
  };
}

@Component({
  selector: "ctms-register",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterLink,
  ],
  template: `
    <div class="split-layout fade-in">
      <!-- Left Side: Hero / Illustration -->
      <div class="split-hero">
        <div class="hero-content slide-up delay-1">
          <div class="hero-icon"><mat-icon>volunteer_activism</mat-icon></div>
          <h1 class="hero-title">Join Our Clinical Trials</h1>
          <p class="hero-subtitle">
            Participate in groundbreaking research and help us advance medical
            science. Your contribution makes a difference.
          </p>
          <ul class="hero-benefits">
            <li>
              <mat-icon>check_circle</mat-icon> Access to innovative treatments
            </li>
            <li><mat-icon>check_circle</mat-icon> Expert medical care</li>
            <li>
              <mat-icon>check_circle</mat-icon> Shape the future of healthcare
            </li>
          </ul>
        </div>
      </div>

      <!-- Right Side: Registration Form -->
      <div class="split-form-container">
        <div class="register-card slide-up delay-2">
          <div class="register-header">
            <h1 class="register-title">Create an Account</h1>
            <p class="register-subtitle">
              Join CTMS to participate in clinical trials.
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-stepper
              orientation="vertical"
              [linear]="true"
              #stepper
              class="custom-stepper"
            >
              <!-- STEP 1: Personal Information -->
              <mat-step [stepControl]="personalInfoForm">
                <ng-template matStepLabel>Personal Information</ng-template>
                <div formGroupName="personalInfo" class="step-content">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" />
                      <mat-icon matPrefix>person</mat-icon>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" />
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" />
                    <mat-icon matPrefix>account_circle</mat-icon>
                    <mat-hint>Choose a unique username.</mat-hint>
                    @if (
                      personalInfoForm.controls.username.hasError("required") &&
                      personalInfoForm.controls.username.touched
                    ) {
                      <mat-error>Username is required</mat-error>
                    }
                    @if (
                      personalInfoForm.controls.username.hasError(
                        "minlength"
                      ) && personalInfoForm.controls.username.touched
                    ) {
                      <mat-error
                        >Username must be at least 4 characters</mat-error
                      >
                    }
                    @if (
                      personalInfoForm.controls.username.hasError("pattern") &&
                      personalInfoForm.controls.username.touched
                    ) {
                      <mat-error
                        >Only letters, numbers, and underscores are
                        allowed</mat-error
                      >
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-full mt-3">
                    <mat-label>Email Address</mat-label>
                    <input matInput type="email" formControlName="email" />
                    <mat-icon matPrefix>email</mat-icon>
                    @if (personalInfoForm.controls.email.hasError("required") && personalInfoForm.controls.email.touched) {
                      <mat-error>Email is required</mat-error>
                    }
                    @if (personalInfoForm.controls.email.hasError("pattern") && personalInfoForm.controls.email.touched) {
                      <mat-error>Please enter a valid Gmail address</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" />
                    <mat-icon matPrefix>phone</mat-icon>
                    @if (personalInfoForm.controls.phone.hasError("required") && personalInfoForm.controls.phone.touched) {
                      <mat-error>Phone Number is required</mat-error>
                    }
                    @if (personalInfoForm.controls.phone.hasError("pattern") && personalInfoForm.controls.phone.touched) {
                      <mat-error>Please enter a valid 10-digit phone number</mat-error>
                    }
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Date of Birth</mat-label>
                      <input
                        matInput
                        [matDatepicker]="picker"
                        [max]="maxDate"
                        formControlName="dob"
                      />
                      <mat-datepicker-toggle
                        matIconSuffix
                        [for]="picker"
                      ></mat-datepicker-toggle>
                      <mat-datepicker #picker></mat-datepicker>

                      @if (personalInfoForm.controls.dob.hasError("minAge")) {
                        <mat-error>{{
                          personalInfoForm.controls.dob.errors?.["message"]
                        }}</mat-error>
                      }
                      @if (personalInfoForm.controls.dob.hasError("maxAge")) {
                        <mat-error>{{
                          personalInfoForm.controls.dob.errors?.["message"]
                        }}</mat-error>
                      }
                      @if (
                        personalInfoForm.controls.dob.hasError("required") &&
                        personalInfoForm.controls.dob.touched
                      ) {
                        <mat-error>Date of Birth is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Gender</mat-label>
                      <mat-select formControlName="gender">
                        <mat-option value="Male">Male</mat-option>
                        <mat-option value="Female">Female</mat-option>
                        <mat-option value="Other">Other</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <div class="step-actions">
                    <button
                      mat-flat-button
                      color="primary"
                      matStepperNext
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </mat-step>

              <!-- STEP 2: Address Information -->
              <mat-step [stepControl]="addressInfoForm">
                <ng-template matStepLabel>Address Information</ng-template>
                <div formGroupName="addressInfo" class="step-content">
                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Full Address</mat-label>
                    <textarea
                      matInput
                      formControlName="address"
                      rows="3"
                      placeholder="Enter your full address"
                    ></textarea>
                    <mat-icon matPrefix>home</mat-icon>
                  </mat-form-field>
                  <div class="step-actions">
                    <button mat-button matStepperPrevious type="button">
                      Back
                    </button>
                    <button
                      mat-flat-button
                      color="primary"
                      matStepperNext
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </mat-step>

              <!-- STEP 3: Medical Information -->
              <mat-step [stepControl]="medicalInfoForm">
                <ng-template matStepLabel>Medical Information</ng-template>
                <div formGroupName="medicalInfo" class="step-content">
                  <h3 class="step-title">Medical History Document *</h3>
                  <p class="step-desc">
                    Upload your previous medical history document. Supported
                    formats: PDF, JPG, JPEG, PNG.
                  </p>

                  <div
                    class="dropzone"
                    [class.dropzone--active]="isDragging()"
                    [class.dropzone--success]="
                      medicalInfoForm.controls.medicalHistoryDocumentName.value
                    "
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event)"
                    (click)="fileInput.click()"
                  >
                    <input
                      #fileInput
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      (change)="onFileSelected($event)"
                      style="display:none;"
                    />

                    @if (
                      medicalInfoForm.controls.medicalHistoryDocumentName.value
                    ) {
                      <div class="dropzone-success">
                        <mat-icon class="success-icon">check_circle</mat-icon>
                        <div class="file-details">
                          <span class="file-name">{{
                            medicalInfoForm.controls.medicalHistoryDocumentName
                              .value
                          }}</span>
                          <span class="file-size">{{ fileSize() }}</span>
                        </div>
                        <button
                          mat-icon-button
                          type="button"
                          (click)="removeFile($event)"
                        >
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                    } @else {
                      <mat-icon class="dropzone-icon">cloud_upload</mat-icon>
                      <p class="dropzone-text">
                        <strong>Click to browse</strong> or drag and drop
                      </p>
                    }
                  </div>
                  @if (
                    medicalInfoForm.controls.medicalHistoryDocumentName.hasError(
                      "required"
                    ) &&
                    medicalInfoForm.controls.medicalHistoryDocumentName.touched
                  ) {
                    <mat-error style="font-size: 75%; margin-top: 8px;"
                      >Medical history document is mandatory.</mat-error
                    >
                  }

                  <div class="step-actions">
                    <button mat-button matStepperPrevious type="button">
                      Back
                    </button>
                    <button
                      mat-flat-button
                      color="primary"
                      matStepperNext
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </mat-step>

              <!-- STEP 4: Account Information -->
              <mat-step [stepControl]="accountInfoForm">
                <ng-template matStepLabel>Account Information</ng-template>
                <div formGroupName="accountInfo" class="step-content">
                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Password</mat-label>
                    <input
                      matInput
                      [type]="hidePassword() ? 'password' : 'text'"
                      formControlName="password"
                    />
                    <mat-icon matPrefix>lock</mat-icon>
                    <button mat-icon-button matSuffix (click)="hidePassword.set(!hidePassword())" type="button">
                      <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    @if (accountInfoForm.controls.password.hasError("required") && accountInfoForm.controls.password.touched) {
                      <mat-error>Password is required</mat-error>
                    }
                    @if (accountInfoForm.controls.password.hasError("minlength") && accountInfoForm.controls.password.touched) {
                      <mat-error>Password must be at least 8 characters</mat-error>
                    }
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="field-full">
                    <mat-label>Confirm Password</mat-label>
                    <input
                      matInput
                      [type]="hideConfirmPassword() ? 'password' : 'text'"
                      formControlName="confirmPassword"
                    />
                    <mat-icon matPrefix>lock</mat-icon>
                    <button mat-icon-button matSuffix (click)="hideConfirmPassword.set(!hideConfirmPassword())" type="button">
                      <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    @if (
                      accountInfoForm.controls.confirmPassword.hasError("passwordMismatch") &&
                      accountInfoForm.controls.confirmPassword.touched
                    ) {
                      <mat-error>Passwords do not match.</mat-error>
                    }
                  </mat-form-field>
                  <div class="step-actions">
                    <button mat-button matStepperPrevious type="button">
                      Back
                    </button>
                    <button
                      mat-flat-button
                      color="primary"
                      type="submit"
                      [disabled]="form.invalid || loading()"
                      class="register-submit"
                    >
                      {{
                        loading() ? "Registering..." : "Complete Registration"
                      }}
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </form>

          <p
            class="auth-footer"
            style="text-align:center;margin-top:24px;color:var(--ctms-ink-soft)"
          >
            Already have an account?
            <a
              routerLink="/login"
              style="color:var(--ctms-primary);text-decoration:none;font-weight:600"
              >Log In</a
            >
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .split-layout {
        display: flex;
        min-height: 100vh;
        width: 100%;
        background-color: var(--ctms-bg);
      }

      .split-hero {
        display: none;
      }

      .split-form-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        overflow-y: auto;
      }

      @media (min-width: 900px) {
        .split-hero {
          display: flex;
          flex: 1;
          background: linear-gradient(135deg, #005a80 0%, #00364d 100%);
          position: relative;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow: hidden;
        }

        .split-hero::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(
              circle at 80% 20%,
              rgba(255, 255, 255, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 20% 80%,
              rgba(255, 255, 255, 0.05) 0%,
              transparent 40%
            );
        }

        .hero-content {
          color: white;
          max-width: 450px;
          z-index: 1;
        }

        .hero-icon mat-icon {
          font-size: 56px;
          height: 56px;
          width: 56px;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.9);
        }

        .hero-title {
          font-family: Fraunces, serif;
          font-size: 2.2rem;
          margin: 0 0 16px 0;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          opacity: 0.85;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .hero-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .hero-benefits li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 1.05rem;
          opacity: 0.95;
        }

        .hero-benefits mat-icon {
          color: #4ade80;
        }
      }

      .register-card {
        width: 100%;
        max-width: 600px;
        background: var(--ctms-surface);
        border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
        padding: 32px;
      }

      @media (max-width: 600px) {
        .register-card {
          padding: 20px;
        }
      }

      .register-header {
        text-align: center;
        margin-bottom: 24px;
      }

      .register-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0 0 8px;
        color: var(--ctms-ink);
        font-family: Fraunces, serif;
      }

      .register-subtitle {
        color: var(--ctms-ink-soft);
        margin: 0;
        font-size: 0.95rem;
      }

      .form-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .flex-1 {
        flex: 1;
        min-width: 200px;
      }

      .field-full {
        width: 100%;
      }

      .mt-3 {
        margin-top: 12px;
      }

      .step-content {
        padding-top: 16px;
      }

      .step-actions {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        margin-bottom: 8px;
      }

      .step-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 6px;
        color: var(--ctms-ink);
      }

      .step-desc {
        font-size: 0.85rem;
        color: var(--ctms-ink-soft);
        margin: 0 0 16px;
      }

      .dropzone {
        border: 2px dashed var(--ctms-border);
        border-radius: 12px;
        padding: 32px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        background-color: var(--ctms-bg);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .dropzone:hover,
      .dropzone--active {
        border-color: var(--ctms-primary);
        background-color: rgba(0, 101, 143, 0.04);
      }

      .dropzone--success {
        border: 2px solid var(--ctms-success);
        background-color: var(--ctms-success-bg);
        padding: 20px;
      }

      .dropzone-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        color: var(--ctms-primary);
        opacity: 0.7;
        margin-bottom: 16px;
      }

      .dropzone-text {
        margin: 0;
        color: var(--ctms-ink-soft);
        font-size: 1rem;
      }

      .dropzone-text strong {
        color: var(--ctms-primary);
      }

      .dropzone-success {
        display: flex;
        align-items: center;
        width: 100%;
        gap: 16px;
        text-align: left;
      }

      .success-icon {
        color: var(--ctms-success);
        font-size: 32px;
        height: 32px;
        width: 32px;
      }

      .file-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .file-name {
        font-weight: 600;
        color: var(--ctms-ink);
        word-break: break-all;
      }

      .file-size {
        font-size: 0.8rem;
        color: var(--ctms-ink-soft);
      }

      .register-submit {
        padding: 0 24px;
      }

      /* Make stepper responsive without breaking styles */
      .custom-stepper {
        background: transparent;
      }
      
      ::ng-deep mat-form-field.ng-valid.ng-touched:not(.ng-invalid) .mdc-text-field--outlined .mdc-notched-outline__leading,
      ::ng-deep mat-form-field.ng-valid.ng-touched:not(.ng-invalid) .mdc-text-field--outlined .mdc-notched-outline__notch,
      ::ng-deep mat-form-field.ng-valid.ng-touched:not(.ng-invalid) .mdc-text-field--outlined .mdc-notched-outline__trailing {
        border-color: #4ade80 !important;
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);

  readonly loading = signal(false);
  readonly isDragging = signal(false);
  readonly fileSize = signal("");
  readonly maxDate = new Date();
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  readonly form = this.fb.group({
    personalInfo: this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      username: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
      ],
      email: [
        "", 
        [
          Validators.required, 
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
        ]
      ],
      phone: [
        "", 
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],
      dob: ["", [Validators.required, ageValidator(20, 55)]],
      gender: ["", Validators.required],
    }),
    addressInfo: this.fb.group({
      address: ["", Validators.required],
    }),
    medicalInfo: this.fb.group({
      medicalHistoryDocumentName: ["", Validators.required],
    }),
    accountInfo: this.fb.group(
      {
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    ),
  });

  get personalInfoForm() {
    return this.form.get("personalInfo") as any;
  }
  get addressInfoForm() {
    return this.form.get("addressInfo") as any;
  }
  get medicalInfoForm() {
    return this.form.get("medicalInfo") as any;
  }
  get accountInfoForm() {
    return this.form.get("accountInfo") as any;
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const password = g.get("password")?.value;
    const confirmPasswordCtrl = g.get("confirmPassword");
    
    if (password !== confirmPasswordCtrl?.value) {
      confirmPasswordCtrl?.setErrors({ ...confirmPasswordCtrl.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPasswordCtrl?.hasError('passwordMismatch')) {
        const errors = { ...confirmPasswordCtrl.errors };
        delete (errors as any)['passwordMismatch'];
        confirmPasswordCtrl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    this.medicalInfoForm.patchValue({ medicalHistoryDocumentName: file.name });
    this.medicalInfoForm.get("medicalHistoryDocumentName").markAsTouched();
    const size = (file.size / 1024).toFixed(2);
    if (Number(size) > 1024) {
      this.fileSize.set((Number(size) / 1024).toFixed(2) + " MB");
    } else {
      this.fileSize.set(size + " KB");
    }
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.medicalInfoForm.patchValue({ medicalHistoryDocumentName: "" });
    this.fileSize.set("");
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const payload = {
      ...this.personalInfoForm.value,
      ...this.addressInfoForm.value,
      ...this.medicalInfoForm.value,
      password: this.accountInfoForm.value.password,
    };

    // Format Date before sending using local time, avoiding timezone shift
    if (payload.dob) {
      const d = new Date(payload.dob);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      payload.dob = `${year}-${month}-${day}`;
    }

    this.api.post(ENDPOINTS.auth.register, payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.ui.success(
          "Registration successful! Your account has been created successfully.",
        );
        setTimeout(() => {
          this.router.navigate(["/login"], {
            queryParams: { registered: "true" },
          });
        }, 3000); // Wait for toast before redirect
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err.error?.message || "Registration failed. Please try again.";
        this.ui.error(msg);
      },
    });
  }
}
