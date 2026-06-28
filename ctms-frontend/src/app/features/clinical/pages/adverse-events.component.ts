import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AdverseEventService } from '../services/safety.service';
import { TrialService } from '../services/trials.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { AdverseEventResponse, TrialResponse } from '../../../core/models/domain.models';
import { ADVERSE_EVENT_STATUSES, statusTone } from '../../../core/models/enums';
import { capabilitiesFor } from '../clinical.capabilities';
import { AdverseEventFormDialogComponent } from '../dialogs/adverse-event-form.dialog';
import { PickStatusDialogComponent, PickStatusData } from '../dialogs/pick-status.dialog';

@Component({
  selector: 'ctms-adverse-events-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatTableModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Adverse events</h1>
          <p class="page__subtitle">
            {{ caps().reportAdverseEvents ? 'Report and triage adverse events by trial.' : 'Safety oversight across your trials (read-only).' }}
          </p>
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
        @if (caps().reportAdverseEvents && trialId()) {
          <button mat-flat-button (click)="report()"><mat-icon>add_alert</mat-icon>Report event</button>
        }
      </div>

      @if (!trialId()) {
        <div class="state"><mat-icon>health_and_safety</mat-icon><p>Choose a trial to view adverse events.</p></div>
      } @else if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading events…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!rows().length) {
        <div class="state"><mat-icon>verified_user</mat-icon><p>No adverse events recorded for this trial.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()">
            <ng-container matColumnDef="eventId">
              <th mat-header-cell *matHeaderCellDef>Event ID</th>
              <td mat-cell *matCellDef="let e">#{{ e.eventId }}</td>
            </ng-container>
            <ng-container matColumnDef="patient">
              <th mat-header-cell *matHeaderCellDef>Patient</th>
              <td mat-cell *matCellDef="let e">#{{ e.patientId }}</td>
            </ng-container>
            <ng-container matColumnDef="severity">
              <th mat-header-cell *matHeaderCellDef>Severity</th>
              <td mat-cell *matCellDef="let e">
                <span class="chip" [class]="'chip--' + tone(e.severity)">{{ e.severity }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Event date</th>
              <td mat-cell *matCellDef="let e">{{ e.eventDate ? (e.eventDate | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let e" class="cell-clip">{{ e.description || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="createdByName">
              <th mat-header-cell *matHeaderCellDef>Created By</th>
              <td mat-cell *matCellDef="let e">
                {{ e.createdByName || '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="createdByRole">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let e">
                {{ e.createdByRole || '—' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e" style="text-align:right">
                @if (caps().reportAdverseEvents) {
                  <button mat-button (click)="changeStatus(e)">Status</button>
                } @else { <span class="muted" style="font-size:.8rem">—</span> }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns()"></tr>
            <tr mat-row *matRowDef="let row; columns: columns()"></tr>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`.cell-clip { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`],
})
export class AdverseEventsManagementComponent {
  private readonly events = inject(AdverseEventService);
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
  readonly rows = signal<AdverseEventResponse[]>([]);

  readonly columns = computed(() =>
    this.caps().reportAdverseEvents
      ? ['eventId', 'patient', 'severity', 'date', 'status', 'createdByName', 'createdByRole', 'actions']
      : ['eventId', 'patient', 'severity', 'date', 'status', 'createdByName', 'createdByRole']);

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
    this.load();
  }

  load(): void {
    const id = this.trialId();
    if (id == null) return;
    this.loading.set(true);
    this.error.set(null);
    this.events.forTrial(id).subscribe({
      next: (list) => { this.rows.set(list); this.loading.set(false); },
      error: () => { this.error.set('We could not load adverse events. Please try again.'); this.loading.set(false); },
    });
  }

  report(): void {
    const trial = this.trials().find((t) => t.trialId === this.trialId());
    if (!trial) return;
    this.dialog.open(AdverseEventFormDialogComponent, { data: { trial }, width: '640px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  changeStatus(e: AdverseEventResponse): void {
    const data: PickStatusData = {
      title: `Event status — patient #${e.patientId}`, label: 'Status', current: e.status,
      options: ADVERSE_EVENT_STATUSES, confirmLabel: 'Update',
    };
    this.dialog.open(PickStatusDialogComponent, { data, width: '380px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((status?: string) => {
        if (!status || status === e.status) return;
        this.events.updateStatus(e.eventId, { status }).subscribe({
          next: () => { this.ui.success('Event status updated.'); this.load(); },
        });
      });
  }
}
