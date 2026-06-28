import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AdverseEventService } from '../../clinical/services/safety.service';
import { TrialService } from '../../clinical/services/trials.service';
import { UiService } from '../../../core/services/ui.service';
import { AdverseEventResponse, TrialResponse } from '../../../core/models/domain.models';
import { ADVERSE_EVENT_STATUSES, statusTone } from '../../../core/models/enums';
import { DoctorAdverseEventFormDialogComponent } from '../dialogs/adverse-event-form.dialog';
import { PickStatusDialogComponent, PickStatusData } from '../../clinical/dialogs/pick-status.dialog';

@Component({
  selector: 'ctms-doctor-adverse-events',
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
          <p class="page__subtitle">Flag and follow up on adverse events for your trials.</p>
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
        <button mat-flat-button (click)="report()" [disabled]="!trials().length">
          <mat-icon>add_alert</mat-icon>Report event
        </button>
      </div>

      @if (!trialId()) {
        <div class="state"><mat-icon>health_and_safety</mat-icon><p>Choose a trial to view adverse events.</p></div>
      } @else if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading events…</p></div>
      } @else if (error()) {
        <div class="state"><mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button></div>
      } @else if (!rows().length) {
        <div class="state"><mat-icon>verified_user</mat-icon><p>No adverse events recorded for this trial.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()">
            <ng-container matColumnDef="patient">
              <th mat-header-cell *matHeaderCellDef>Patient</th>
              <td mat-cell *matCellDef="let e">#{{ e.patientId }}</td>
            </ng-container>
            <ng-container matColumnDef="severity">
              <th mat-header-cell *matHeaderCellDef>Severity</th>
              <td mat-cell *matCellDef="let e"><span class="chip" [class]="'chip--' + tone(e.severity)">{{ e.severity }}</span></td>
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
              <td mat-cell *matCellDef="let e"><span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e" style="text-align:right">
                <button mat-button (click)="changeStatus(e)">Status</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`.cell-clip { max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`],
})
export class DoctorAdverseEventsComponent {
  private readonly events = inject(AdverseEventService);
  private readonly trialSvc = inject(TrialService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly tone = statusTone;
  readonly trials = signal<TrialResponse[]>([]);
  readonly trialId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rows = signal<AdverseEventResponse[]>([]);
  readonly columns = ['patient', 'severity', 'date', 'description', 'status', 'actions'];

  constructor() {
    this.trialSvc.list({ page: 0, size: 200, sort: 'trialName,asc' }).subscribe({
      next: (p) => {
        this.trials.set(p.content);
        if (p.content.length) this.selectTrial(p.content[0].trialId);
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
    this.dialog.open(DoctorAdverseEventFormDialogComponent, {
      data: { trials: this.trials(), trialId: this.trialId() },
      width: '700px', panelClass: 'ctms-dialog',
    }).afterClosed().subscribe((saved) => { if (saved) this.load(); });
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
