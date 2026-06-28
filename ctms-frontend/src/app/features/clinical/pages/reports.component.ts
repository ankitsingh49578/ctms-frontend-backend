import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { InsightsService } from '../services/insights.service';
import { Page } from '../../../core/models/api.models';
import { ReportResponse } from '../../../core/models/domain.models';
import { ReportFormDialogComponent } from '../dialogs/report-form.dialog';

@Component({
  selector: 'ctms-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Reports</h1>
          <p class="page__subtitle">Generate and review study reports.</p>
        </div>
        <button mat-flat-button (click)="generate()"><mat-icon>note_add</mat-icon>Generate report</button>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading reports…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>summarize</mat-icon><p>No reports generated yet.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Report</th>
              <td mat-cell *matCellDef="let r">{{ r.reportName }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let r"><span class="chip chip--neutral">{{ r.reportType }}</span></td>
            </ng-container>
            <ng-container matColumnDef="trial">
              <th mat-header-cell *matHeaderCellDef>Scope</th>
              <td mat-cell *matCellDef="let r">{{ r.trialId ? 'Trial #' + r.trialId : 'All trials' }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Generated</th>
              <td mat-cell *matCellDef="let r">{{ r.generatedDate ? (r.generatedDate | date:'medium') : '—' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="page().totalElements" [pageSize]="page().size || size"
          [pageIndex]="page().number" [pageSizeOptions]="[5,10,20,50]" (page)="onPage($event)" />
      }
    </section>
  `,
})
export class ReportsComponent {
  private readonly insights = inject(InsightsService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<ReportResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  readonly columns = ['name', 'type', 'trial', 'date'];
  pageIndex = 0;
  size = 10;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.insights.listReports({ page: this.pageIndex, size: this.size, sort: 'generatedDate,desc' }).subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: () => { this.error.set('We could not load reports. Please try again.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  generate(): void {
    this.dialog.open(ReportFormDialogComponent, { data: null, width: '560px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }
}
