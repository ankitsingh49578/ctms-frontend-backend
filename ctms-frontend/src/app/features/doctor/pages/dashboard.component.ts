import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DoctorContextService } from '../doctor.context';
import { VisitService } from '../../clinical/services/visits.service';
import { TestResultService } from '../../clinical/services/safety.service';
import { DoctorResponse } from '../../../core/models/domain.models';

@Component({
  selector: 'ctms-doctor-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <section class="page">
      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading your dashboard…</p></div>
      } @else if (noProfile()) {
        <div class="hero"><div class="hero__icon"><mat-icon>stethoscope</mat-icon></div>
          <h1>Welcome, Doctor</h1>
          <p>Your account isn't linked to a doctor profile yet, so visit and result tools are unavailable.
             Ask an administrator to create your doctor record, then sign in again.</p>
        </div>
      } @else {
        <div class="hero">
          <div class="hero__icon"><mat-icon>stethoscope</mat-icon></div>
          <h1>Welcome, {{ doctor()?.doctorName || 'Doctor' }}</h1>
          <p>{{ doctor()?.specialization || 'Clinical investigator' }} · review your visits, record results and flag safety events.</p>
        </div>

        <div class="grid grid--stats">
          <a class="stat stat--accent stat--link" routerLink="../visits">
            <div class="stat__icon"><mat-icon>event_upcoming</mat-icon></div>
            <div class="stat__value">{{ upcomingCount() }}</div>
            <div class="stat__label">Upcoming visits</div>
          </a>
          <a class="stat stat--accent stat--link" routerLink="../visits">
            <div class="stat__icon"><mat-icon>calendar_month</mat-icon></div>
            <div class="stat__value">{{ myVisits() }}</div>
            <div class="stat__label">Visits assigned to me</div>
          </a>
          <a class="stat stat--accent stat--link" routerLink="../test-results">
            <div class="stat__icon"><mat-icon>biotech</mat-icon></div>
            <div class="stat__value">{{ resultCount() }}</div>
            <div class="stat__label">Test results recorded</div>
          </a>
        </div>

        <div class="card" style="margin-top:20px">
          <h3 class="section-title"><mat-icon>bolt</mat-icon>Quick actions</h3>
          <div class="row-actions" style="flex-wrap:wrap;gap:10px">
            <a mat-stroked-button routerLink="../visits"><mat-icon>event</mat-icon>My visits</a>
            <a mat-stroked-button routerLink="../test-results"><mat-icon>biotech</mat-icon>Test results</a>
            <a mat-stroked-button routerLink="../adverse-events"><mat-icon>health_and_safety</mat-icon>Adverse events</a>
            <a mat-stroked-button routerLink="../trials"><mat-icon>science</mat-icon>Trials</a>
          </div>
        </div>
      }
    </section>
  `,
})
export class DoctorDashboardComponent {
  private readonly ctx = inject(DoctorContextService);
  private readonly visits = inject(VisitService);
  private readonly results = inject(TestResultService);

  readonly loading = signal(true);
  readonly noProfile = signal(false);
  readonly doctor = signal<DoctorResponse | null>(null);
  readonly upcomingCount = signal(0);
  readonly myVisits = signal(0);
  readonly resultCount = signal(0);

  constructor() {
    this.ctx.profile().subscribe({
      next: (doc) => {
        this.doctor.set(doc);
        forkJoin({
          upcoming: this.visits.upcoming().pipe(catchError(() => of([]))),
          mine: this.visits.byDoctor(doc.doctorId).pipe(catchError(() => of([]))),
          count: this.results.count().pipe(catchError(() => of(0))),
        }).subscribe((r) => {
          this.upcomingCount.set(r.upcoming.length);
          this.myVisits.set(r.mine.length);
          this.resultCount.set(r.count);
          this.loading.set(false);
        });
      },
      error: () => { this.noProfile.set(true); this.loading.set(false); },
    });
  }
}
