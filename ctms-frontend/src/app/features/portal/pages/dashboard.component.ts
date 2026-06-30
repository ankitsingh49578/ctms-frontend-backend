import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PortalService } from '../services/portal.service';
import { ParticipantDashboardResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

interface Stat {
  label: string;
  value: number;
  icon: string;
  link?: string;
}

@Component({
  selector: 'ctms-portal-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <section class="page">
      <div class="hero hero--light" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div class="hero__icon"><mat-icon>person</mat-icon></div>
          <h1>
            @if (data(); as d) { Welcome back, {{ firstName(d.fullName) }} }
            @else { Dashboard }
          </h1>
          <p>Your trials, visits and consents at a glance.</p>
        </div>
        @if (data(); as d) {
          <span class="chip" [class]="'chip--' + tone(d.accountStatus)">
            Account: {{ d.accountStatus }}
          </span>
        }
      </div>

      @if (loading()) {
        <div class="grid grid--stats">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="stat skeleton-card" style="height:120px; border-radius:12px; background:#f0f2f5; animation: pulse 1.5s infinite"></div>
          }
        </div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (data()) {
        <div class="grid grid--stats">
          @for (s of stats(); track s.label) {
            @if (s.link) {
              <a class="stat stat--accent stat--link" [routerLink]="s.link" style="text-decoration:none;color:inherit">
                <div class="stat__icon"><mat-icon>{{ s.icon }}</mat-icon></div>
                <div class="stat__value">{{ s.value }}</div>
                <div class="stat__label">{{ s.label }}</div>
              </a>
            } @else {
              <div class="stat stat--accent">
                <div class="stat__icon"><mat-icon>{{ s.icon }}</mat-icon></div>
                <div class="stat__value">{{ s.value }}</div>
                <div class="stat__label">{{ s.label }}</div>
              </div>
            }
          }
        </div>

        <div class="card" style="margin-top:24px">
          <h3 class="section-title"><mat-icon>bolt</mat-icon>Quick actions</h3>
          <p class="muted" style="margin:0 0 14px; font-size:.9rem;">Jump straight to what needs your attention.</p>
          <div class="row-actions" style="flex-wrap:wrap;gap:10px">
            <a mat-flat-button routerLink="/portal/trials"><mat-icon>science</mat-icon>Browse trials</a>
            <a mat-stroked-button routerLink="/portal/consents"><mat-icon>fact_check</mat-icon>Review consents</a>
            <a mat-stroked-button routerLink="/portal/visits"><mat-icon>event</mat-icon>My visits</a>
            <a mat-stroked-button routerLink="/portal/notifications"><mat-icon>notifications</mat-icon>Notifications</a>
          </div>
        </div>
      }
    </section>
  `,
})
export class PortalDashboardComponent {
  private readonly portal = inject(PortalService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<ParticipantDashboardResponse | null>(null);
  readonly stats = signal<Stat[]>([]);

  readonly tone = statusTone;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.dashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.stats.set([
          { label: 'Total enrollments', value: d.totalEnrollments, icon: 'science', link: '/portal/enrollments' },
          { label: 'Active enrollments', value: d.activeEnrollments, icon: 'check_circle', link: '/portal/enrollments' },
          { label: 'Pending applications', value: d.pendingApplications, icon: 'hourglass_top', link: '/portal/enrollments' },
          { label: 'Pending consents', value: d.pendingConsents, icon: 'fact_check', link: '/portal/consents' },
          { label: 'Total visits', value: d.totalVisits, icon: 'event', link: '/portal/visits' },
          { label: 'Unread notifications', value: d.unreadNotifications, icon: 'notifications', link: '/portal/notifications' },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load your dashboard. Please try again.');
        this.loading.set(false);
      },
    });
  }

  firstName(full: string): string {
    return (full ?? '').trim().split(/\s+/)[0] || 'there';
  }
}
