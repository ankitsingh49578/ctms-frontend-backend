import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrialService } from '../services/trials.service';
import { PatientService, EnrollmentService } from '../services/patients.service';
import { VisitService } from '../services/visits.service';
import { ConsentService } from '../services/consents.service';
import { AdverseEventService } from '../services/safety.service';
import { UiService } from '../../../core/services/ui.service';
import {
  TrialDetailsResponse, EnrollmentResponse, VisitResponse, ConsentResponse, AdverseEventResponse
} from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';

@Component({
  selector: 'ctms-trial-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, RouterLink, MatTabsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatProgressSpinnerModule, MatPaginatorModule, MatTooltipModule
  ],
  template: `
    <section class="page">
      <header class="page__head" style="display: flex; gap: 1rem; align-items: center;">
        <a mat-icon-button routerLink="/clinical/trials"><mat-icon>arrow_back</mat-icon></a>
        <div>
          <h1 class="page__title">{{ trial()?.trialInformation?.trialName || 'Trial Details' }}</h1>
          <p class="page__subtitle">{{ trial()?.trialInformation?.trialCode }} · {{ trial()?.trialInformation?.phase }}</p>
        </div>
        <div style="flex: 1"></div>
        @if (trial()) {
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="chip" [class]="'chip--' + tone(trial()!.trialInformation.status)">{{ trial()!.trialInformation.status }}</span>
            <button mat-icon-button (click)="load()" matTooltip="Refresh Statistics" style="color: var(--ctms-ink-soft);">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        }
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading trial details…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (trial()) {
        <div class="kpi-row" style="margin-bottom: 2rem;">
          <div class="kpi-card">
            <mat-icon>group</mat-icon>
            <div class="kpi-card__val">{{ trial()!.enrollmentSummary.currentEnrollment }} / {{ trial()!.enrollmentSummary.totalTarget }}</div>
            <div class="kpi-card__lbl">Enrolled ({{ trial()!.enrollmentSummary.enrollmentPercentage | number:'1.0-0' }}%)</div>
          </div>
          <div class="kpi-card">
            <mat-icon>warning</mat-icon>
            <div class="kpi-card__val">{{ trial()!.adverseEventSummary.eventCount }}</div>
            <div class="kpi-card__lbl">Total Adverse Events</div>
          </div>
          <div class="kpi-card success-rate-card"
               [class]="getSuccessRateClass(trial()!.successRate)"
               matTooltip="Success Rate is calculated based on enrolled participants and the number of reported adverse events.">
            <div class="kpi-card__header">
              <mat-icon>trending_up</mat-icon>
            </div>
            <div class="kpi-card__val">{{ trial()!.successRate | number:'1.0-2' }}%</div>
            <div class="kpi-card__lbl">Success Rate</div>
            <div class="kpi-card__subtitle">Trial Performance</div>
            <div class="kpi-card__progress">
              <div class="kpi-card__progress-bar">
                <div class="kpi-card__progress-fill" [style.width.%]="trial()!.successRate"></div>
              </div>
            </div>
          </div>
        </div>

        <mat-tab-group animationDuration="0ms" class="ctms-tabs" (selectedTabChange)="onTabChange($event)">
          
          <!-- Overview Tab -->
          <mat-tab label="Overview">
            <div class="cards-grid" style="padding-top: 1.5rem; display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));">
              
              <!-- Information Card -->
              <mat-card class="ctms-card">
                <mat-card-header>
                  <mat-card-title>Trial Information</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="kv-list">
                    <div class="kv"><label>Code</label><span>{{ trial()!.trialInformation.trialCode }}</span></div>
                    <div class="kv"><label>Name</label><span>{{ trial()!.trialInformation.trialName }}</span></div>
                    <div class="kv"><label>Phase</label><span>{{ trial()!.trialInformation.phase }}</span></div>
                    <div class="kv"><label>Start Date</label><span>{{ trial()!.trialInformation.startDate | date:'mediumDate' }}</span></div>
                    <div class="kv"><label>End Date</label><span>{{ trial()!.trialInformation.endDate ? (trial()!.trialInformation.endDate | date:'mediumDate') : '—' }}</span></div>
                  </div>
                  <div style="margin-top: 1.5rem; color: #475569; line-height: 1.6;">
                    <strong>Description:</strong><br>
                    {{ trial()!.trialInformation.description || 'No description provided.' }}
                  </div>
                </mat-card-content>
              </mat-card>
              
              <!-- Progress Breakdown Card -->
              <mat-card class="ctms-card">
                <mat-card-header>
                  <mat-card-title>Enrollment Breakdown</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="kv-list">
                    <div class="kv"><label>Screening</label><span>{{ trial()!.enrollmentSummary.screeningParticipants }}</span></div>
                    <div class="kv"><label>Active</label><span>{{ trial()!.enrollmentSummary.activeParticipants }}</span></div>
                    <div class="kv"><label>Completed</label><span>{{ trial()!.enrollmentSummary.completedParticipants }}</span></div>
                    <div class="kv"><label>Withdrawn</label><span>{{ trial()!.enrollmentSummary.withdrawnParticipants }}</span></div>
                  </div>
                </mat-card-content>
              </mat-card>

            </div>
          </mat-tab>

          <!-- Participants Tab -->
          <mat-tab label="Participants">
            <ng-template matTabContent>
              <div class="table-wrap" style="margin-top: 1.5rem;">
                @if (tabLoading()) {
                  <mat-spinner diameter="30" style="margin: 2rem auto;"></mat-spinner>
                } @else {
                  <table mat-table [dataSource]="enrollments()">
                    <ng-container matColumnDef="patientId">
                      <th mat-header-cell *matHeaderCellDef>Patient ID</th>
                      <td mat-cell *matCellDef="let e">
                        <a [routerLink]="['/clinical/patients', e.patientId]" style="color: var(--primary-color); font-weight: 500;">
                          #{{ e.patientId }}
                        </a>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Enrollment Date</th>
                      <td mat-cell *matCellDef="let e">{{ e.enrollmentDate | date:'mediumDate' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let e"><span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span></td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['patientId', 'date', 'status']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['patientId', 'date', 'status']"></tr>
                  </table>
                  @if (!enrollments().length) { <div class="empty-state">No participants enrolled.</div> }
                  <mat-paginator [length]="totalEnrollments()" [pageSize]="10" (page)="onPageEnrollments($event)"></mat-paginator>
                }
              </div>
            </ng-template>
          </mat-tab>

          <!-- Visits Tab -->
          <mat-tab label="Visits">
            <ng-template matTabContent>
              <div class="table-wrap" style="margin-top: 1.5rem;">
                @if (tabLoading()) {
                  <mat-spinner diameter="30" style="margin: 2rem auto;"></mat-spinner>
                } @else {
                  <table mat-table [dataSource]="visits()">
                    <ng-container matColumnDef="patient">
                      <th mat-header-cell *matHeaderCellDef>Patient Name</th>
                      <td mat-cell *matCellDef="let v">{{ v.patientName || 'Patient #' + v.patientId }}</td>
                    </ng-container>
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let v">{{ v.visitType }}</td>
                    </ng-container>
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Scheduled Date</th>
                      <td mat-cell *matCellDef="let v">{{ v.scheduledDate | date:'mediumDate' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let v"><span class="chip" [class]="'chip--' + tone(v.visitStatus)">{{ v.visitStatus }}</span></td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['patient', 'type', 'date', 'status']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['patient', 'type', 'date', 'status']"></tr>
                  </table>
                  @if (!visits().length) { <div class="empty-state">No visits found.</div> }
                  <mat-paginator [length]="totalVisits()" [pageSize]="10" (page)="onPageVisits($event)"></mat-paginator>
                }
              </div>
            </ng-template>
          </mat-tab>

          <!-- Consents Tab -->
          <mat-tab label="Consents">
            <ng-template matTabContent>
              <div class="table-wrap" style="margin-top: 1.5rem;">
                @if (tabLoading()) {
                  <mat-spinner diameter="30" style="margin: 2rem auto;"></mat-spinner>
                } @else {
                  <table mat-table [dataSource]="consents()">
                    <ng-container matColumnDef="patient">
                      <th mat-header-cell *matHeaderCellDef>Patient Name</th>
                      <td mat-cell *matCellDef="let c">{{ c.patientName || 'Patient #' + c.patientId }}</td>
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
                    <tr mat-header-row *matHeaderRowDef="['patient', 'version', 'date', 'status']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['patient', 'version', 'date', 'status']"></tr>
                  </table>
                  @if (!consents().length) { <div class="empty-state">No consents found.</div> }
                }
              </div>
            </ng-template>
          </mat-tab>
          
          <!-- Adverse Events Tab -->
          <mat-tab label="Adverse Events">
            <ng-template matTabContent>
              <div class="table-wrap" style="margin-top: 1.5rem;">
                @if (tabLoading()) {
                  <mat-spinner diameter="30" style="margin: 2rem auto;"></mat-spinner>
                } @else {
                  <table mat-table [dataSource]="adverseEvents()">
                    <ng-container matColumnDef="patient">
                      <th mat-header-cell *matHeaderCellDef>Patient ID</th>
                      <td mat-cell *matCellDef="let a">#{{ a.patientId }}</td>
                    </ng-container>
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date Reported</th>
                      <td mat-cell *matCellDef="let a">{{ a.eventDate | date:'mediumDate' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="severity">
                      <th mat-header-cell *matHeaderCellDef>Severity</th>
                      <td mat-cell *matCellDef="let a"><span class="chip" [class]="'chip--' + tone(a.severity)">{{ a.severity }}</span></td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let a"><span class="chip" [class]="'chip--' + tone(a.status)">{{ a.status }}</span></td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['patient', 'date', 'severity', 'status']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['patient', 'date', 'severity', 'status']"></tr>
                  </table>
                  @if (!adverseEvents().length) { <div class="empty-state">No adverse events reported.</div> }
                }
              </div>
            </ng-template>
          </mat-tab>

        </mat-tab-group>
      }
    </section>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page__head { margin-bottom: 2rem; }
    .page__title { margin: 0; font-size: 2rem; font-weight: 600; color: var(--primary-color); }
    .page__subtitle { margin: 0.5rem 0 0; color: #64748b; font-size: 1.1rem; font-weight: 500; }
    
    .kpi-row {
      display: grid;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
      grid-template-columns: 1fr;
    }
    @media (min-width: 600px) {
      .kpi-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 960px) {
      .kpi-row {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .kpi-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-left: 4px solid var(--primary-color); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-3px); }
    .kpi-card--warn { border-left-color: #ef4444; background-color: #fef2f2; }
    .kpi-card mat-icon { font-size: 2.5rem; height: 2.5rem; width: 2.5rem; color: var(--primary-color); margin-bottom: 0.5rem; }
    .kpi-card__val { font-size: 2rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .kpi-card__lbl { color: #64748b; font-size: 0.95rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0.25rem; }
    
    .kpi-card--success-green { border-left-color: var(--ctms-success) !important; background-color: var(--ctms-success-bg) !important; }
    .kpi-card--success-green mat-icon { color: var(--ctms-success) !important; }
    .kpi-card--success-green .kpi-card__progress-fill { background-color: var(--ctms-success) !important; }

    .kpi-card--success-blue { border-left-color: #0284c7 !important; background-color: #f0f9ff !important; }
    .kpi-card--success-blue mat-icon { color: #0284c7 !important; }
    .kpi-card--success-blue .kpi-card__progress-fill { background-color: #0284c7 !important; }

    .kpi-card--success-orange { border-left-color: #ea580c !important; background-color: #fff7ed !important; }
    .kpi-card--success-orange mat-icon { color: #ea580c !important; }
    .kpi-card--success-orange .kpi-card__progress-fill { background-color: #ea580c !important; }

    .kpi-card--success-red { border-left-color: var(--ctms-danger) !important; background-color: var(--ctms-danger-bg) !important; }
    .kpi-card--success-red mat-icon { color: var(--ctms-danger) !important; }
    .kpi-card--success-red .kpi-card__progress-fill { background-color: var(--ctms-danger) !important; }

    .success-rate-card { cursor: help; }
    .kpi-card__header { display: flex; align-items: center; justify-content: center; gap: 0.25rem; }
    .kpi-card__subtitle { font-size: 0.8rem; color: #64748b; margin-top: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .kpi-card__progress { width: 100%; margin-top: 0.75rem; }
    .kpi-card__progress-bar { height: 6px; border-radius: 99px; background: rgba(0, 0, 0, 0.08); overflow: hidden; width: 100%; }
    .kpi-card__progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
    
    .ctms-tabs { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .ctms-card { border-radius: 10px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; height: 100%; }
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
export class TrialDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly trialService = inject(TrialService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly visitService = inject(VisitService);
  private readonly consentService = inject(ConsentService);
  private readonly aeService = inject(AdverseEventService);
  private readonly ui = inject(UiService);

  readonly tone = statusTone;
  
  readonly trialId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly tabLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly trial = signal<TrialDetailsResponse | null>(null);
  
  // Tab data
  readonly enrollments = signal<EnrollmentResponse[]>([]);
  readonly totalEnrollments = signal(0);
  readonly visits = signal<VisitResponse[]>([]);
  readonly totalVisits = signal(0);
  readonly consents = signal<ConsentResponse[]>([]);
  readonly adverseEvents = signal<AdverseEventResponse[]>([]);

  // State to avoid refetching static tabs (Consents, AE)
  private loadedTabs = new Set<string>();

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.trialId.set(Number(idParam));
      this.load();
    } else {
      this.error.set('No trial ID provided.');
      this.loading.set(false);
    }
  }

  load(): void {
    const id = this.trialId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);

    this.trialService.getDetails(id).subscribe({
      next: (res) => {
        this.trial.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load trial details.');
        this.loading.set(false);
      }
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    const tabName = event.tab.textLabel;
    const id = this.trialId();
    if (!id) return;

    if (tabName === 'Participants' && !this.loadedTabs.has(tabName)) {
      this.loadEnrollments(id, 0, 10);
      this.loadedTabs.add(tabName);
    } else if (tabName === 'Visits' && !this.loadedTabs.has(tabName)) {
      this.loadVisits(id, 0, 10);
      this.loadedTabs.add(tabName);
    } else if (tabName === 'Consents' && !this.loadedTabs.has(tabName)) {
      this.loadConsents(id);
      this.loadedTabs.add(tabName);
    } else if (tabName === 'Adverse Events' && !this.loadedTabs.has(tabName)) {
      this.loadAdverseEvents(id);
      this.loadedTabs.add(tabName);
    }
  }

  loadEnrollments(trialId: number, pageIndex: number, pageSize: number): void {
    this.tabLoading.set(true);
    this.enrollmentService.getByTrial(trialId, { page: pageIndex, size: pageSize }).subscribe({
      next: (page) => {
        this.enrollments.set(page.content);
        this.totalEnrollments.set(page.totalElements);
        this.tabLoading.set(false);
      },
      error: () => {
        this.ui.error('Failed to load participants');
        this.tabLoading.set(false);
      }
    });
  }

  onPageEnrollments(event: any): void {
    const id = this.trialId();
    if (id) this.loadEnrollments(id, event.pageIndex, event.pageSize);
  }

  loadVisits(trialId: number, pageIndex: number, pageSize: number): void {
    this.tabLoading.set(true);
    this.visitService.forTrial(trialId, { page: pageIndex, size: pageSize }).subscribe({
      next: (page) => {
        this.visits.set(page.content);
        this.totalVisits.set(page.totalElements);
        this.tabLoading.set(false);
      },
      error: () => {
        this.ui.error('Failed to load visits');
        this.tabLoading.set(false);
      }
    });
  }

  onPageVisits(event: any): void {
    const id = this.trialId();
    if (id) this.loadVisits(id, event.pageIndex, event.pageSize);
  }

  loadConsents(trialId: number): void {
    this.tabLoading.set(true);
    this.consentService.forTrial(trialId).subscribe({
      next: (list) => {
        this.consents.set(list);
        this.tabLoading.set(false);
      },
      error: () => {
        this.ui.error('Failed to load consents');
        this.tabLoading.set(false);
      }
    });
  }

  loadAdverseEvents(trialId: number): void {
    this.tabLoading.set(true);
    this.aeService.forTrial(trialId).subscribe({
      next: (list) => {
        this.adverseEvents.set(list);
        this.tabLoading.set(false);
      },
      error: () => {
        this.ui.error('Failed to load adverse events');
        this.tabLoading.set(false);
      }
    });
  }

  getSuccessRateClass(rate: number | null | undefined): string {
    if (rate == null) return 'kpi-card--success-red';
    if (rate >= 90) return 'kpi-card--success-green';
    if (rate >= 75) return 'kpi-card--success-blue';
    if (rate >= 50) return 'kpi-card--success-orange';
    return 'kpi-card--success-red';
  }
}
