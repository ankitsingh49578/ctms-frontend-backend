import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PortalService } from '../services/portal.service';
import { Page } from '../../../core/models/api.models';
import { TrialResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-portal-trials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterLink, MatTableModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatButtonModule, MatIconModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Browse Trials</h1>
          <p class="page__subtitle">Explore active and planned studies you may be eligible for.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading trials…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>science</mat-icon><p>No trials are listed right now.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let t">{{ t.trialCode }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Trial</th>
              <td mat-cell *matCellDef="let t">
                <a [routerLink]="['/portal/trials', t.trialId]">{{ t.trialName }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="phase">
              <th mat-header-cell *matHeaderCellDef>Phase</th>
              <td mat-cell *matCellDef="let t">Phase {{ t.phase }}</td>
            </ng-container>
            <ng-container matColumnDef="dates">
              <th mat-header-cell *matHeaderCellDef>Dates</th>
              <td mat-cell *matCellDef="let t">
                {{ t.startDate ? (t.startDate | date:'mediumDate') : '—' }}
                @if (t.endDate) { → {{ t.endDate | date:'mediumDate' }} }
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t">
                <span class="chip" [class]="'chip--' + tone(t.status)">{{ t.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let t">
                <a mat-button [routerLink]="['/portal/trials', t.trialId]">View<mat-icon>chevron_right</mat-icon></a>
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
export class PortalTrialsComponent {
  private readonly portal = inject(PortalService);

  readonly columns = ['code', 'name', 'phase', 'dates', 'status', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<TrialResponse>>({
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
    this.portal.browseTrials({ page: this.pageIndex, size: this.size, sort: 'trialId,desc' }).subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load trials. Please try again.');
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
