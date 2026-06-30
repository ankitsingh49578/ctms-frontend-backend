import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { PatientService } from '../services/patients.service';
import { UiService } from '../../../core/services/ui.service';
import { ApiService } from '../../../core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { DocumentViewerDialogComponent } from '../../../shared/document-viewer.dialog';
import { ENDPOINTS } from '../../../core/constants/api-endpoints';
import { AuthService } from '../../../core/services/auth.service';
import {
  ConsentResponse,

  EnrollmentResponse,
  PatientResponse,
  TestResultResponse,
  VisitResponse
} from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-patient-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterLink, MatTabsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatProgressSpinnerModule,
  ],
  template: `
    <section class="page">
      <header class="page__head" style="display: flex; gap: 1rem; align-items: center;">
        <a mat-icon-button routerLink="/clinical/patients"><mat-icon>arrow_back</mat-icon></a>
        <div>
          <h1 class="page__title">{{ patient()?.fullName || 'Patient Details' }}</h1>
          <p class="page__subtitle">Comprehensive profile and trial history.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading patient details?</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (patient()) {
        <div class="kpi-row" style="margin-bottom: 2rem;">
          <div class="kpi-card">
            <mat-icon>science</mat-icon>
            <div class="kpi-card__val">{{ enrollments().length }}</div>
            <div class="kpi-card__lbl">Active Trials</div>
          </div>
          <div class="kpi-card">
            <mat-icon>event</mat-icon>
            <div class="kpi-card__val">{{ visits().length }}</div>
            <div class="kpi-card__lbl">Total Visits</div>
          </div>
          <div class="kpi-card">
            <mat-icon>fact_check</mat-icon>
            <div class="kpi-card__val">{{ consents().length }}</div>
            <div class="kpi-card__lbl">Consents</div>
          </div>
          <div class="kpi-card">
            <mat-icon>biotech</mat-icon>
            <div class="kpi-card__val">{{ results().length }}</div>
            <div class="kpi-card__lbl">Test Results</div>
          </div>
        </div>

        <mat-tab-group animationDuration="0ms" class="ctms-tabs">
          <mat-tab label="Overview">
            <div class="cards-grid" style="padding-top: 1.5rem; display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
              <mat-card class="ctms-card">
                <mat-card-header>
                  <mat-card-title>Personal Information</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="kv-list">
                    <div class="kv"><label>Code</label><span>{{ patient()!.patientCode }}</span></div>
                    <div class="kv"><label>Name</label><span>{{ patient()!.fullName }}</span></div>
                    <div class="kv"><label>Gender</label><span>{{ patient()!.gender || '?' }}</span></div>
                    <div class="kv"><label>Date of Birth</label><span>{{ patient()!.dob ? (patient()!.dob | date:'mediumDate') : '?' }}</span></div>
                    <div class="kv"><label>Phone</label><span>{{ patient()!.phone || '?' }}</span></div>
                    <div class="kv"><label>Email</label><span>{{ patient()!.email || '?' }}</span></div>
                    <div class="kv"><label>Address</label><span>{{ patient()!.address || '?' }}</span></div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <mat-card class="ctms-card">
                <mat-card-header>
                  <mat-card-title>Medical Information</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="kv-list">
                    <div class="kv"><label>Blood Group</label><span>{{ patient()!.bloodGroup || '?' }}</span></div>
                    <div class="kv"><label>Status</label><span class="chip" [class]="'chip--' + tone(patient()!.status)">{{ patient()!.status }}</span></div>
                    <div class="kv"><label>Registered</label><span>{{ patient()!.createdAt | date:'mediumDate' }}</span></div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="ctms-card">
                <mat-card-header>
                  <mat-card-title>Medical Document</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (patient()!.medicalDocumentName) {
                    <div class="document-card" style="display:flex; align-items:center; justify-content:space-between; padding:1rem; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc;">
                      <div style="display:flex; align-items:center; gap:1rem;">
                        <mat-icon style="color:#ff6b6b; font-size:2rem; width:2rem; height:2rem;">insert_drive_file</mat-icon>
                        <div>
                          <div style="font-weight:600; color:#1e293b; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ patient()!.medicalDocumentName }}</div>
                          <div style="font-size:0.85rem; color:#64748b;">{{ patient()!.uploadedDate | date:'mediumDate' }} ? {{ (patient()!.medicalDocumentSize! / 1024 / 1024).toFixed(2) }} MB</div>
                        </div>
                      </div>
                      <div style="display:flex; gap:0.5rem;">
                        <button mat-icon-button color="primary" (click)="viewMedicalDocument()" matTooltip="View Document">
                          <mat-icon>visibility</mat-icon>
                        </button>
                        <button mat-icon-button color="primary" (click)="downloadMedicalDocument()" matTooltip="Download Document">
                          <mat-icon>download</mat-icon>
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="empty-state" style="padding: 1.5rem;">No medical document uploaded.</div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
            
            @if (patient()!.status === 'Pending') {
              <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);">
                <button mat-stroked-button color="warn" (click)="rejectParticipant()">Reject</button>
                <button mat-flat-button color="primary" [disabled]="!documentViewed()" (click)="verifyParticipant()">
                  {{ documentViewed() ? 'Verify Participant' : 'Review Document First' }}
                </button>
              </div>
            }
          </mat-tab>

          <mat-tab label="Trials">
            <div class="table-wrap" style="margin-top: 1.5rem;">
              <table mat-table [dataSource]="enrollments()">
                <ng-container matColumnDef="trial">
                  <th mat-header-cell *matHeaderCellDef>Trial Name</th>
                  <td mat-cell *matCellDef="let e">{{ e.trialName || 'Trial #' + e.trialId }}</td>
                </ng-container>
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Enrollment Date</th>
                  <td mat-cell *matCellDef="let e">{{ e.enrollmentDate | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let e"><span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['trial', 'date', 'status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['trial', 'date', 'status']"></tr>
              </table>
              @if (!enrollments().length) { <div class="empty-state">No enrollments found.</div> }
            </div>
          </mat-tab>

          <mat-tab label="Consents">
            <div class="table-wrap" style="margin-top: 1.5rem;">
              <table mat-table [dataSource]="consents()">
                <ng-container matColumnDef="trial">
                  <th mat-header-cell *matHeaderCellDef>Trial Name</th>
                  <td mat-cell *matCellDef="let c">{{ c.trialName || 'Trial #' + c.trialId }}</td>
                </ng-container>
                <ng-container matColumnDef="version">
                  <th mat-header-cell *matHeaderCellDef>Version</th>
                  <td mat-cell *matCellDef="let c">{{ c.consentVersion }}</td>
                </ng-container>
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Signed Date</th>
                  <td mat-cell *matCellDef="let c">{{ c.consentDate | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let c"><span class="chip" [class]="'chip--' + tone(c.consentStatus)">{{ c.consentStatus }}</span></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['trial', 'version', 'date', 'status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['trial', 'version', 'date', 'status']"></tr>
              </table>
              @if (!consents().length) { <div class="empty-state">No consents found.</div> }
            </div>
          </mat-tab>

          <mat-tab label="Visits">
            <div class="table-wrap" style="margin-top: 1.5rem;">
              <table mat-table [dataSource]="visits()">
                <ng-container matColumnDef="trial">
                  <th mat-header-cell *matHeaderCellDef>Trial Name</th>
                  <td mat-cell *matCellDef="let v">{{ v.trialName || 'Unknown' }}</td>
                </ng-container>
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Visit Type</th>
                  <td mat-cell *matCellDef="let v">{{ v.visitType }}</td>
                </ng-container>
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Visit Date</th>
                  <td mat-cell *matCellDef="let v">{{ v.scheduledDate | date:'dd MMM yyyy hh:mm a' }}</td>
                </ng-container>
                <ng-container matColumnDef="doctor">
                  <th mat-header-cell *matHeaderCellDef>Assigned Doctor</th>
                  <td mat-cell *matCellDef="let v">{{ v.doctorName || '?' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let v"><span class="chip" [class]="'chip--' + tone(v.visitStatus)">{{ v.visitStatus }}</span></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['trial', 'type', 'date', 'doctor', 'status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['trial', 'type', 'date', 'doctor', 'status']"></tr>
              </table>
              @if (!visits().length) { <div class="empty-state">No visits found.</div> }
            </div>
          </mat-tab>

          <mat-tab label="Results">
            <div class="table-wrap" style="margin-top: 1.5rem;">
              <table mat-table [dataSource]="results()">
                <ng-container matColumnDef="test">
                  <th mat-header-cell *matHeaderCellDef>Test Name</th>
                  <td mat-cell *matCellDef="let r">{{ r.testName }}</td>
                </ng-container>
                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Result Value</th>
                  <td mat-cell *matCellDef="let r">{{ r.resultValue || '?' }} {{ r.unit || '' }}</td>
                </ng-container>
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Result Date</th>
                  <td mat-cell *matCellDef="let r">{{ r.collectedDate | date:'mediumDate' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let r"><span class="chip" [class]="'chip--' + tone(r.resultStatus)">{{ r.resultStatus }}</span></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="['test', 'value', 'date', 'status']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['test', 'value', 'date', 'status']"></tr>
              </table>
              @if (!results().length) { <div class="empty-state">No test results found.</div> }
            </div>
          </mat-tab>



        </mat-tab-group>
      }
    </section>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page__head { margin-bottom: 2rem; }
    .page__title { margin: 0; font-size: 2rem; font-weight: 600; color: var(--primary-color); }
    .page__subtitle { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; }
    
    .kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .kpi-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-left: 4px solid var(--primary-color); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-3px); }
    .kpi-card mat-icon { font-size: 2.5rem; height: 2.5rem; width: 2.5rem; color: var(--primary-color); margin-bottom: 0.5rem; }
    .kpi-card__val { font-size: 2rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .kpi-card__lbl { color: #64748b; font-size: 0.95rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0.25rem; }
    
    .ctms-tabs { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .cards-grid { padding-top: 1.5rem; display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); }
    .ctms-card { border-radius: 10px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
    .ctms-card mat-card-header { padding: 1.5rem 1.5rem 0; }
    .ctms-card mat-card-title { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
    .ctms-card mat-card-content { padding: 1.5rem; }
    
    .kv-list { display: flex; flex-direction: column; gap: 1rem; }
    .kv { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px dashed #e2e8f0; }
    .kv:last-child { border-bottom: none; padding-bottom: 0; }
    .kv label { color: #64748b; font-weight: 500; }
    .kv span { color: #0f172a; font-weight: 600; text-align: right; }
    
    .table-wrap { margin-top: 1.5rem; overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; }
    table { width: 100%; background: white; border-collapse: collapse; }
    th.mat-header-cell { background-color: #f8fafc; color: #475569; font-weight: 600; padding: 1rem; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
    td.mat-cell { padding: 1rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
    tr.mat-row:hover { background-color: #f8fafc; }
    
    .chip { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .chip--good { background: #dcfce7; color: #166534; }
    .chip--warn { background: #fef9c3; color: #854d0e; }
    .chip--bad { background: #fee2e2; color: #991b1b; }
    .chip--neutral { background: #f1f5f9; color: #475569; }
    
    .empty-state { padding: 3rem; text-align: center; color: #94a3b8; font-size: 1.1rem; background: #f8fafc; border-radius: 8px; margin: 1rem; }
    .state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; color: #64748b; gap: 1rem; }
    .state mat-icon { font-size: 3rem; height: 3rem; width: 3rem; color: #94a3b8; }
  `]
})
export class PatientDetailsComponent implements OnInit {
  private readonly patients = inject(PatientService);
  private readonly ui = inject(UiService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);

