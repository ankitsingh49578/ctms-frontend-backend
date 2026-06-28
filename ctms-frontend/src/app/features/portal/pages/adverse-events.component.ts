import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from '../services/portal.service';
import { AdverseEventResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'ctms-portal-adverse-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatTableModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Adverse Events</h1>
          <p class="page__subtitle">Safety events reported in connection with your participation.</p>
        </div>
        <a mat-flat-button routerLink="/portal/adverse-events/new"><mat-icon>add</mat-icon>Report Adverse Event</a>
      </header>

      @if (!loading() && !error() && rows().length) {
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div class="stat-card" style="background: var(--surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Total Reported</div>
            <div style="font-size: 2rem; font-weight: 600; margin-top: 8px;">{{ rows().length }}</div>
          </div>
          <div class="stat-card" style="background: var(--surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Open Events</div>
            <div style="font-size: 2rem; font-weight: 600; margin-top: 8px;">{{ getCountByStatus('Submitted') }}</div>
          </div>
          <div class="stat-card" style="background: var(--surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Under Review</div>
            <div style="font-size: 2rem; font-weight: 600; margin-top: 8px;">{{ getCountByStatus('Under Review') + getCountByStatus('Investigating') }}</div>
          </div>
          <div class="stat-card" style="background: var(--surface); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Closed Events</div>
            <div style="font-size: 2rem; font-weight: 600; margin-top: 8px;">{{ getCountByStatus('Resolved') + getCountByStatus('Closed') }}</div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading events…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!rows().length) {
        <div class="state">
          <mat-icon>verified_user</mat-icon>
          <p>No adverse events have been reported. That's good news.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()">
            <ng-container matColumnDef="eventId">
              <th mat-header-cell *matHeaderCellDef>Event ID</th>
              <td mat-cell *matCellDef="let e">#{{ e.eventId }}</td>
            </ng-container>
            <ng-container matColumnDef="trialName">
              <th mat-header-cell *matHeaderCellDef>Trial Name</th>
              <td mat-cell *matCellDef="let e">{{ e.trialName || 'Trial #' + e.trialId }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Report Date</th>
              <td mat-cell *matCellDef="let e">{{ e.createdAt ? (e.createdAt | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="severity">
              <th mat-header-cell *matHeaderCellDef>Severity</th>
              <td mat-cell *matCellDef="let e">
                <span class="chip" [class]="'chip--' + tone(e.severity)">{{ e.severity }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e" style="text-align: right;">
                <a mat-stroked-button [routerLink]="['/portal/adverse-events', e.eventId]">View Details</a>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <p class="muted" style="margin-top:12px;font-size:.82rem">
          If you are experiencing a new symptom or medical emergency, contact your study team
          or local emergency services directly — do not wait for it to appear here.
        </p>
      }
    </section>
  `,
})
export class PortalAdverseEventsComponent {
  private readonly portal = inject(PortalService);

  readonly columns = ['eventId', 'trialName', 'date', 'severity', 'status', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<AdverseEventResponse[]>([]);

  constructor() {
    this.load();
  }

  getCountByStatus(status: string): number {
    return this.rows().filter(r => r.status === status).length;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.myAdverseEvents().subscribe({
      next: (list) => {
        this.rows.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load adverse events. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
