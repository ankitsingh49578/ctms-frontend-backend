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
import { EnrollmentResponse } from '../../../core/models/domain.models';
import { statusTone } from '../../../core/models/enums';
import { ConfirmDialogComponent, ConfirmData } from '../../../shared/confirm-dialog.component';

@Component({
  selector: 'ctms-portal-enrollments',
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
          <h1 class="page__title">My Applications</h1>
          <p class="page__subtitle">Trials you have applied to and your current status in each.</p>
        </div>
        <a mat-flat-button routerLink="/portal/trials"><mat-icon>add</mat-icon>Browse trials</a>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading applications…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!rows().length) {
        <div class="state">
          <mat-icon>assignment_turned_in</mat-icon>
          <p>You have not applied to any trials yet.</p>
          <a mat-flat-button routerLink="/portal/trials">Browse available trials</a>
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()">
            <ng-container matColumnDef="trialCode">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let e">{{ e.trialCode || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="trialName">
              <th mat-header-cell *matHeaderCellDef>Trial Name</th>
              <td mat-cell *matCellDef="let e">
                <a [routerLink]="['/portal/trials', e.trialId]">{{ e.trialName || 'Trial #' + e.trialId }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Applied</th>
              <td mat-cell *matCellDef="let e">{{ e.enrollmentDate ? (e.enrollmentDate | date:'mediumDate') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="chip" [class]="'chip--' + tone(e.status)">{{ e.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="trialStatus">
              <th mat-header-cell *matHeaderCellDef>Trial Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="chip chip--neutral">{{ e.trialStatus || '—' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                @if (canWithdraw(e.status)) {
                  <button mat-stroked-button color="warn" [disabled]="busyId() === e.enrollmentId" (click)="withdraw(e)">
                    @if (busyId() === e.enrollmentId) { <mat-spinner diameter="16" /> } @else { Withdraw }
                  </button>
                } @else {
                  <span class="muted" style="font-size:.8rem">—</span>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <p class="muted" style="margin-top:12px;font-size:.82rem">
          You can withdraw an application while it is in screening or active enrollment.
          Completed, terminated or already-withdrawn applications are read-only.
        </p>
      }
    </section>
  `,
})
export class PortalEnrollmentsComponent {
  private readonly portal = inject(PortalService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['trialCode', 'trialName', 'date', 'status', 'trialStatus', 'actions'];
  readonly tone = statusTone;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<EnrollmentResponse[]>([]);
  readonly busyId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.portal.myEnrollments().subscribe({
      next: (list) => {
        // Sort by enrollmentDate descending
        list.sort((a, b) => {
          if (!a.enrollmentDate) return 1;
          if (!b.enrollmentDate) return -1;
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
        });
        this.rows.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load your applications. Please try again.');
        this.loading.set(false);
      },
    });
  }

  canWithdraw(status: string): boolean {
    return status === 'Screening' || status === 'Enrolled';
  }

  withdraw(e: EnrollmentResponse): void {
    const data: ConfirmData = {
      title: 'Withdraw application?',
      message: `This withdraws your application to Trial #${e.trialId}. Your clinical team will be notified. This cannot be undone from the portal.`,
      confirmLabel: 'Withdraw',
      danger: true,
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '420px' }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.busyId.set(e.enrollmentId);
      this.portal.withdraw(e.enrollmentId).subscribe({
        next: () => {
          this.busyId.set(null);
          this.ui.success('Application withdrawn.');
          this.load();
        },
        error: () => this.busyId.set(null),
      });
    });
  }
}
