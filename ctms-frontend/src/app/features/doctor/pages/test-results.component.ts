import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { TestResultService } from '../../clinical/services/safety.service';
import { UiService } from '../../../core/services/ui.service';
import { Page } from '../../../core/models/api.models';
import { TestResultResponse } from '../../../core/models/domain.models';
import { statusTone, TEST_RESULT_STATUSES } from '../../../core/models/enums';
import { TestResultFormDialogComponent } from '../dialogs/test-result-form.dialog';
import { PatientResultsDialogComponent } from '../dialogs/patient-results.dialog';

@Component({
  selector: 'ctms-doctor-test-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Test results</h1>
          <p class="page__subtitle">Record and review lab and clinical results.</p>
        </div>
        <button mat-flat-button (click)="record()"><mat-icon>add</mat-icon>Record result</button>
      </header>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search by Patient Name or ID</mat-label>
          <input matInput [formControl]="search" placeholder="e.g. John Doe or 1001" />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:180px">
          <mat-label>Status</mat-label>
          <mat-select [formControl]="status">
            <mat-option [value]="''">All</mat-option>
            @for (s of statuses; track s) { <mat-option [value]="s">{{ s }}</mat-option> }
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading results…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>biotech</mat-icon><p>No test results match your filters.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
            <ng-container matColumnDef="patientId">
              <th mat-header-cell *matHeaderCellDef>Patient ID</th>
              <td mat-cell *matCellDef="let r">#{{ r.patientId }}</td>
            </ng-container>
            <ng-container matColumnDef="patientName">
              <th mat-header-cell *matHeaderCellDef>Patient Name</th>
              <td mat-cell *matCellDef="let r" style="font-weight:500">{{ r.patientName }}</td>
            </ng-container>
            <ng-container matColumnDef="trialName">
              <th mat-header-cell *matHeaderCellDef>Trial Name</th>
              <td mat-cell *matCellDef="let r">{{ r.trialName || 'Unknown Trial' }}</td>
            </ng-container>
            <ng-container matColumnDef="latestResultDate">
              <th mat-header-cell *matHeaderCellDef>Latest Test Date</th>
              <td mat-cell *matCellDef="let r">{{ r.latestResultDate ? (r.latestResultDate | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="totalResults">
              <th mat-header-cell *matHeaderCellDef>Total Results</th>
              <td mat-cell *matCellDef="let r">
                <span style="background:#e2e8f0;padding:2px 8px;border-radius:12px;font-weight:600;font-size:0.85rem">
                  {{ r.totalResults }} tests
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r"><span class="chip chip--good">{{ r.status || 'Active' }}</span></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r" style="text-align:right">
                <button mat-button color="primary" (click)="viewPatientResults(r)"><mat-icon>visibility</mat-icon> View Results</button>
              </td>
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
export class DoctorTestResultsComponent {
  private readonly results = inject(TestResultService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly tone = statusTone;
  readonly statuses = TEST_RESULT_STATUSES;
  readonly search = new FormControl('', { nonNullable: true });
  readonly status = new FormControl('', { nonNullable: true });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<import('../../../core/models/domain.models').PatientTestResultSummaryResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  readonly columns = ['patientId', 'patientName', 'trialName', 'latestResultDate', 'totalResults', 'status', 'actions'];
  pageIndex = 0;
  size = 10;

  constructor() {
    this.load();
    this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => { this.pageIndex = 0; this.load(); });
    this.status.valueChanges.pipe(distinctUntilChanged()).subscribe(() => { this.pageIndex = 0; this.load(); });
  }

  private get filtering(): boolean {
    return !!this.search.value.trim();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const q = { page: this.pageIndex, size: this.size, sort: 'patient.patientId,asc' };
    const req = this.filtering
      ? this.results.patientSummaries({ keyword: this.search.value.trim(), ...q })
      : this.results.patientSummaries(q);
    req.subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: () => { this.error.set('We could not load test results. Please try again.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  record(): void {
    this.dialog.open(TestResultFormDialogComponent, { width: '700px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  viewPatientResults(r: any): void {
    this.dialog.open(PatientResultsDialogComponent, {
      data: { patientId: r.patientId, patientName: r.patientName, trialName: r.trialName },
      width: '900px',
      panelClass: 'ctms-dialog'
    });
  }
}
