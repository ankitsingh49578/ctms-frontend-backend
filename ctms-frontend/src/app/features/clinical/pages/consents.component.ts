import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConsentService } from '../services/consents.service';
import { TrialService } from '../services/trials.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { ConsentResponse, TrialResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { ConsentFormDialogComponent } from '../dialogs/consent-form.dialog';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { DocumentViewerDialogComponent, DocumentViewerData } from '../../../shared/document-viewer.dialog';

@Component({
  selector: 'ctms-consents-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatTableModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatMenuModule, MatTooltipModule
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Consents</h1>
          <p class="page__subtitle">Manage informed-consent records across your trials.</p>
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
        @if (trialId()) {
          <button mat-flat-button (click)="create()"><mat-icon>note_add</mat-icon>New consent</button>
        }
      </div>

      @if (!trialId()) {
        <div class="state"><mat-icon>fact_check</mat-icon><p>Choose a trial to view its consents.</p></div>
      } @else if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading consents…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!rows().length) {
        <div class="state"><mat-icon>fact_check</mat-icon><p>No consent records for this trial yet.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()">
            <ng-container matColumnDef="patient">
              <th mat-header-cell *matHeaderCellDef>Patient Name</th>
              <td mat-cell *matCellDef="let c">{{ c.patientName || 'Unknown' }}</td>
            </ng-container>
            <ng-container matColumnDef="trial">
              <th mat-header-cell *matHeaderCellDef>Trial Name</th>
              <td mat-cell *matCellDef="let c">{{ c.trialName || 'Unknown' }}</td>
            </ng-container>
            <ng-container matColumnDef="document">
              <th mat-header-cell *matHeaderCellDef>Document</th>
              <td mat-cell *matCellDef="let c">
                @if (c.documentName) {
                  <div class="document-cell" (click)="viewDocument(c)" matTooltip="Click to view PDF" style="cursor:pointer">
                    <mat-icon class="pdf-icon">picture_as_pdf</mat-icon>
                    <div class="doc-info">
                      <span class="doc-name">{{ c.documentName }}</span>
                      <span class="doc-size">{{ formatSize(c.documentSize) }}</span>
                    </div>
                  </div>
                } @else {
                  <span class="muted">—</span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="version">
              <th mat-header-cell *matHeaderCellDef>Version</th>
              <td mat-cell *matCellDef="let c">{{ c.consentVersion || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let c">{{ c.consentDate ? (c.consentDate | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <span class="chip" [class]="'chip--' + tone(c.consentStatus)">{{ c.consentStatus }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c" style="text-align:right">
                @if (actionable(c.consentStatus)) {
                  <button mat-icon-button [matMenuTriggerFor]="m"><mat-icon>more_vert</mat-icon></button>
                  <mat-menu #m="matMenu">
                    @if (c.documentName) {
                      <button mat-menu-item (click)="viewDocument(c)"><mat-icon>visibility</mat-icon>View PDF</button>
                    }
                    <button mat-menu-item (click)="sign(c)"><mat-icon>draw</mat-icon>Mark signed</button>
                    <button mat-menu-item (click)="decline(c)"><mat-icon>block</mat-icon>Mark declined</button>
                    <button mat-menu-item (click)="withdraw(c)"><mat-icon>undo</mat-icon>Withdraw</button>
                  </mat-menu>
                } @else { <span class="muted" style="font-size:.8rem">—</span> }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
      }
    </section>
  `,
  styles: [`
    .document-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .document-cell:hover .doc-name {
      text-decoration: underline;
      color: var(--primary);
    }
    .pdf-icon {
      color: #ff6b6b;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .doc-info {
      display: flex;
      flex-direction: column;
    }
    .doc-name {
      font-weight: 500;
      font-size: 13px;
      color: #333;
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .doc-size {
      font-size: 11px;
      color: #666;
    }
  `]
})
export class ConsentsManagementComponent {
  private readonly consents = inject(ConsentService);
  private readonly trialSvc = inject(TrialService);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly tone = statusTone;
  readonly trials = signal<TrialResponse[]>([]);
  readonly trialId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rows = signal<ConsentResponse[]>([]);
  readonly columns = ['patient', 'trial', 'document', 'version', 'date', 'status', 'actions'];

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
    this.consents.forTrial(id).subscribe({
      next: (list) => { this.rows.set(list); this.loading.set(false); },
      error: () => { this.error.set('We could not load consents. Please try again.'); this.loading.set(false); },
    });
  }

  actionable(status: string): boolean {
    return status !== 'Withdrawn';
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  viewDocument(c: ConsentResponse): void {
    this.dialog.open(DocumentViewerDialogComponent, {
      data: {
        title: c.documentName || 'Consent Document',
        documentUrl: this.consents.documentUrl(c.consentId),
        token: this.auth.token() || ''
      } as DocumentViewerData,
      width: '90vw',
      maxWidth: '1200px',
      panelClass: 'document-dialog'
    });
  }

  create(): void {
    const trial = this.trials().find((t) => t.trialId === this.trialId());
    if (!trial) return;
    this.dialog.open(ConsentFormDialogComponent, { data: { trial }, width: '640px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((saved) => { if (saved) this.load(); });
  }

  sign(c: ConsentResponse): void {
    this.act('Mark consent signed?', `Patient #${c.patientId}'s consent will be recorded as signed.`, 'Mark signed', false, () =>
      this.consents.sign(c.consentId).subscribe({ next: () => { this.ui.success('Consent signed.'); this.load(); } }));
  }
  decline(c: ConsentResponse): void {
    this.act('Mark consent declined?', `Patient #${c.patientId}'s consent will be recorded as declined.`, 'Mark declined', true, () =>
      this.consents.decline(c.consentId).subscribe({ next: () => { this.ui.success('Consent declined.'); this.load(); } }));
  }
  withdraw(c: ConsentResponse): void {
    this.act('Withdraw consent?', `Patient #${c.patientId}'s consent will be withdrawn. This is typically irreversible.`, 'Withdraw', true, () =>
      this.consents.withdraw(c.consentId).subscribe({ next: () => { this.ui.success('Consent withdrawn.'); this.load(); } }));
  }

  private act(title: string, message: string, confirmLabel: string, danger: boolean, run: () => void): void {
    const data: ConfirmData = { title, message, confirmLabel, danger };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px', panelClass: 'ctms-dialog' })
      .afterClosed().subscribe((ok) => { if (ok) run(); });
  }
}
