import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { VisitService } from '../services/visits.service';
import { TrialService } from '../services/trials.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { Page } from '../../../core/models/api.models';
import { TrialResponse, VisitResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { capabilitiesFor } from '../clinical.capabilities';
import { VisitFormDialogComponent } from '../dialogs/visit-form.dialog';
import { DatePromptDialogComponent, DatePromptData } from '../dialogs/date-prompt.dialog';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';

@Component({
  selector: 'ctms-visits-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatSelectModule, MatMenuModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Visits</h1>
          <p class="page__subtitle">Schedule and track study visits, trial by trial.</p>
        </div>
      </header>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
          <mat-label>Trial</mat-label>
          <mat-select [value]="trialId()" (selectionChange)="selectTrial($event.value)">
            @for (t of trials(); track t.trialId) {
              <mat-option [value]="t.trialId">{{ t.trialCode }} — {{ t.trialName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (caps().scheduleVisits && trialId()) {
          <button mat-flat-button (click)="schedule()"><mat-icon>add</mat-icon>Schedule visit</button>
        }
      </div>

      @if (!trialId()) {
        <div class="state"><mat-icon>event</mat-icon><p>Choose a trial to see its visits.</p></div>
      } @else if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading visits…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (page().empty) {
        <div class="state"><mat-icon>event_busy</mat-icon><p>No visits scheduled for this trial yet.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="page().content">
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
              <td mat-cell *matCellDef="let v">
                {{ v.visitType || 'Visit' }}@if (v.visitNumber) { #{{ v.visitNumber }} }
              </td>
            </ng-container>
            <ng-container matColumnDef="scheduled">
              <th mat-header-cell *matHeaderCellDef>Visit Date</th>
              <td mat-cell *matCellDef="let v">{{ v.scheduledDate ? (v.scheduledDate | date:'dd MMM yyyy hh:mm a') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="doctor">
              <th mat-header-cell *matHeaderCellDef>Assigned Doctor</th>
              <td mat-cell *matCellDef="let v">{{ v.doctorName || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let v">
                <span class="chip" [class]="'chip--' + tone(v.visitStatus)">{{ v.visitStatus }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let v" style="text-align:right">
                @if (anyAction(v)) {
                  <button mat-icon-button [matMenuTriggerFor]="m"><mat-icon>more_vert</mat-icon></button>
                  <mat-menu #m="matMenu">
                    @if (caps().completeVisits && open(v.visitStatus)) {
                      <button mat-menu-item (click)="complete(v)"><mat-icon>task_alt</mat-icon>Mark completed</button>
                      <button mat-menu-item (click)="missed(v)"><mat-icon>event_busy</mat-icon>Mark missed</button>
                    }
                    @if (caps().scheduleVisits && open(v.visitStatus)) {
                      <button mat-menu-item (click)="reschedule(v)"><mat-icon>edit_calendar</mat-icon>Reschedule</button>
                      <button mat-menu-item (click)="cancel(v)"><mat-icon>cancel</mat-icon>Cancel visit</button>
                    }
                  </mat-menu>
                } @else { <span class="muted" style="font-size:.8rem">—</span> }
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
export class VisitsManagementComponent {
  private readonly visits = inject(VisitService);
  private readonly trialSvc = inject(TrialService);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly caps = computed(() => capabilitiesFor(this.auth.roleKey()));
  readonly tone = statusTone;

  readonly trials = signal<TrialResponse[]>([]);
  readonly trialId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal<Page<VisitResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  readonly columns = ['trial', 'patient', 'visit', 'scheduled', 'doctor', 'status', 'actions'];
  pageIndex = 0;
  size = 10;

  constructor() {
    this.trialSvc.list({ page: 0, size: 200, sort: 'trialName,asc' }).subscribe({
      next: (p) => {
        this.trials.set(p.content);
        if (p.content.length && this.trialId() == null) this.selectTrial(p.content[0].trialId);
      },
    });
  }

  selectTrial(id: number): void {
    this.trialId.set(id);
    this.pageIndex = 0;
    this.load();
  }

  load(): void {
    const id = this.trialId();
    if (id == null) return;
    this.loading.set(true);
    this.error.set(null);
    this.visits.forTrial(id, { page: this.pageIndex, size: this.size, sort: 'scheduledDate,desc' }).subscribe({
      next: (p) => { this.page.set(p); this.loading.set(false); },
      error: () => { this.error.set('We could not load visits. Please try again.'); this.loading.set(false); },
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  open(status: string): boolean {
    return status === 'Scheduled' || status === 'Rescheduled';
  }
  anyAction(v: VisitResponse): boolean {
    return this.open(v.visitStatus) && (this.caps().completeVisits || this.caps().scheduleVisits);
  }

  schedule(): void {
    const trial = this.trials().find((t) => t.trialId === this.trialId());
    if (!trial) return;
    this.dialog.open(VisitFormDialogComponent, { data: { trial }, width: '700px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  complete(v: VisitResponse): void {
    const data: DatePromptData = {
      title: 'Mark visit completed', label: 'Actual date', initial: new Date(),
      message: 'Record the date the visit actually took place (defaults to today).',
      confirmLabel: 'Mark completed',
    };
    this.dialog.open(DatePromptDialogComponent, { data, width: '420px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((iso?: string | null) => {
        if (iso === undefined) return;
        this.visits.complete(v.visitId, { actualDate: iso ?? undefined }).subscribe({
          next: () => { this.ui.success('Visit marked completed.'); this.load(); },
        });
      });
  }

  reschedule(v: VisitResponse): void {
    const data: DatePromptData = {
      title: 'Reschedule visit', label: 'New date', required: true,
      initial: v.scheduledDate ? new Date(v.scheduledDate) : new Date(),
      confirmLabel: 'Reschedule',
    };
    this.dialog.open(DatePromptDialogComponent, { data, width: '420px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((iso?: string | null) => {
        if (!iso) return;
        this.visits.reschedule(v.visitId, { newDate: iso }).subscribe({
          next: () => { this.ui.success('Visit rescheduled.'); this.load(); },
        });
      });
  }

  missed(v: VisitResponse): void {
    this.confirm('Mark visit as missed?', `Visit #${v.visitNumber ?? ''} for ${v.patientName || 'patient'} will be recorded as missed.`, 'Mark missed', true, () =>
      this.visits.markMissed(v.visitId).subscribe({ next: () => { this.ui.success('Visit marked missed.'); this.load(); } }));
  }

  cancel(v: VisitResponse): void {
    this.confirm('Cancel visit?', `This cancels visit #${v.visitNumber ?? ''} for ${v.patientName || 'patient'}.`, 'Cancel visit', true, () =>
      this.visits.cancel(v.visitId).subscribe({ next: () => { this.ui.success('Visit cancelled.'); this.load(); } }));
  }

  private confirm(title: string, message: string, confirmLabel: string, danger: boolean, run: () => void): void {
    const data: ConfirmData = { title, message, confirmLabel, danger };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((ok) => { if (ok) run(); });
  }
}
