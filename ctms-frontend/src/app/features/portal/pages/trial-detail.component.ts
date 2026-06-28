import { ChangeDetectionStrategy, Component, inject, input, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PortalService } from '../services/portal.service';
import { UiService } from '../../../core/services/ui.service';
import { EnrollmentResponse, TrialResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-portal-trial-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterLink, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDividerModule,
  ],
  template: `
    <section class="page trial-detail-page">
      <a mat-button routerLink="/portal/trials" style="margin-bottom:8px">
        <mat-icon>arrow_back</mat-icon>All trials
      </a>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading trial…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (trial()) {
        @let t = trial()!;
        <div class="trial-header card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
            <div>
              <h1 class="page__title" style="margin:0">{{ t.trialName }}</h1>
              <p class="muted" style="margin:6px 0 0">{{ t.trialCode }} · Phase {{ t.phase }}</p>
            </div>
            <span class="chip" [class]="'chip--' + tone(t.status)">{{ t.status }}</span>
          </div>

          <mat-divider style="margin:20px 0"></mat-divider>

          @if (enrollment(); as e) {
            <div class="enrollment-status success-banner">
              <mat-icon>check_circle</mat-icon>
              <div>
                <strong>You are applied to this trial</strong>
                <p>Status: <span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span> (Date: {{ e.enrollmentDate | date:'mediumDate' }})</p>
              </div>
              <a mat-stroked-button routerLink="/portal/enrollments" style="margin-left:auto">Manage</a>
            </div>
          } @else if (canApply(t)) {
            <div class="enrollment-action info-banner">
              <div>
                <strong>Register Interest</strong>
                <p>Applying registers your interest. A coordinator will review your eligibility and reach out.</p>
              </div>
              <button mat-flat-button color="primary" [disabled]="applying()" (click)="apply(t.trialId)">
                <mat-icon>how_to_reg</mat-icon>
                @if (applying()) { Applying… } @else { Apply to trial }
              </button>
            </div>
          } @else {
            <div class="enrollment-closed info-banner">
              <mat-icon>info</mat-icon>
              <p>This trial is currently <strong>{{ t.status }}</strong> and not accepting new applications.</p>
            </div>
          }
        </div>

        <div class="trial-content">
          <div class="card">
            <h3>Study Overview</h3>
            @if (t.description) {
              <p class="trial-description">{{ t.description }}</p>
            }
          </div>

          <div class="card">
            <h3>Timeline & Details</h3>
            <div class="form-grid">
              <div>
                <div class="muted">Start date</div>
                <div class="detail-val">{{ t.startDate ? (t.startDate | date:'longDate') : 'To be announced' }}</div>
              </div>
              <div>
                <div class="muted">End date</div>
                <div class="detail-val">{{ t.endDate ? (t.endDate | date:'longDate') : 'Ongoing' }}</div>
              </div>
              <div>
                <div class="muted">Study Phase</div>
                <div class="detail-val">Phase {{ t.phase }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>Participation</h3>
            <ul class="participation-list">
              <li><mat-icon>schedule</mat-icon> Duration depends on trial phase and individual response.</li>
              <li><mat-icon>location_on</mat-icon> On-site visits may be required at our clinical centers.</li>
              <li><mat-icon>payments</mat-icon> Compensation for time and travel may be available.</li>
            </ul>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .trial-header { margin-bottom: 24px; }
    .trial-content { display: grid; gap: 24px; }
    @media (min-width: 768px) { .trial-content { grid-template-columns: 2fr 1fr; } .trial-content > .card:first-child { grid-column: 1 / -1; } }
    .success-banner { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border-left: 4px solid var(--ctms-success, #22c55e); }
    .success-banner mat-icon { color: var(--ctms-success, #22c55e); font-size: 32px; height: 32px; width: 32px; }
    .success-banner p { margin: 4px 0 0; font-size: 0.9rem; }
    .info-banner { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(37, 99, 235, 0.05); border-radius: 8px; border-left: 4px solid var(--primary, #2563eb); justify-content: space-between; flex-wrap: wrap; }
    .info-banner p { margin: 4px 0 0; font-size: 0.9rem; color: #555; }
    .detail-val { font-size: 1.1rem; font-weight: 500; margin-top: 4px; }
    .participation-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .participation-list li { display: flex; align-items: center; gap: 10px; color: #444; }
    .participation-list mat-icon { color: #888; }
  `]
})
export class PortalTrialDetailComponent implements OnInit {
  private readonly portal = inject(PortalService);
  private readonly ui = inject(UiService);

  /** Bound from the :id route param (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly applying = signal(false);
  readonly error = signal<string | null>(null);
  readonly trial = signal<TrialResponse | null>(null);
  readonly enrollment = signal<EnrollmentResponse | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const trialId = Number(this.id());
    if (!Number.isFinite(trialId)) {
      this.error.set('Invalid trial reference.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      trial: this.portal.getTrial(trialId),
      enrollments: this.portal.myEnrollments().pipe(
        catchError(() => of([]))
      ),
    }).subscribe({
      next: ({ trial, enrollments }) => {
        this.trial.set(trial);
        this.enrollment.set(enrollments.find((e) => e.trialId === trialId) ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load this trial. Please try again.');
        this.loading.set(false);
      },
    });
  }

  canApply(t: TrialResponse): boolean {
    return t.status === 'Active' || t.status === 'Planned';
  }

  apply(trialId: number): void {
    this.applying.set(true);
    this.portal.applyToTrial({ trialId }).subscribe({
      next: (e) => {
        this.enrollment.set(e);
        this.applying.set(false);
        this.ui.success('Application submitted. Track its status under My Applications.');
      },
      error: () => this.applying.set(false),
    });
  }
}
