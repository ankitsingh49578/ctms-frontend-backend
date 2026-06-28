import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCheckboxModule } from "@angular/material/checkbox";

import { AuthService } from "../../../core/services/auth.service";
import { UiService } from "../../../core/services/ui.service";

interface DemoAccount {
  label: string;
  username: string;
  password: string;
}

@Component({
  selector: "app-login",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatCheckboxModule,
    RouterLink
  ],
  template: `
    <div class="split-layout fade-in">
      <!-- Left Side: Hero / Illustration -->
      <div class="split-hero">
        <div class="hero-content slide-up delay-1">
          <div class="hero-icon"><mat-icon>local_hospital</mat-icon></div>
          <h1 class="hero-title">Advancing Healthcare Together</h1>
          <p class="hero-subtitle">Welcome to the Clinical Trial Management System. Join us in shaping the future of medicine.</p>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="split-form-container">
        <mat-card class="login-card slide-up delay-2" appearance="outlined">
          @if (loading()) {
            <mat-progress-bar mode="indeterminate" />
          }
          <div class="login-card__body">
            <div class="login-brand">
              <div class="login-brand__mark">CT</div>
              <div>
                <h1 class="login-brand__title">Welcome Back</h1>
                <p class="login-brand__sub">Sign in to your account</p>
              </div>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field class="field-full" appearance="outline">
                <mat-label>Username</mat-label>
                <input
                  matInput
                  formControlName="username"
                  autocomplete="username"
                />
                @if (
                  form.controls.username.hasError("required") &&
                  form.controls.username.touched
                ) {
                  <mat-error>Username is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field class="field-full" appearance="outline">
                <mat-label>Password</mat-label>
                <input
                  matInput
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  mat-icon-button
                  matSuffix
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="
                    showPassword() ? 'Hide password' : 'Show password'
                  "
                >
                  <mat-icon>{{
                    showPassword() ? "visibility_off" : "visibility"
                  }}</mat-icon>
                </button>
                @if (
                  form.controls.password.hasError("required") &&
                  form.controls.password.touched
                ) {
                  <mat-error>Password is required</mat-error>
                }
              </mat-form-field>

              <div class="form-actions">
                <mat-checkbox formControlName="rememberMe">Remember me</mat-checkbox>
                <a href="#" class="forgot-link" (click)="$event.preventDefault()">Forgot Password?</a>
              </div>

              <button
                mat-flat-button
                color="primary"
                type="submit"
                class="field-full login-submit"
                [disabled]="loading()"
              >
                {{ loading() ? "Signing in…" : "Sign in" }}
              </button>
            </form>

            <p class="auth-footer" style="text-align:center;margin-top:20px;color:var(--ctms-ink-soft);font-size:0.95rem;">
              Don't have an account? <a routerLink="/register" style="color:var(--ctms-primary);text-decoration:none;font-weight:600">Register</a>
            </p>

            <mat-expansion-panel class="demo" hideToggle>
              <mat-expansion-panel-header>
                <mat-panel-title
                  ><mat-icon class="demo__icon">vpn_key</mat-icon> Demo
                  accounts</mat-panel-title
                >
              </mat-expansion-panel-header>
              <p class="muted demo__note">
                Seeded by <code>sql/sample_data.sql</code>. Tap one to fill the
                form.
              </p>
              @for (acct of demoAccounts; track acct.username) {
                <button type="button" class="demo__row" (click)="useDemo(acct)">
                  <span class="demo__role">{{ acct.label }}</span>
                  <span class="demo__creds"
                    >{{ acct.username }} / {{ acct.password }}</span
                  >
                </button>
              }
            </mat-expansion-panel>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .split-layout {
        display: flex;
        min-height: 100dvh;
        width: 100%;
        background-color: var(--ctms-bg);
      }
      
      .split-hero {
        display: none; /* Hide on mobile */
      }
      
      .split-form-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      
      @media (min-width: 900px) {
        .split-hero {
          display: flex;
          flex: 1.2;
          background: linear-gradient(135deg, var(--ctms-primary) 0%, #004566 100%);
          position: relative;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow: hidden;
        }
        
        .split-hero::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 40%),
                            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 40%);
        }
        
        .hero-content {
          color: white;
          max-width: 500px;
          z-index: 1;
          text-align: center;
        }
        
        .hero-icon mat-icon {
          font-size: 64px;
          height: 64px;
          width: 64px;
          margin-bottom: 24px;
          opacity: 0.9;
        }
        
        .hero-title {
          font-family: Fraunces, serif;
          font-size: 2.5rem;
          margin: 0 0 16px 0;
          line-height: 1.2;
        }
        
        .hero-subtitle {
          font-size: 1.1rem;
          opacity: 0.85;
          line-height: 1.6;
          margin: 0;
        }
      }

      .login-card {
        width: 100%;
        max-width: 440px;
        border-radius: 20px;
        overflow: hidden;
        padding: 0;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        border: none;
      }
      
      .login-card__body {
        padding: 40px;
      }
      
      @media (max-width: 600px) {
        .login-card__body {
          padding: 24px;
        }
      }
      
      .login-brand {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 32px;
      }
      .login-brand__mark {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        background: var(--ctms-primary);
        color: #fff;
        font-weight: 700;
        font-family: Fraunces, serif;
        font-size: 1.2rem;
        box-shadow: 0 4px 12px rgba(0, 101, 143, 0.3);
      }
      .login-brand__title {
        margin: 0;
        font-size: 1.7rem;
        color: var(--ctms-ink);
      }
      .login-brand__sub {
        margin: 4px 0 0;
        color: var(--ctms-ink-soft);
        font-size: 0.95rem;
      }
      
      .field-full {
        width: 100%;
        margin-bottom: 8px;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        margin-top: 4px;
      }
      
      .forgot-link {
        color: var(--ctms-primary);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.9rem;
      }
      
      .forgot-link:hover {
        text-decoration: underline;
      }
      
      .login-submit {
        height: 50px;
        font-weight: 600;
        font-size: 1rem;
        border-radius: 8px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .login-submit:not([disabled]):hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 101, 143, 0.25);
      }

      .demo {
        margin-top: 32px;
        box-shadow: none;
        border: 1px solid var(--ctms-border);
        border-radius: 12px;
        background: var(--ctms-bg);
      }
      .demo__icon {
        vertical-align: middle;
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 6px;
      }
      .demo__note {
        font-size: 0.85rem;
        margin: 0 0 12px;
        color: var(--ctms-ink-soft);
      }
      .demo__row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        background: transparent;
        border: none;
        border-top: 1px solid var(--ctms-border);
        padding: 12px 4px;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s;
      }
      .demo__row:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      .demo__role {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--ctms-ink);
      }
      .demo__creds {
        color: var(--ctms-ink-soft);
        font-size: 0.8rem;
        font-family: monospace;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ui = inject(UiService);

  readonly loading = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
    rememberMe: [false],
  });

  readonly demoAccounts: DemoAccount[] = [
    { label: "Administrator", username: "admin", password: "Admin@123" },
    {
      label: "Clinical Manager",
      username: "cm.alex",
      password: "Clinical@123",
    },
    { label: "Trial Manager", username: "mgr.kate", password: "Manager@123" },
    { label: "Doctor", username: "dr.smith", password: "Doctor@123" },
    { label: "Participant", username: "p.john", password: "Patient@123" },
  ];

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.auth.landingRoute());
    }
  }

  useDemo(acct: DemoAccount): void {
    this.form.patchValue({ username: acct.username, password: acct.password });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    
    // We pass only username and password to login API.
    const { username, password } = this.form.getRawValue();
    
    this.auth.login({ username, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.ui.success("Login successful! Welcome back.");
        const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
        this.router.navigateByUrl(returnUrl || this.auth.landingRoute());
      },
      error: () => {
        this.loading.set(false);
        this.ui.error("Invalid username or password.");
      },
    });
  }
}
