import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PortalService } from '../services/portal.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { ConsentResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';
import { DocumentViewerDialogComponent, DocumentViewerData } from '../../../shared/document-viewer.dialog';

@Component({
  selector: 'ctms-portal-consents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterLink, MatTableModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Consent Forms</h1>
          <p class="page__subtitle">Review and respond to informed-consent requests for your trials.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading consents…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!rows().length) {
        <div class="state"><mat-icon>fact_check</mat-icon><p>You have no consent forms at the moment.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()">
            <ng-container matColumnDef="trial">
              <th mat-header-cell *matHeaderCellDef>Trial</th>
              <td mat-cell *matCellDef="let c">
                <a [routerLink]="['/portal/trials', c.trialId]">{{ c.trialName || 'Trial #' + c.trialId }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="document">
              <th mat-header-cell *matHeaderCellDef>Document</th>
              <td mat-cell *matCellDef="let c">
                @if (c.documentName) {
                  <div class="document-cell">
                    <mat-icon class="pdf-icon">picture_as_pdf</mat-icon>
                    <div class="doc-info">
                      <span class="doc-name" [matTooltip]="c.documentName">{{ c.documentName }}</span>
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
            <ng-container matColumnDef="signedDate">
              <th mat-header-cell *matHeaderCellDef>Signed Date</th>
              <td mat-cell *matCellDef="let c">
                {{ c.signedDate ? (c.signedDate | date:'dd/MM/yyyy HH:mm') : '-' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <div class="row-actions">
                  @if (c.documentName) {
                    <button mat-stroked-button color="primary" (click)="viewDocument(c)">
                      <mat-icon>visibility</mat-icon> View PDF
                    </button>
                  }
                  
                  @if (isPending(c.consentStatus)) {
                    <span [matTooltip]="!hasViewed(c.consentId) ? 'You must view the document before accepting' : ''">
                      <button mat-flat-button color="primary" 
                              [disabled]="busyId() === c.consentId || !hasViewed(c.consentId)" 
                              (click)="accept(c)">
                        @if (busyId() === c.consentId && pendingAction() === 'accept') { <mat-spinner diameter="16" /> }
                        @else { Accept }
                      </button>
                    </span>
                    <button mat-stroked-button color="warn" [disabled]="busyId() === c.consentId" (click)="reject(c)">
                      Reject
                    </button>
                  }
                </div>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <p class="muted" style="margin-top:12px;font-size:.82rem">
          Please read the entire consent document carefully before making a decision. 
          Accepting records your informed consent for the study. Rejecting will notify your
          clinical team. Both actions are recorded against the consent version shown.
        </p>
      }
    </section>
  `,
  styles: [`
    .document-cell {
      display: flex;
      align-items: center;
      gap: 8px;
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
    .row-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
    }
  `]
})
export class PortalConsentsComponent {
  private readonly portal = inject(PortalService);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['trial', 'document', 'version', 'date', 'status', 'signedDate', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<ConsentResponse[]>([]);
  readonly busyId = signal<number | null>(null);
  readonly pendingAction = signal<'accept' | 'reject' | null>(null);
  readonly viewedConsentIds = signal<Set<number>>(new Set());

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.myConsents().subscribe({
      next: (list) => {
        this.rows.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load your consent forms. Please try again.');
        this.loading.set(false);
      },
    });
  }

  isPending(status: string): boolean {
    return status === 'Pending';
  }

  hasViewed(consentId: number): boolean {
    return this.viewedConsentIds().has(consentId);
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  }

  viewDocument(c: ConsentResponse): void {
    const data: DocumentViewerData = {
      title: c.documentName || 'Consent Document',
      documentUrl: this.portal.consentDocumentUrl(c.consentId),
      token: this.auth.token() || ''
    };
    
    this.dialog.open(DocumentViewerDialogComponent, {
      data,
      width: '90vw',
      maxWidth: '1200px',
      panelClass: 'document-dialog'
    }).afterClosed().subscribe(() => {
      // Mark as viewed once they open the document
      const current = new Set(this.viewedConsentIds());
      current.add(c.consentId);
      this.viewedConsentIds.set(current);
    });
  }

  accept(c: ConsentResponse): void {
    if (!c.documentName) {
      this.ui.error('This consent form does not have an attached document. Please contact your clinical manager.');
      return;
    }

    const data: ConfirmData = {
      title: 'Accept consent form?',
      message: 'I confirm that I have read the complete consent document and voluntarily agree to participate in this clinical trial.',
      confirmLabel: 'Accept consent',
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '480px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.run('accept', c);
    });
  }

  reject(c: ConsentResponse): void {
    const data: ConfirmData = {
      title: 'Reject consent form?',
      message: 'Are you sure you want to reject this consent? Your clinical team will be notified.',
      confirmLabel: 'Reject',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.run('reject', c);
    });
  }

  private run(action: 'accept' | 'reject', c: ConsentResponse): void {
    this.busyId.set(c.consentId);
    this.pendingAction.set(action);
    // Note: The backend endpoints are still called sign and decline for historical reasons
    const call = action === 'accept'
      ? this.portal.signConsent(c.consentId)
      : this.portal.declineConsent(c.consentId);
      
    call.subscribe({
      next: () => {
        this.busyId.set(null);
        this.pendingAction.set(null);
        this.ui.success(action === 'accept' ? 'Consent accepted successfully.' : 'Consent rejected successfully.');
        this.load();
      },
      error: () => {
        this.busyId.set(null);
        this.pendingAction.set(null);
      },
    });
  }
}
