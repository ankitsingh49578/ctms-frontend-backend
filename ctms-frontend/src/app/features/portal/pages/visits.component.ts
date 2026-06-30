import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from '../services/portal.service';
import { Page } from '../../../core/models/api.models';
import { VisitResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-portal-visits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">My Visits</h1>
          <p class="page__subtitle">Scheduled and completed study visits across your trials.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading visits…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>event</mat-icon><p>You have no visits scheduled.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="visit">
              <th mat-header-cell *matHeaderCellDef>Visit</th>
              <td mat-cell *matCellDef="let v">
                {{ v.visitType || 'Visit' }}@if (v.visitNumber) { #{{ v.visitNumber }} }
                <div class="muted" style="font-size:.76rem">{{ v.trialName || 'Trial #' + v.trialId }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="scheduled">
              <th mat-header-cell *matHeaderCellDef>Scheduled</th>
              <td mat-cell *matCellDef="let v">{{ v.scheduledDate ? (v.scheduledDate | date:'medium') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="window">
              <th mat-header-cell *matHeaderCellDef>Window</th>
              <td mat-cell *matCellDef="let v">
                @if (v.windowStart || v.windowEnd) {
                  {{ v.windowStart ? (v.windowStart | date:'shortDate') : '…' }} –
                  {{ v.windowEnd ? (v.windowEnd | date:'shortDate') : '…' }}
                } @else { — }
              </td>
            </ng-container>
            <ng-container matColumnDef="actual">
              <th mat-header-cell *matHeaderCellDef>Actual</th>
              <td mat-cell *matCellDef="let v">{{ v.actualDate ? (v.actualDate | date:'medium') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v">
                <span class="chip" [class]="'chip--' + tone(v.visitStatus)">{{ v.visitStatus }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="page().totalElements"
          [pageSize]="page().size || size"
          [pageIndex]="page().number"
          [pageSizeOptions]="[5, 10, 20, 50]"
          (page)="onPage($event)" />
      }
    </section>
  `,
})
export class PortalVisitsComponent {
  private readonly portal = inject(PortalService);

  readonly columns = ['visit', 'scheduled', 'window', 'actual', 'status'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<VisitResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  pageIndex = 0;
  size = 10;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.myVisits({ page: this.pageIndex, size: this.size, sort: 'scheduledDate,desc' }).subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load your visits. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }
}
