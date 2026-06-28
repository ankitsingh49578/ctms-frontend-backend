import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TestResultService } from '../../clinical/services/safety.service';
import { TestResultResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-patient-results-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>Test Results: {{ data.patientName }} <span style="color:#64748b;font-size:1.1rem;font-weight:400">#{{ data.patientId }}</span></span>
        <button mat-icon-button [mat-dialog-close]="undefined"><mat-icon>close</mat-icon></button>
      </div>
      <div style="font-size:0.9rem;font-weight:400;color:#64748b;margin-top:4px">Trial: {{ data.trialName || 'N/A' }}</div>
    </h2>
    
    <mat-dialog-content>
      @if (loading()) {
        <div class="empty-state">
          <mat-spinner diameter="32"></mat-spinner>
          <p>Loading patient test history...</p>
        </div>
      } @else if (error()) {
        <div class="empty-state">
          <mat-icon>error_outline</mat-icon>
          <h3>Failed to Load</h3>
          <p>{{ error() }}</p>
        </div>
      } @else if (results().length === 0) {
        <div class="empty-state">
          <mat-icon>science</mat-icon>
          <h3>No Test Results</h3>
          <p>This patient currently has no recorded test results.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="results()">
            <ng-container matColumnDef="collectedDate">
              <th mat-header-cell *matHeaderCellDef>Date Collected</th>
              <td mat-cell *matCellDef="let r">{{ r.collectedDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="testName">
              <th mat-header-cell *matHeaderCellDef>Test Name</th>
              <td mat-cell *matCellDef="let r" style="font-weight:500">{{ r.testName }}</td>
            </ng-container>
            <ng-container matColumnDef="resultValue">
              <th mat-header-cell *matHeaderCellDef>Value</th>
              <td mat-cell *matCellDef="let r">{{ r.resultValue || '—' }} <span class="muted">{{ r.unit || '' }}</span></td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <span class="chip" [class]="'chip--' + tone(r.resultStatus)">{{ r.resultStatus }}</span>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </div>
      }
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .table-wrap { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  `]
})
export class PatientResultsDialogComponent implements OnInit {
  private readonly testSvc = inject(TestResultService);
  readonly data = inject<{ patientId: number, patientName: string, trialName?: string }>(MAT_DIALOG_DATA);
  
  readonly tone = statusTone;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly results = signal<TestResultResponse[]>([]);
  readonly columns = ['collectedDate', 'testName', 'resultValue', 'status'];

  ngOnInit() {
    this.testSvc.forPatient(this.data.patientId).subscribe({
      next: (res) => {
        this.results.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not fetch test results.');
        this.loading.set(false);
      }
    });
  }
}
