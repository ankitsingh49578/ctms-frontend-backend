import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { DoctorContextService } from '../doctor.context';
import { VisitService } from '../../clinical/services/visits.service';
import { UiService } from '../../../core/services/ui.service';
import { VisitResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { DatePromptDialogComponent, DatePromptData } from '../../clinical/dialogs/date-prompt.dialog';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { ScheduleVisitDialogComponent } from '../dialogs/schedule-visit.dialog';
import { PatientHistoryDialogComponent } from '../dialogs/patient-history.dialog';

@Component({
  selector: 'ctms-doctor-visits',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatTableModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule,
    MatButtonToggleModule, MatMenuModule, MatInputModule, FormsModule
  ],
  template: `
    <section class="page">
      <header class="page__head" style="display:flex; justify-content:space-between; align-items:flex-start">
        <div>
          <h1 class="page__title">My visits</h1>
          <p class="page__subtitle">Visits assigned to you — record outcomes as you go.</p>
        </div>
        <button mat-flat-button color="primary" (click)="scheduleVisit()">
          <mat-icon>add</mat-icon> Schedule Visit
        </button>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading your visits…</p></div>
      } @else if (error()) {
        <div class="state"><mat-icon>error_outline</mat-icon><p>{{ error() }}</p></div>
      } @else if (!all().length) {
        <div class="state"><mat-icon>event_available</mat-icon><p>You have no visits assigned right now.</p></div>
      } @else {
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap: 16px;">
          <mat-button-toggle-group class="filter-toggle" [value]="filter()" (change)="filter.set($event.value)">
            <mat-button-toggle value="open">Open ({{ openCount() }})</mat-button-toggle>
            <mat-button-toggle value="all">All ({{ all().length }})</mat-button-toggle>
          </mat-button-toggle-group>
          
          <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width: 300px;">
            <mat-label>Search visits...</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Name, ID, Trial..." />
            @if (searchQuery()) {
              <button mat-icon-button matSuffix (click)="searchQuery.set('')">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>
        </div>

        <div class="table-wrap">
          <table mat-table [dataSource]="visible()">
            <ng-container matColumnDef="trial">
              <th mat-header-cell *matHeaderCellDef>Trial Name</th>
              <td mat-cell *matCellDef="let v">{{ v.trialName || 'Unknown' }}</td>
            </ng-container>
            <ng-container matColumnDef="patient">
              <th mat-header-cell *matHeaderCellDef>Patient Name</th>
              <td mat-cell *matCellDef="let v">{{ v.patientName || 'Unknown' }}</td>
            </ng-container>
            <ng-container matColumnDef="visit">
              <th mat-header-cell *matHeaderCellDef>Visit Type</th>
              <td mat-cell *matCellDef="let v">{{ v.visitType || 'Visit' }}@if (v.visitNumber) { #{{ v.visitNumber }} }</td>
            </ng-container>
            <ng-container matColumnDef="scheduled">
              <th mat-header-cell *matHeaderCellDef>Visit Date</th>
              <td mat-cell *matCellDef="let v">{{ v.scheduledDate ? (v.scheduledDate | date:'dd MMM yyyy hh:mm a') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v"><span class="chip" [class]="'chip--' + tone(v.visitStatus)">{{ v.visitStatus }}</span></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let v" style="text-align:right">
                  <button mat-icon-button [matMenuTriggerFor]="m" (click)="$event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>
                  <mat-menu #m="matMenu">
                    @if (open(v.visitStatus)) {
                      <button mat-menu-item (click)="complete(v); $event.stopPropagation()"><mat-icon>task_alt</mat-icon>Mark completed</button>
                      <button mat-menu-item (click)="missed(v); $event.stopPropagation()"><mat-icon>event_busy</mat-icon>Mark missed</button>
                    }
                    <button mat-menu-item (click)="viewHistory(v); $event.stopPropagation()"><mat-icon>history</mat-icon>View Patient History</button>
                  </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns" class="row-hover" (click)="viewDetails(row)" style="cursor:pointer"></tr>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`
    .row-hover:hover { background-color: #f8fafc; }
  `]
})
export class DoctorVisitsComponent {
  private readonly ctx = inject(DoctorContextService);
  private readonly visits = inject(VisitService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly tone = statusTone;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly all = signal<VisitResponse[]>([]);
  readonly filter = signal<'open' | 'all'>('open');
  readonly searchQuery = signal('');
  private doctorId: number | null = null;
  private readonly router = inject(Router);

  readonly columns = ['trial', 'patient', 'visit', 'scheduled', 'status', 'actions'];
  readonly openCount = computed(() => this.all().filter((v) => this.open(v.visitStatus)).length);
  readonly visible = computed(() => {
    let filtered = this.filter() === 'open' ? this.all().filter((v) => this.open(v.visitStatus)) : this.all();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(v => 
        (v.patientName && v.patientName.toLowerCase().includes(q)) ||
        (v.patientId && v.patientId.toString().includes(q)) ||
        (v.trialName && v.trialName.toLowerCase().includes(q)) ||
        (v.visitNumber && v.visitNumber.toString() === q)
      );
    }
    return filtered;
  });

  constructor() {
    this.ctx.profile().subscribe({
      next: (doc) => { this.doctorId = doc.doctorId; this.load(); },
      error: () => { this.error.set("Your account isn't linked to a doctor profile."); this.loading.set(false); },
    });
  }

  load(): void {
    if (this.doctorId == null) return;
    this.loading.set(true);
    this.visits.byDoctor(this.doctorId).subscribe({
      next: (list) => { this.all.set(list); this.loading.set(false); },
      error: () => { this.error.set('We could not load your visits. Please try again.'); this.loading.set(false); },
    });
  }

  open(status: string): boolean {
    return status === 'Scheduled' || status === 'Rescheduled';
  }

  viewDetails(v: VisitResponse): void {
    this.router.navigate(['/doctor/visits', v.visitId]);
  }

  scheduleVisit(): void {
    this.dialog.open(ScheduleVisitDialogComponent, { width: '800px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((res) => {
        if (res) this.load();
      });
  }

  complete(v: VisitResponse): void {
    const data: DatePromptData = {
      title: 'Mark visit completed', label: 'Actual date', initial: new Date(),
      message: 'Record the date this visit took place (defaults to today).', confirmLabel: 'Mark completed',
    };
    this.dialog.open(DatePromptDialogComponent, { data, width: '420px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((iso?: string | null) => {
        if (iso === undefined) return;
        this.visits.complete(v.visitId, { actualDate: iso ?? undefined }).subscribe({
          next: () => { this.ui.success('Visit marked completed.'); this.load(); },
        });
      });
  }

  missed(v: VisitResponse): void {
    const data: ConfirmData = {
      title: 'Mark visit as missed?',
      message: `Visit #${v.visitNumber ?? ''} for patient #${v.patientId} will be recorded as missed.`,
      confirmLabel: 'Mark missed', danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((ok) => {
        if (!ok) return;
        this.visits.markMissed(v.visitId).subscribe({
          next: () => { this.ui.success('Visit marked missed.'); this.load(); },
        });
      });
  }

  viewHistory(v: VisitResponse): void {
    this.dialog.open(PatientHistoryDialogComponent, { 
      data: { patientId: v.patientId, patientName: v.patientName, trialName: v.trialName }, 
      width: '900px', 
      panelClass: 'ctms-dialog' 
    });
  }
}
