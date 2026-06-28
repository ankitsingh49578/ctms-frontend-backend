import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PatientService } from '../../clinical/services/patients.service';
import { VisitService } from '../../clinical/services/visits.service';
import { TestResultService, AdverseEventService } from '../../clinical/services/safety.service';
import { statusTone } from '../../../core/models/enums';

export interface PatientHistoryData {
  patientId: number;
  patientName: string;
  trialName: string;
}

@Component({
  selector: 'ctms-patient-history-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule, MatButtonModule, MatTabsModule, MatProgressSpinnerModule, 
    MatIconModule, MatTableModule, DatePipe
  ],
  template: `
    <div class="history-modal">
      <div class="modal-header">
        <div style="flex: 1;">
          <h2 mat-dialog-title style="margin: 0; padding: 0;">{{ data.patientName }} <span class="muted" style="font-size: 1rem; margin-left: 8px;">#{{ data.patientId }}</span></h2>
          <p class="modal-subtitle">{{ data.trialName || 'Clinical Trial Patient' }}</p>
        </div>
        <button mat-icon-button mat-dialog-close style="color: white;"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content class="modal-content">
        @if (loading()) {
          <div class="state" style="padding: 40px 0;"><mat-spinner diameter="36"></mat-spinner><p>Loading complete patient history...</p></div>
        } @else {
          <mat-tab-group animationDuration="0ms">
            <!-- Details Tab -->
            <mat-tab>
              <ng-template mat-tab-label><mat-icon class="tab-icon">person</mat-icon> Profile</ng-template>
              <div class="tab-body">
                @if (patient(); as p) {
                  <div class="detail-grid">
                    <div class="detail-item"><span>Full Name</span><strong>{{ p.firstName }} {{ p.lastName }}</strong></div>
                    <div class="detail-item"><span>Gender</span><strong>{{ p.gender }}</strong></div>
                    <div class="detail-item"><span>Date of Birth</span><strong>{{ p.dateOfBirth | date:'mediumDate' }}</strong></div>
                    <div class="detail-item"><span>Email</span><strong>{{ p.email || 'N/A' }}</strong></div>
                    <div class="detail-item"><span>Phone</span><strong>{{ p.phoneNumber || 'N/A' }}</strong></div>
                    <div class="detail-item"><span>Status</span><strong><span class="chip" [class]="'chip--'+tone(p.status)">{{ p.status }}</span></strong></div>
                  </div>
                  <div class="medical-history-card">
                    <h4>Medical History</h4>
                    <p>{{ p.medicalHistory || 'No prior medical history recorded.' }}</p>
                  </div>
                } @else {
                  <div class="state"><mat-icon>person_off</mat-icon><p>Patient profile unavailable.</p></div>
                }
              </div>
            </mat-tab>

            <!-- Visits Tab -->
            <mat-tab>
              <ng-template mat-tab-label><mat-icon class="tab-icon">event</mat-icon> Visits ({{ visits().length }})</ng-template>
              <div class="tab-body">
                @if (visits().length) {
                  <table mat-table [dataSource]="visits()" class="history-table">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let v">{{ v.scheduledDate ? (v.scheduledDate | date:'dd MMM yyyy') : '—' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let v">{{ v.visitType }}@if(v.visitNumber){ #{{v.visitNumber}} }</td>
                    </ng-container>
                    <ng-container matColumnDef="doctor">
                      <th mat-header-cell *matHeaderCellDef>Doctor</th>
                      <td mat-cell *matCellDef="let v">{{ v.doctorName || 'Unassigned' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let v"><span class="chip" [class]="'chip--'+tone(v.visitStatus)">{{ v.visitStatus }}</span></td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['date', 'type', 'doctor', 'status']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['date', 'type', 'doctor', 'status']"></tr>
                  </table>
                } @else {
                  <div class="state" style="padding:20px 0;"><mat-icon>event_busy</mat-icon><p>No visits found.</p></div>
                }
              </div>
            </mat-tab>

            <!-- Tests Tab -->
            <mat-tab>
              <ng-template mat-tab-label><mat-icon class="tab-icon">biotech</mat-icon> Tests ({{ tests().length }})</ng-template>
              <div class="tab-body">
                @if (tests().length) {
                  <table mat-table [dataSource]="tests()" class="history-table">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Collected</th>
                      <td mat-cell *matCellDef="let r">{{ r.collectedDate | date:'dd MMM yyyy' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="test">
                      <th mat-header-cell *matHeaderCellDef>Test Name</th>
                      <td mat-cell *matCellDef="let r"><strong>{{ r.testName }}</strong></td>
                    </ng-container>
                    <ng-container matColumnDef="value">
                      <th mat-header-cell *matHeaderCellDef>Result</th>
                      <td mat-cell *matCellDef="let r">{{ r.resultValue || '—' }} <span class="muted">{{ r.unit || '' }}</span></td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let r"><span class="chip" [class]="'chip--'+tone(r.resultStatus)">{{ r.resultStatus }}</span></td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['date', 'test', 'value', 'status']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['date', 'test', 'value', 'status']"></tr>
                  </table>
                } @else {
                  <div class="state" style="padding:20px 0;"><mat-icon>science</mat-icon><p>No test results found.</p></div>
                }
              </div>
            </mat-tab>

            <!-- Adverse Events Tab -->
            <mat-tab>
              <ng-template mat-tab-label><mat-icon class="tab-icon">health_and_safety</mat-icon> Events ({{ events().length }})</ng-template>
              <div class="tab-body">
                @if (events().length) {
                  <div class="event-list">
                    @for (e of events(); track e.eventId) {
                      <div class="event-card" [class.event-card--severe]="e.severity === 'Severe'">
                        <div class="event-head">
                          <span class="event-date">{{ e.eventDate | date:'longDate' }}</span>
                          <span class="chip" [class]="'chip--'+tone(e.status)">{{ e.status }}</span>
                        </div>
                        <div class="event-desc"><strong>{{ e.severity }}</strong> — {{ e.description }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="state" style="padding:20px 0;"><mat-icon>check_circle</mat-icon><p>No adverse events reported.</p></div>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        }
      </mat-dialog-content>
      
      <mat-dialog-actions align="end" style="border-top: 1px solid #e2e8f0; margin: 0; padding: 12px 24px; background: #f8fafc;">
        <button mat-flat-button color="primary" mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .history-modal {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .modal-header {
      padding: 16px 24px;
      background: #1e293b;
      color: white;
      display: flex;
      align-items: center;
    }
    .modal-subtitle {
      margin: 4px 0 0 0;
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .modal-content {
      padding: 0;
      margin: 0;
      overflow-x: hidden;
    }
    .tab-icon {
      margin-right: 8px;
      font-size: 20px;
      height: 20px;
      width: 20px;
    }
    .tab-body {
      padding: 24px;
      min-height: 350px;
      background: #fdfdfd;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      background: white;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .detail-item span {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .detail-item strong {
      font-size: 1.05rem;
      color: #0f172a;
    }
    .medical-history-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
    }
    .medical-history-card h4 {
      margin: 0 0 8px 0;
      color: #334155;
    }
    .medical-history-card p {
      margin: 0;
      color: #475569;
      line-height: 1.5;
    }
    .history-table {
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .event-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .event-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
    }
    .event-card--severe {
      border-left-color: #ef4444;
      background: #fef2f2;
    }
    .event-head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .event-date {
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .event-desc {
      color: #334155;
    }
  `]
})
export class PatientHistoryDialogComponent implements OnInit {
  readonly data = inject<PatientHistoryData>(MAT_DIALOG_DATA);
  private readonly patientSvc = inject(PatientService);
  private readonly visitSvc = inject(VisitService);
  private readonly testSvc = inject(TestResultService);
  private readonly aeSvc = inject(AdverseEventService);

  readonly loading = signal(true);
  readonly tone = statusTone;
  
  readonly patient = signal<any>(null);
  readonly visits = signal<any[]>([]);
  readonly tests = signal<any[]>([]);
  readonly events = signal<any[]>([]);

  ngOnInit() {
    const pid = this.data.patientId;
    forkJoin({
      patient: this.patientSvc.get(pid).pipe(catchError(() => of(null))),
      visits: this.visitSvc.forPatient(pid, { page: 0, size: 100, sort: 'scheduledDate,desc' }).pipe(
        map(p => p.content),
        catchError(() => of([]))
      ),
      tests: this.testSvc.forPatient(pid).pipe(catchError(() => of([]))),
      events: this.aeSvc.forPatient(pid).pipe(catchError(() => of([])))
    }).subscribe((res) => {
      this.patient.set(res.patient);
      this.visits.set(res.visits);
      this.tests.set(res.tests);
      this.events.set(res.events);
      this.loading.set(false);
    });
  }
}
