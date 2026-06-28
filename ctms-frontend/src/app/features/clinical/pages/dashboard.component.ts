import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InsightsService } from '../services/insights.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardResponse } from '../../../core/models/domain.models';

interface QuickLink { label: string; icon: string; link: string; }

@Component({
  selector: 'ctms-clinical-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <section class="page">
      <div class="hero">
        <div class="hero__icon"><mat-icon>insights</mat-icon></div>
        <h1>{{ greeting() }}</h1>
        <p>{{ subtitle() }}</p>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading portfolio metrics…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (data()) {
        @let d = data()!;
        <div class="grid grid--stats">
          <a class="stat stat--accent stat--link" routerLink="../trials">
            <div class="stat__icon"><mat-icon>science</mat-icon></div>
            <div class="stat__value">{{ d.activeTrials }}</div>
            <div class="stat__label">Active trials</div>
            <span class="stat__hint">of {{ d.totalTrials }} total</span>
          </a>
          <a class="stat stat--accent stat--link" routerLink="../patients">
            <div class="stat__icon"><mat-icon>groups</mat-icon></div>
            <div class="stat__value">{{ d.totalPatients }}</div>
            <div class="stat__label">Patients</div>
            @if (d.latestSnapshot; as s) { <span class="stat__hint">{{ s.enrolledPatients }} enrolled</span> }
          </a>
          @if (snap(); as s) {
            <div class="stat stat--accent">
              <div class="stat__icon"><mat-icon>event_upcoming</mat-icon></div>
              <div class="stat__value">{{ s.pendingVisits }}</div>
              <div class="stat__label">Pending visits</div>
              @if (s.overdueVisits) { <span class="stat__hint" style="color:var(--ctms-danger)">{{ s.overdueVisits }} overdue</span> }
            </div>
          }
          @if (showReports()) {
            <a class="stat stat--accent stat--link" routerLink="../reports">
              <div class="stat__icon"><mat-icon>summarize</mat-icon></div>
              <div class="stat__value">{{ d.totalReports }}</div>
              <div class="stat__label">Reports generated</div>
            </a>
          }
        </div>

        @if (snap(); as s) {
          <div class="card" style="margin-top:20px">
            <h3 class="section-title"><mat-icon>monitoring</mat-icon>Study health</h3>
            <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px">
              <div class="metric">
                <div class="metric__top">
                  <span class="metric__label">Visit completion rate</span>
                  <span class="metric__value">{{ pct(s.completionRate) }}</span>
                </div>
                <div class="metric__bar"><div class="metric__fill" [style.width.%]="pctNum(s.completionRate)"></div></div>
              </div>
              <div class="metric">
                <div class="metric__top">
                  <span class="metric__label">Protocol compliance rate</span>
                  <span class="metric__value">{{ pct(s.complianceRate) }}</span>
                </div>
                <div class="metric__bar"><div class="metric__fill" [style.width.%]="pctNum(s.complianceRate)"></div></div>
              </div>
            </div>
            @if (s.metricDate) {
              <p class="muted" style="margin:14px 0 0;font-size:.78rem">
                Snapshot from {{ s.metricDate }}. Figures come straight from the backend analytics endpoint.
              </p>
            }
          </div>
        } @else {
          <div class="card" style="margin-top:20px">
            <h3 class="section-title"><mat-icon>monitoring</mat-icon>Study health</h3>
            <p class="muted" style="margin:0">
              No analytics snapshot has been generated yet. Once an administrator captures a
              snapshot, completion and compliance rates will appear here.
            </p>
          </div>
        }

        <div class="card" style="margin-top:20px">
          <h3 class="section-title"><mat-icon>bolt</mat-icon>Quick actions</h3>
          <div class="row-actions" style="flex-wrap:wrap;gap:10px">
            @for (q of links(); track q.link) {
              <a mat-stroked-button [routerLink]="q.link"><mat-icon>{{ q.icon }}</mat-icon>{{ q.label }}</a>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class ClinicalDashboardComponent {
  private readonly insights = inject(InsightsService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<DashboardResponse | null>(null);
  readonly snap = computed(() => this.data()?.latestSnapshot ?? null);

  private readonly role = this.auth.roleKey;
  readonly showReports = computed(() => {
    const r = this.role();
    return r === 'CLINICAL_MANAGER' || r === 'TRIAL_MANAGER';
  });

  readonly greeting = computed(() =>
    this.role() === 'TRIAL_MANAGER' ? 'Trial Manager workspace' : 'Clinical Manager workspace');
  readonly subtitle = computed(() =>
    this.role() === 'TRIAL_MANAGER'
      ? 'Oversee your trial portfolio, recruitment and study performance at a glance.'
      : 'Coordinate trials, patients, consents and visits across your studies.');

  readonly links = computed<QuickLink[]>(() => {
    const base: QuickLink[] = [
      { label: 'Trials', icon: 'science', link: '../trials' },
      { label: 'Patients', icon: 'groups', link: '../patients' },
      { label: 'Visits', icon: 'event', link: '../visits' },
    ];
    if (this.role() === 'CLINICAL_MANAGER') {
      base.push({ label: 'Consents', icon: 'fact_check', link: '../consents' });
      base.push({ label: 'Adverse events', icon: 'health_and_safety', link: '../adverse-events' });
    }
    if (this.showReports()) base.push({ label: 'Reports', icon: 'summarize', link: '../reports' });
    return base;
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.insights.dashboard().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('We could not load portfolio metrics. Please try again.'); this.loading.set(false); },
    });
  }

  pctNum(v: number | undefined | null): number {
    if (v == null) return 0;
    // Backend may express rate as 0–1 or 0–100; normalise to 0–100 for the bar.
    const n = v <= 1 ? v * 100 : v;
    return Math.max(0, Math.min(100, Math.round(n)));
  }
  pct(v: number | undefined | null): string {
    if (v == null) return '—';
    return `${this.pctNum(v)}%`;
  }
}
