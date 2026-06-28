import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminSystemService } from '../services/admin-system.service';
import { UiService } from '../../../core/services/ui.service';
import { AuditLogResponse } from '../../../core/models/domain.models';

/**
 * Admin audit-trail viewer. Backed by GET /api/audit-logs (recent, capped at 500)
 * with an optional per-user lookup via GET /api/audit-logs/user/{userId}. The
 * endpoints return a plain list, so this page is limit-driven rather than paged.
 */
@Component({
  selector: 'ctms-admin-audit-logs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatTableModule, MatProgressSpinnerModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  ],
  template: `
    <section class="page">
      <div class="hero">
        <h1>Audit Trail</h1>
        <p>System-wide activity recorded by the backend. Visible to administrators only.</p>
        <div class="hero__icon"><mat-icon>history</mat-icon></div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width:160px">
          <mat-label>Show</mat-label>
          <mat-select [formControl]="limitCtrl">
            @for (n of limits; track n) { <mat-option [value]="n">Latest {{ n }}</mat-option> }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width:200px">
          <mat-icon matPrefix>person_search</mat-icon>
          <mat-label>Filter by user ID</mat-label>
          <input matInput type="number" inputmode="numeric" [formControl]="userCtrl" (keyup.enter)="applyUserFilter()" />
          @if (userCtrl.value) {
            <button matSuffix mat-icon-button (click)="clearUserFilter()"><mat-icon>close</mat-icon></button>
          }
        </mat-form-field>

        @if (userCtrl.value) {
          <button mat-stroked-button (click)="applyUserFilter()"><mat-icon>filter_alt</mat-icon>Apply</button>
        }
        <span class="spacer"></span>
        <button mat-stroked-button (click)="load()" [disabled]="loading()"><mat-icon>refresh</mat-icon>Refresh</button>
      </div>

      @if (scope()) {
        <p class="muted" style="margin:-4px 0 12px">{{ scope() }}</p>
      }

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading audit entries…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!logs().length) {
        <div class="state"><mat-icon>history_toggle_off</mat-icon><p>No audit entries to show.</p></div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="logs()">
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>When</th>
              <td mat-cell *matCellDef="let l">{{ l.createdAt ? (l.createdAt | date:'medium') : '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="userId">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let l">
                @if (l.userId != null) { <span class="chip chip--neutral">#{{ l.userId }}</span> }
                @else { <span class="muted">system</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let l"><strong>{{ l.action || '—' }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="module">
              <th mat-header-cell *matHeaderCellDef>Module</th>
              <td mat-cell *matCellDef="let l">{{ l.module || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="ipAddress">
              <th mat-header-cell *matHeaderCellDef>IP address</th>
              <td mat-cell *matCellDef="let l"><span class="muted">{{ l.ipAddress || '—' }}</span></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        </div>
        <p class="muted" style="margin:12px 2px 0;font-size:.8rem">
          Showing {{ logs().length }} {{ logs().length === 1 ? 'entry' : 'entries' }}.
        </p>
      }
    </section>
  `,
})
export class AdminAuditLogsComponent implements OnInit {
  private readonly system = inject(AdminSystemService);
  private readonly ui = inject(UiService);

  readonly columns = ['createdAt', 'userId', 'action', 'module', 'ipAddress'];
  readonly limits = [50, 100, 200, 500];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly logs = signal<AuditLogResponse[]>([]);
  readonly scope = signal<string | null>(null);

  readonly limitCtrl = new FormControl(50, { nonNullable: true });
  readonly userCtrl = new FormControl<number | null>(null);

  ngOnInit(): void {
    this.limitCtrl.valueChanges.subscribe(() => {
      if (!this.userCtrl.value) this.load();
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const userId = this.userCtrl.value;
    const call = userId
      ? this.system.auditLogsForUser(userId)
      : this.system.recentAuditLogs(this.limitCtrl.value);
    this.scope.set(userId ? `Filtered to user #${userId}.` : null);
    call.subscribe({
      next: (rows) => {
        this.logs.set(rows ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load the audit trail. Please try again.');
        this.loading.set(false);
      },
    });
  }

  applyUserFilter(): void {
    if (this.userCtrl.value == null || this.userCtrl.value <= 0) {
      this.ui.info('Enter a valid user ID to filter.');
      return;
    }
    this.load();
  }

  clearUserFilter(): void {
    this.userCtrl.setValue(null);
    this.load();
  }
}
