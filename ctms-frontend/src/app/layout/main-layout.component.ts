import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../core/services/auth.service';
import { ROLE_LABELS } from '../core/constants/roles';
import { NAV_BY_ROLE, NavItem } from './nav.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatDividerModule,
  ],
  template: `
    <mat-sidenav-container
      class="shell"
      [class.role-doctor]="roleKey() === 'DOCTOR'"
      [class.role-clinical]="roleKey() === 'CLINICAL_MANAGER'"
      [class.role-manager]="roleKey() === 'TRIAL_MANAGER'"
      [class.role-admin]="roleKey() === 'ADMIN' || roleKey() === 'SUPER_ADMIN'"
    >
      <mat-sidenav
        class="shell__nav"
        [mode]="isHandset() ? 'over' : 'side'"
        [opened]="!isHandset()"
        #drawer
      >
        <div class="brand">
          <div class="brand__mark">CT</div>
          <div>
            <div class="brand__name">CTMS</div>
            <div class="brand__role">{{ roleLabel() }}</div>
          </div>
        </div>

        <mat-nav-list class="nav">
          @for (item of navItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="nav__link--active"
              (click)="isHandset() && drawer.close()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="shell__content">
        <mat-toolbar class="topbar">
          @if (isHandset()) {
            <button mat-icon-button aria-label="Menu" (click)="drawer.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="topbar__title">Clinical Trial Management</span>
          <span class="spacer"></span>

          <button mat-button [matMenuTriggerFor]="profile" class="topbar__profile">
            <mat-icon>account_circle</mat-icon>
            <span class="topbar__user">{{ username() }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #profile="matMenu">
            <div class="menu-head">
              <div class="menu-head__name">{{ username() }}</div>
              <div class="menu-head__meta">{{ email() }}</div>
              <div class="menu-head__meta">{{ roleLabel() }}</div>
            </div>
            <mat-divider />
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign out</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="outlet">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell { height: 100dvh; }
    .shell__nav {
      width: 256px;
      background: var(--ctms-sidebar);
      border-right: none;
      color: var(--ctms-sidebar-ink);
      /* Material 19 list items take their PRIMARY-TEXT colour from this MDC
         token, not from the inherited color property. Without it the labels
         fall back to the theme's dark on-surface ink and become invisible on
         the dark sidebar — the cause of the "sidebar text not visible" report. */
      --mdc-list-list-item-label-text-color: var(--ctms-sidebar-ink);
      --mdc-list-list-item-hover-label-text-color: var(--ctms-sidebar-ink-active);
      --mdc-list-list-item-focus-label-text-color: var(--ctms-sidebar-ink-active);
    }
    .brand {
      display: flex; align-items: center; gap: 12px;
      padding: 20px 18px 16px;
    }
    .brand__mark {
      width: 38px; height: 38px; border-radius: 10px;
      display: grid; place-items: center;
      background: var(--ctms-primary); color: #fff;
      font-weight: 700; font-family: Fraunces, serif; letter-spacing: 0.02em;
    }
    .brand__name { color: #fff; font-weight: 600; font-size: 1.05rem; }
    .brand__role { color: var(--ctms-sidebar-ink); font-size: 0.78rem; }

    .nav { padding: 4px 8px; }
    .nav a.mat-mdc-list-item {
      color: var(--ctms-sidebar-ink);
      border-radius: 9px;
      margin-bottom: 2px;
      --mat-list-list-item-leading-icon-color: var(--ctms-sidebar-ink);
    }
    .nav a.mat-mdc-list-item:hover { background: rgba(255, 255, 255, 0.06); }
    .nav a.nav__link--active {
      background: rgba(255, 255, 255, 0.12);
      color: var(--ctms-sidebar-ink-active);
      --mdc-list-list-item-label-text-color: var(--ctms-sidebar-ink-active);
      --mat-list-list-item-leading-icon-color: var(--ctms-sidebar-ink-active);
    }

    .shell__content { background: var(--ctms-bg); }
    .topbar {
      position: sticky; top: 0; z-index: 5;
      background: var(--ctms-surface);
      border-bottom: 1px solid var(--ctms-border);
      color: var(--ctms-ink);
      gap: 8px;
    }
    .topbar__title { font-weight: 600; font-size: 0.98rem; }
    .topbar__profile { color: var(--ctms-ink); }
    .topbar__user { margin: 0 2px; font-weight: 500; }

    .menu-head { padding: 10px 16px; }
    .menu-head__name { font-weight: 600; }
    .menu-head__meta { font-size: 0.8rem; color: var(--ctms-ink-soft); }

    .outlet { display: block; }

    @media (max-width: 599px) {
      .topbar__user { display: none; }
    }
  `],
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly breakpoints = inject(BreakpointObserver);

  readonly roleKey = this.auth.roleKey;

  readonly isHandset = toSignal(
    this.breakpoints.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).pipe(
      map((r) => r.matches),
    ),
    { initialValue: false },
  );

  readonly navItems = computed<NavItem[]>(() => {
    const key = this.auth.roleKey();
    return (key && NAV_BY_ROLE[key]) || [];
  });

  readonly username = computed(() => this.auth.user()?.username ?? 'User');
  readonly email = computed(() => this.auth.user()?.email ?? '');
  readonly roleLabel = computed(() => {
    const key = this.auth.roleKey();
    return key ? ROLE_LABELS[key] : 'Signed in';
  });

  logout(): void {
    this.auth.logout();
  }
}
