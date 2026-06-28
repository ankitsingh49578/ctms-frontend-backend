import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PortalService } from '../services/portal.service';
import { UiService } from '../../../core/services/ui.service';
import { ConsentResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';

@Component({
  selector: 'ctms-portal-consents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, RouterLink, MatTableModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatDialogModule,
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
                <a [routerLink]="['/portal/trials', c.trialId]">Trial #{{ c.trialId }}</a>
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
              <td mat-cell *matCellDef="let c">
                @if (isPending(c.consentStatus)) {
                  <div class="row-actions">
                    <button mat-flat-button color="primary" [disabled]="busyId() === c.consentId" (click)="sign(c)">
                      @if (busyId() === c.consentId && pendingAction() === 'sign') { <mat-spinner diameter="16" /> }
                      @else { Sign }
                    </button>
                    <button mat-stroked-button color="warn" [disabled]="busyId() === c.consentId" (click)="decline(c)">
                      Decline
                    </button>
                  </div>
                } @else {
                  <span class="muted" style="font-size:.8rem">No action needed</span>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <p class="muted" style="margin-top:12px;font-size:.82rem">
          Signing records your informed consent for the study. Declining will notify your
          clinical team. Both actions are recorded against the consent version shown.
        </p>
      }
    </section>
  `,
})
export class PortalConsentsComponent {
  private readonly portal = inject(PortalService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['trial', 'version', 'date', 'status', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<ConsentResponse[]>([]);
  readonly busyId = signal<number | null>(null);
  readonly pendingAction = signal<'sign' | 'decline' | null>(null);

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

  sign(c: ConsentResponse): void {
    const data: ConfirmData = {
      title: 'Sign consent form?',
      message: `By signing, you give informed consent for Trial #${c.trialId}${c.consentVersion ? ` (version ${c.consentVersion})` : ''}.`,
      confirmLabel: 'Sign consent',
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.run('sign', c);
    });
  }

  decline(c: ConsentResponse): void {
    const data: ConfirmData = {
      title: 'Decline consent form?',
      message: `Declining records that you do not consent to Trial #${c.trialId}. Your clinical team will be notified.`,
      confirmLabel: 'Decline',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.run('decline', c);
    });
  }

  private run(action: 'sign' | 'decline', c: ConsentResponse): void {
    this.busyId.set(c.consentId);
    this.pendingAction.set(action);
    const call = action === 'sign'
      ? this.portal.signConsent(c.consentId)
      : this.portal.declineConsent(c.consentId);
    call.subscribe({
      next: () => {
        this.busyId.set(null);
        this.pendingAction.set(null);
        this.ui.success(action === 'sign' ? 'Consent signed.' : 'Consent declined.');
        this.load();
      },
      error: () => {
        this.busyId.set(null);
        this.pendingAction.set(null);
      },
    });
  }
}
