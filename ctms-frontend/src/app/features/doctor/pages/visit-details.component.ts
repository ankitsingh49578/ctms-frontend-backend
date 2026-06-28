import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { VisitService } from '../../clinical/services/visits.service';
import { PatientService } from '../../clinical/services/patients.service';
import { VisitResponse, PatientResponse, TestResultResponse, AdverseEventResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { UiService } from '../../../core/services/ui.service';
import { switchMap, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'ctms-visit-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <section class="page">
      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading visit details...</p></div>
      } @else if (error()) {
        <div class="state"><mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-button (click)="goBack()">Go Back</button>
        </div>
      } @else {
        @if (visit(); as v) {
          <header class="page__head" style="display:flex; justify-content:space-between; align-items:flex-start">
            <div style="display:flex; align-items:center; gap: 16px;">
              <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
              <div>
                <h1 class="page__title">Visit Details</h1>
                <p class="page__subtitle">{{ v.trialName }} — {{ v.patientName }} ({{ v.visitType }} #{{ v.visitNumber }})</p>
              </div>
            </div>
            <div>
              <span class="chip" [class]="'chip--' + tone(v.visitStatus)" style="font-size: 1rem; padding: 6px 12px;">{{ v.visitStatus }}</span>
            </div>
          </header>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Left Column: Main Information -->
          <div style="display:flex; flex-direction:column; gap: 24px;">
            
            <!-- Participant Information -->
            @if (patient(); as p) {
              <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="margin-top:0; color:#0f172a; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
                  <mat-icon color="primary">person</mat-icon> Participant Information
                </h2>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                  <div>
                    <div style="font-size:0.85rem; color:#64748b;">Full Name</div>
                    <div style="font-weight:500; font-size:1.05rem;">{{ p.firstName }} {{ p.lastName }}</div>
                  </div>
                  <div>
                    <div style="font-size:0.85rem; color:#64748b;">Participant ID</div>
                    <div>{{ p.patientId }}</div>
                  </div>
                  <div>
                    <div style="font-size:0.85rem; color:#64748b;">Gender</div>
                    <div>{{ p.gender }}</div>
                  </div>
                  <div>
                    <div style="font-size:0.85rem; color:#64748b;">Blood Group</div>
                    <div>{{ p.bloodGroup || 'Not provided' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1">
                    <div style="font-size:0.85rem; color:#64748b;">Contact</div>
                    <div>{{ p.email || 'No email' }} | {{ p.phone || 'No phone' }}</div>
                  </div>
                </div>
              </div>
            }

            <!-- Visit Information -->
            <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="margin-top:0; color:#0f172a; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
                <mat-icon color="primary">event</mat-icon> Visit Information
              </h2>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                <div>
                  <div style="font-size:0.85rem; color:#64748b;">Visit Type</div>
                  <div style="font-weight:500;">{{ v.visitType }}</div>
                </div>
                <div>
                  <div style="font-size:0.85rem; color:#64748b;">Visit Number</div>
                  <div>#{{ v.visitNumber }}</div>
                </div>
                <div>
                  <div style="font-size:0.85rem; color:#64748b;">Scheduled Date</div>
                  <div style="font-weight:500;">{{ v.scheduledDate ? (v.scheduledDate | date:'mediumDate') : '—' }}</div>
                </div>
                <div>
                  <div style="font-size:0.85rem; color:#64748b;">Actual Date</div>
                  <div>{{ v.actualDate ? (v.actualDate | date:'mediumDate') : '—' }}</div>
                </div>
                @if (v.notes) {
                  <div style="grid-column: 1 / -1">
                    <div style="font-size:0.85rem; color:#64748b;">Notes</div>
                    <div style="background:#f8fafc; padding:12px; border-radius:4px; margin-top:4px;">{{ v.notes }}</div>
                  </div>
                }
              </div>
            </div>

            <!-- Test Results for this Visit -->
            <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="margin-top:0; color:#0f172a; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
                <mat-icon color="primary">biotech</mat-icon> Tests Recorded During Visit
              </h2>
              @if (testResults().length) {
                <div style="margin-top: 16px; display:flex; flex-direction:column; gap:8px;">
                  @for (t of testResults(); track t.resultId) {
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #e2e8f0; border-radius:6px;">
                      <div>
                        <div style="font-weight:500;">{{ t.testName }}</div>
                        <div style="font-size:0.85rem; color:#64748b;">{{ t.resultValue }} {{ t.unit }}</div>
                      </div>
                      <span class="chip" [class]="'chip--' + tone(t.resultStatus)">{{ t.resultStatus }}</span>
                    </div>
                  }
                </div>
              } @else {
                <p style="color:#64748b; margin-top:16px;">No test results recorded for this visit yet.</p>
              }
            </div>

          </div>

          <!-- Right Column: Timeline -->
          <div style="display:flex; flex-direction:column; gap: 24px;">
            <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background:#f8fafc;">
              <h2 style="margin-top:0; color:#0f172a; font-size:1.2rem; display:flex; align-items:center; gap:8px;">
                <mat-icon color="primary">timeline</mat-icon> Patient Timeline
              </h2>
              
              <div style="margin-top: 24px; position:relative; padding-left: 20px; border-left: 2px solid #cbd5e1;">
                @for (tv of timelineVisits(); track tv.visitId) {
                  <div style="position:relative; margin-bottom: 24px; cursor:pointer;" (click)="viewVisit(tv.visitId)">
                    <!-- Timeline dot -->
                    <div style="position:absolute; left:-27px; top:4px; width:12px; height:12px; border-radius:50%; border:2px solid #fff;"
                         [style.background-color]="tv.visitId === v.visitId ? '#0ea5e9' : (tv.visitStatus === 'Completed' ? '#22c55e' : (tv.visitStatus === 'Missed' || tv.visitStatus === 'Cancelled' ? '#ef4444' : '#cbd5e1'))">
                    </div>
                    
                    <div [style.opacity]="tv.visitId === v.visitId ? '1' : '0.6'">
                      <div style="font-weight:600; color:#0f172a; display:flex; justify-content:space-between;">
                        <span>{{ tv.visitType }} #{{ tv.visitNumber }}</span>
                        <span style="font-size:0.75rem; font-weight:normal;" [style.color]="tv.visitId === v.visitId ? '#0ea5e9' : '#64748b'">{{ tv.visitStatus }}</span>
                      </div>
                      <div style="font-size:0.85rem; color:#64748b;">
                        {{ tv.scheduledDate ? (tv.scheduledDate | date:'mediumDate') : '—' }}
                      </div>
                    </div>
                  </div>
                }
                @if (!timelineVisits().length) {
                  <p style="color:#64748b;">No visits in timeline.</p>
                }
              </div>
            </div>
          </div>
        </div>
        }
      }
    </section>
  `
})
export class VisitDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly visitsSvc = inject(VisitService);
  private readonly patientsSvc = inject(PatientService);
  private readonly ui = inject(UiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  
  readonly visit = signal<VisitResponse | null>(null);
  readonly patient = signal<PatientResponse | null>(null);
  readonly testResults = signal<TestResultResponse[]>([]);
  readonly timelineVisits = signal<VisitResponse[]>([]);

  readonly tone = statusTone;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (!idStr) {
        this.error.set('Visit ID is missing.');
        this.loading.set(false);
        return;
      }
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        this.error.set('Invalid Visit ID.');
        this.loading.set(false);
        return;
      }
      this.loadData(id);
    });
  }

  loadData(visitId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.visitsSvc.get(visitId).pipe(
      switchMap(v => {
        this.visit.set(v);
        return forkJoin({
          patient: this.patientsSvc.get(v.patientId).pipe(catchError(() => of(null))),
          visits: this.patientsSvc.visits(v.patientId).pipe(catchError(() => of({ content: [] }))),
          // Test results for this specific visit
          tests: this.patientsSvc.testResults(v.patientId).pipe(catchError(() => of([])))
        });
      }),
      catchError(err => {
        this.error.set('Could not load visit details. ' + (err.error?.message || ''));
        this.loading.set(false);
        return of(null);
      })
    ).subscribe(res => {
      if (!res) return;
      this.patient.set(res.patient);
      
      // Filter test results to only show those for THIS visit
      const currentVisitId = this.visit()?.visitId;
      if (currentVisitId && Array.isArray(res.tests)) {
        this.testResults.set(res.tests.filter(t => t.visitId === currentVisitId));
      }

      if (res.visits && Array.isArray(res.visits.content)) {
        // Sort visits chronologically
        const sorted = res.visits.content.sort((a, b) => {
          if (!a.scheduledDate) return 1;
          if (!b.scheduledDate) return -1;
          return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        });
        this.timelineVisits.set(sorted);
      }
      this.loading.set(false);
    });
  }

  goBack(): void {
    this.router.navigate(['/doctor/visits']);
  }

  viewVisit(id: number): void {
    if (id !== this.visit()?.visitId) {
      this.router.navigate(['/doctor/visits', id]);
    }
  }
}
