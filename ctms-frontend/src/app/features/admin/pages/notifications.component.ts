import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationAdminService } from '../services/notification-admin.service';
import { UiService } from '../../../core/services/ui.service';
import { NotificationResponse } from '../../../core/models/domain.models';
import { NotificationComposeDialogComponent } from './notification-compose.dialog';

/**
 * Notifications console. Backed by NotificationController. The API has no
 * "all notifications" read — it is user-scoped — so this page sends notifications
 * and inspects (and marks read) the feed for one recipient at a time.
 */
@Component({
  selector: 'ctms-admin-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, ReactiveFormsModule, MatProgressSpinnerModule, MatButtonModule,
    MatButtonToggleModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule,
  ],
  template: `
    <section class="page">
      <div class="hero">
        <h1>Notifications</h1>
        <p>Send a notification to a user, or inspect and clear a recipient's feed.</p>
        <div class="hero__icon"><mat-icon>notifications</mat-icon></div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width:220px">
          <mat-icon matPrefix>person_search</mat-icon>
          <mat-label>Recipient user ID</mat-label>
          <input matInput type="number" inputmode="numeric" [formControl]="userCtrl" (keyup.enter)="load()" />
        </mat-form-field>
        <mat-button-toggle-group [formControl]="scopeCtrl" (change)="load()" aria-label="Feed scope">
          <mat-button-toggle value="all">All</mat-button-toggle>
          <mat-button-toggle value="unread">Unread</mat-button-toggle>
        </mat-button-toggle-group>
        <button mat-stroked-button (click)="load()" [disabled]="!userCtrl.value"><mat-icon>visibility</mat-icon>View feed</button>
        <span class="spacer"></span>
        <button mat-flat-button color="primary" (click)="compose()"><mat-icon>send</mat-icon>Send notification</button>
      </div>

      @if (!loaded()) {
        <div class="state">
          <mat-icon>forward_to_inbox</mat-icon>
          <p>Enter a recipient user ID to view their notifications, or send a new one.</p>
        </div>
      } @else if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading feed…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="load()">Retry</button>
        </div>
      } @else if (!items().length) {
        <div class="state">
          <mat-icon>mark_email_read</mat-icon>
          <p>No {{ scopeCtrl.value === 'unread' ? 'unread ' : '' }}notifications for user #{{ activeUser() }}.</p>
        </div>
      } @else {
        <div class="list">
          @for (n of items(); track n.notificationId) {
            <div class="list__row" [class.list__row--unread]="!n.read">
              <div class="list__icon"><mat-icon>{{ n.read ? 'drafts' : 'mark_email_unread' }}</mat-icon></div>
              <div class="list__body">
                <div class="list__title">
                  {{ n.title || '(no title)' }}
                  @if (!n.read) { <span class="chip chip--neutral">Unread</span> }
                </div>
                @if (n.message) { <div class="list__text">{{ n.message }}</div> }
                <div class="list__meta">{{ n.createdAt ? (n.createdAt | date:'medium') : '' }}</div>
              </div>
              @if (!n.read) {
                <button mat-stroked-button [disabled]="busyId() === n.notificationId" (click)="markRead(n)">
                  @if (busyId() === n.notificationId) { <mat-spinner diameter="16" /> }
                  @else { Mark read }
                </button>
              }
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .list { display: flex; flex-direction: column; gap: 10px; }
    .list__row {
      display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px;
      background: #fff; border: 1px solid var(--ctms-border); border-radius: 14px;
    }
    .list__row--unread { border-left: 3px solid var(--ctms-accent); }
    .list__icon mat-icon { color: var(--ctms-ink-soft); }
    .list__row--unread .list__icon mat-icon { color: var(--ctms-accent); }
    .list__body { flex: 1; min-width: 0; }
    .list__title { font-weight: 650; display: flex; align-items: center; gap: 8px; }
    .list__text { color: var(--ctms-ink-soft); margin-top: 2px; }
    .list__meta { color: var(--ctms-ink-soft); font-size: .8rem; margin-top: 4px; }
  `],
})
export class AdminNotificationsComponent {
  private readonly notifications = inject(NotificationAdminService);
  private readonly ui = inject(UiService);
  private readonly dialog = inject(MatDialog);

  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly items = signal<NotificationResponse[]>([]);
  readonly activeUser = signal<number | null>(null);

  readonly userCtrl = new FormControl<number | null>(null);
  readonly scopeCtrl = new FormControl<'all' | 'unread'>('all', { nonNullable: true });

  load(): void {
    const userId = this.userCtrl.value;
    if (userId == null || userId <= 0) {
      this.ui.info('Enter a valid recipient user ID.');
      return;
    }
    this.loaded.set(true);
    this.loading.set(true);
    this.error.set(null);
    this.activeUser.set(userId);
    const call = this.scopeCtrl.value === 'unread'
      ? this.notifications.unreadForUser(userId)
      : this.notifications.forUser(userId);
    call.subscribe({
      next: (rows) => {
        this.items.set(rows ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not load this feed. Please try again.');
        this.loading.set(false);
      },
    });
  }

  markRead(n: NotificationResponse): void {
    this.busyId.set(n.notificationId);
    this.notifications.markRead(n.notificationId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.ui.success('Marked as read.');
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  compose(): void {
    this.dialog.open(NotificationComposeDialogComponent, { width: '520px' }).afterClosed().subscribe((res) => {
      if (res && this.loaded() && res.userId === this.activeUser()) this.load();
    });
  }
}