  readonly tone = statusTone;
  
  readonly patientId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly documentViewed = signal(false);

  readonly patient = signal<PatientResponse | null>(null);
  readonly enrollments = signal<EnrollmentResponse[]>([]);
  readonly consents = signal<ConsentResponse[]>([]);
  readonly visits = signal<VisitResponse[]>([]);
  readonly results = signal<TestResultResponse[]>([]);


  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('patientId');
    if (idParam) {
      this.patientId.set(Number(idParam));
      this.load();
    } else {
      this.error.set('No patient ID provided.');
      this.loading.set(false);
    }
  }

  load(): void {
    const id = this.patientId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      p: this.patients.get(id),
      e: this.patients.enrollments(id),
      c: this.patients.consents(id),
      v: this.patients.visits(id),
      r: this.patients.testResults(id)
    }).subscribe({
      next: (res) => {
        this.patient.set(res.p);
        this.enrollments.set(res.e);
        this.consents.set(res.c);
        this.visits.set(res.v.content);
        this.results.set(res.r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load patient history.');
        this.loading.set(false);
      }
    });
  }

  viewMedicalDocument(): void {
    const p = this.patient();
    if (!p) return;
    const url = `${this.api.getBaseUrl()}/api/patients/${p.patientId}/medical-document`;
    const token = this.auth.token();
    if (!token) return;

    this.documentViewed.set(true);
    this.dialog.open(DocumentViewerDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      data: {
        title: p.medicalDocumentName || 'Medical Document',
        documentUrl: url,
        token: token
      }
    });
  }

  downloadMedicalDocument(): void {
    const p = this.patient();
    if (!p) return;
    const url = `${this.api.getBaseUrl()}/api/patients/${p.patientId}/medical-document`;
    const token = this.auth.token();
    if (!token) return;

    this.documentViewed.set(true);
    const a = document.createElement('a');
    a.href = `${url}?token=${token}`;
    a.download = p.medicalDocumentName || 'medical-document';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  verifyParticipant(): void {
    const id = this.patientId();
    if (!id) return;
    this.api.post(`/api/patients/${id}/verify`).subscribe({
      next: () => {
        this.ui.success('Participant verified successfully.');
        this.load();
      },
      error: (err) => {
        this.ui.error('Failed to verify participant.');
      }
    });
  }

  rejectParticipant(): void {
    const id = this.patientId();
    if (!id) return;
    this.api.put(`/api/patients/${id}`, { status: 'Rejected' }).subscribe({
      next: () => {
        this.ui.success('Participant rejected.');
        this.load();
      },
      error: (err) => {
        this.ui.error('Failed to reject participant.');
      }
    });
  }
}
