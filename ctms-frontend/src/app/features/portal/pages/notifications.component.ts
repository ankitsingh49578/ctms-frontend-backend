import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PortalService } from '../services/portal.service';
import { UiService } from '../../../core/services/ui.service';
import { Page } from '../../../core/models/api.models';
import { NotificationResponse } from '../../../core/models/domain.models';

@Component({
  selector: 'ctms-portal-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatProgressSpinnerModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatButtonToggleModule,
  ],
  template: `
    <section class="page">
      <header class="page__head">
        <div>
          <h1 class="page__title">Notifications</h1>
          <p class="page__subtitle">
            @if (unreadCount() > 0) { You have {{ unreadCount() }} unread. }
            @else { You're all caught up. }
          </p>
        </div>
        <mat-button-toggle-group [value]="filter()" (change)="setFilter($event.value)" hideSingleSelectionIndicator>
          <mat-button-toggle value="all">All</mat-button-toggle>
          <mat-button-toggle value="unread">Unread</mat-button-toggle>
        </mat-button-toggle-group>
      </header>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading notifications…</p></div>
      } @else if (error()) {
        <div class="state">
          <mat-icon>error_outline</mat-icon><p>{{ error() }}</p>
          <button mat-stroked-button (click)="reload()">Retry</button>
        </div>
      } @else if (!items().length) {
        <div class="state">
          <mat-icon>notifications_none</mat-icon>
          <p>{{ filter() === 'unread' ? 'No unread notifications.' : 'No notifications yet.' }}</p>
        </div>
      } @else {
        <div class="grid" style="grid-template-columns:minmax(0,1fr);gap:10px">
          @for (n of items(); track n.notificationId) {
            <div class="card" [style.borderLeft]="n.read ? null : '3px solid var(--ctms-primary)'"
                 style="display:flex;gap:14px;align-items:flex-start;padding:16px 18px">
              <mat-icon [style.color]="n.read ? 'var(--ctms-ink-soft)' : 'var(--ctms-primary)'">
                {{ n.read ? 'mark_email_read' : 'mark_email_unread' }}
              </mat-icon>
              <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline">
                  <strong>{{ n.title || 'Notification' }}</strong>
                  <span class="muted" style="font-size:.76rem;white-space:nowrap">
                    {{ n.createdAt ? (n.createdAt | date:'medium') : '' }}
                  </span>
                </div>
                @if (n.message) { <p style="margin:6px 0 0;line-height:1.5">{{ n.message }}</p> }
              </div>
              @if (!n.read) {
                <button mat-button [disabled]="busyId() === n.notificationId" (click)="markRead(n)">
                  @if (busyId() === n.notificationId) { <mat-spinner diameter="16" /> } @else { Mark read }
                </button>
              }
            </div>
          }
        </div>

        @if (filter() === 'all') {
          <mat-paginator
            [length]="page().totalElements"
            [pageSize]="page().size || size"
            [pageIndex]="page().number"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPage($event)" />
        }
      }
    </section>
  `,
})
export class PortalNotificationsComponent {
  private readonly portal = inject(PortalService);
  private readonly ui = inject(UiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal<'all' | 'unread'>('all');
  readonly busyId = signal<number | null>(null);
  readonly unreadCount = signal(0);

  readonly items = signal<NotificationResponse[]>([]);
  readonly page = signal<Page<NotificationResponse>>({
    content: [], totalElements: 0, totalPages: 0, number: 0, size: 10,
    first: true, last: true, numberOfElements: 0, empty: true,
  });

  pageIndex = 0;
  size = 10;

  constructor() {
    this.refreshUnreadCount();
    this.reload();
  }

  setFilter(value: 'all' | 'unread'): void {
    this.filter.set(value);
    this.pageIndex = 0;
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    if (this.filter() === 'unread') {
      this.portal.myUnreadNotifications().subscribe({
        next: (list) => {
          this.items.set(list);
          this.loading.set(false);
        },
        error: () => this.fail(),
      });
    } else {
      this.portal.myNotifications({ page: this.pageIndex, size: this.size, sort: 'createdAt,desc' }).subscribe({
        next: (p) => {
          this.page.set(p);
          this.items.set(p.content);
          this.loading.set(false);
        },
        error: () => this.fail(),
      });
    }
  }

  private fail(): void {
    this.error.set('We could not load your notifications. Please try again.');
    this.loading.set(false);
  }

  private refreshUnreadCount(): void {
    this.portal.myUnreadNotifications().subscribe({
      next: (list) => this.unreadCount.set(list.length),
      error: () => {},
    });
  }

  onPage(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.size = e.pageSize;
    this.reload();
  }

  markRead(n: NotificationResponse): void {
    this.busyId.set(n.notificationId);
    this.portal.markNotificationRead(n.notificationId).subscribe({
      next: () => {
        this.busyId.set(null);
        this.ui.success('Marked as read.');
        this.refreshUnreadCount();
        this.reload();
      },
      error: () => this.busyId.set(null),
    });
  }
}
