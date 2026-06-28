import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PortalService } from '../services/portal.service';
import { TestResultResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

export interface Group {
  isGroup: boolean;
  trialName: string;
}

@Component({
  selector: 'ctms-portal-results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, MatTableModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule
  ],
  template: `
    <section class="page">
      <header class="page__head" style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 class="page__title">Test Results</h1>
          <p class="page__subtitle">Laboratory and assessment results recorded during your visits.</p>
        </div>
        @if (trials().length > 0) {
          <mat-form-field appearance="outline" style="width: 250px;">
            <mat-label>Filter by Trial</mat-label>
            <mat-select [ngModel]="selectedTrialId()" (ngModelChange)="onTrialChange($event)">
              <mat-option [value]="null">All Trials</mat-option>
              @for (t of trials(); track t.id) {
                <mat-option [value]="t.id">{{ t.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading results…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!dataSource.data.length) {
        <div class="state"><mat-icon>biotech</mat-icon><p>No test results have been recorded yet.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="test">
              <th mat-header-cell *matHeaderCellDef>Test Name</th>
              <td mat-cell *matCellDef="let r">{{ r.testName }}</td>
            </ng-container>
            <ng-container matColumnDef="result">
              <th mat-header-cell *matHeaderCellDef>Result</th>
              <td mat-cell *matCellDef="let r">
                <strong>{{ r.resultValue || '—' }}</strong>@if (r.unit) { <span class="muted"> {{ r.unit }}</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="collected">
              <th mat-header-cell *matHeaderCellDef>Collected Date</th>
              <td mat-cell *matCellDef="let r">{{ r.collectedDate ? (r.collectedDate | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Result Status</th>
              <td mat-cell *matCellDef="let r">
                <span class="chip" [class]="'chip--' + tone(r.resultStatus)">{{ r.resultStatus }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="doctor">
              <th mat-header-cell *matHeaderCellDef>Doctor</th>
              <td mat-cell *matCellDef="let r">{{ r.doctorName || '—' }}</td>
            </ng-container>

            <!-- Group Header -->
            <ng-container matColumnDef="groupHeader">
              <td mat-cell *matCellDef="let group" colspan="5" style="background-color: var(--ctms-bg-subtle); font-weight: 600; padding: 12px 16px;">
                Trial: {{ group.trialName }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns; when: isNotGroup"></tr>
            <tr mat-row *matRowDef="let row; columns: ['groupHeader']; when: isGroup"></tr>
          </table>
        </div>
        <p class="muted" style="margin-top:12px;font-size:.82rem">
          Results are for your information. Please discuss any flagged values with your study doctor.
        </p>
      }
    </section>
  `,
})
export class PortalResultsComponent {
  private readonly portal = inject(PortalService);

  readonly columns = ['test', 'result', 'collected', 'status', 'doctor'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  
  readonly trials = signal<{id: number, name: string}[]>([]);
  readonly selectedTrialId = signal<number | null>(null);

  dataSource = new MatTableDataSource<(TestResultResponse | Group)>([]);
  private allResults: TestResultResponse[] = [];

  constructor() {
    this.load();
  }

  isGroup(index: number, item: any): boolean {
    return item.isGroup;
  }

  isNotGroup(index: number, item: any): boolean {
    return !item.isGroup;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.myTestResults().subscribe({
      next: (list) => {
        // Filter out ambiguous results without trial reference if any
        this.allResults = list.filter(r => r.trialId != null);
        
        // Sort by Trial Name, then Result Date Descending
        this.allResults.sort((a, b) => {
          const tA = a.trialName || '';
          const tB = b.trialName || '';
          if (tA !== tB) return tA.localeCompare(tB);
          
          const dA = a.collectedDate ? new Date(a.collectedDate).getTime() : 0;
          const dB = b.collectedDate ? new Date(b.collectedDate).getTime() : 0;
          return dB - dA; // Descending
        });

        // Extract unique trials for filter
        const uniqueTrials = new Map<number, string>();
        for (const r of this.allResults) {
          if (r.trialId && r.trialName) {
            uniqueTrials.set(r.trialId, r.trialName);
          }
        }
        this.trials.set(Array.from(uniqueTrials.entries()).map(([id, name]) => ({ id, name })));

        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load your test results. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onTrialChange(trialId: number | null): void {
    this.selectedTrialId.set(trialId);
    this.applyFilter();
  }

  private applyFilter(): void {
    const selected = this.selectedTrialId();
    const filtered = selected 
      ? this.allResults.filter(r => r.trialId === selected)
      : this.allResults;

    const groupedData: (TestResultResponse | Group)[] = [];
    let currentTrial = '';

    for (const r of filtered) {
      if (r.trialName !== currentTrial) {
        currentTrial = r.trialName || 'Unknown Trial';
        groupedData.push({ isGroup: true, trialName: currentTrial });
      }
      groupedData.push(r);
    }

    this.dataSource.data = groupedData;
  }
}
