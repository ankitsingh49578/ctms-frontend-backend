import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortalService } from '../services/portal.service';
import { UiService } from '../../../core/services/ui.service';
import { AdverseEventResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-portal-adverse-event-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="page">
      <header class="page__head">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button mat-icon-button (click)="location.back()"><mat-icon>arrow_back</mat-icon></button>
          <div>
            <h1 class="page__title">Adverse Event Details</h1>
            @if (event()) {
              <p class="page__subtitle">Reported for {{ event()?.trialName || 'Trial #' + event()?.trialId }} on {{ event()?.createdAt | date:'mediumDate' }}</p>
            }
          </div>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading details...</p></div>
      } @else if (error()) {
        <div class="state state--error">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Try Again</button>
        </div>
      } @else if (event()) {
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div>
              <h2 style="font-size: 1.5rem; margin-bottom: 4px;">{{ event()!.title || 'Adverse Event #' + event()!.eventId }}</h2>
              <span class="chip" [class]="'chip--' + tone(event()!.severity)">{{ event()!.severity }} Severity</span>
            </div>
            <span class="chip" [class]="'chip--' + tone(event()!.status)">Status: {{ event()!.status }}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div class="info-group">
              <label style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Start Date</label>
              <div>{{ event()!.startDate ? (event()!.startDate | date:'mediumDate') : '—' }}</div>
            </div>
            <div class="info-group">
              <label style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">End Date</label>
              <div>{{ event()!.endDate ? (event()!.endDate | date:'mediumDate') : '—' }}</div>
            </div>
            <div class="info-group">
              <label style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Requires Medical Attention</label>
              <div>{{ event()!.requiresMedicalAttention ? 'Yes' : 'No' }}</div>
            </div>
          </div>

          <div class="info-group" style="margin-bottom: 16px;">
            <label style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Symptoms</label>
            <p style="margin: 4px 0 0; white-space: pre-wrap;">{{ event()!.symptoms || '—' }}</p>
          </div>

          <div class="info-group" style="margin-bottom: 16px;">
            <label style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Detailed Description</label>
            <p style="margin: 4px 0 0; white-space: pre-wrap;">{{ event()!.description || '—' }}</p>
          </div>

          <div class="info-group">
            <label style="font-weight: 500; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Actions Taken</label>
            <p style="margin: 4px 0 0; white-space: pre-wrap;">{{ event()!.actionsTaken || '—' }}</p>
          </div>
        </div>
      }
    </section>
  `
})
export class PortalAdverseEventDetailComponent {
  readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  private readonly portal = inject(PortalService);

  readonly event = signal<AdverseEventResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly tone = statusTone;

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    this.portal.getAdverseEvent(id).subscribe({
      next: (res) => {
        this.event.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load adverse event details.');
        this.loading.set(false);
      }
    });
  }
}
