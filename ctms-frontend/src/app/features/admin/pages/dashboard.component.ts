import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserAdminService } from '../services/user-admin.service';
import { RoleService } from '../services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleResponse } from '../../../core/models/domain.models';

interface AdminLink {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'ctms-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  template: `
    <section class="page">
      <div class="hero">
        <h1>Administration</h1>
        <p>Accounts, roles, the audit trail and system configuration in one place.</p>
        <div class="hero__icon"><mat-icon>shield_person</mat-icon></div>
      </div>

      @if (loading()) {
        <div class="state"><mat-spinner diameter="36" /><p>Loading…</p></div>
      } @else {
        <div class="grid grid--stats">
          <div class="stat stat--accent">
            <div class="stat__icon"><mat-icon>group</mat-icon></div>
            <div class="stat__value">{{ userCount() }}</div>
            <div class="stat__label">Total users</div>
          </div>
          <div class="stat stat--accent">
            <div class="stat__icon"><mat-icon>badge</mat-icon></div>
            <div class="stat__value">{{ roles().length }}</div>
            <div class="stat__label">Roles configured</div>
          </div>
        </div>

        <h3 class="section-title" style="margin-top:24px"><mat-icon>apps</mat-icon>Manage</h3>
        <div class="grid grid--cards">
          @for (l of links; track l.route) {
            <a class="stat stat--accent stat--link" [routerLink]="l.route" style="text-decoration:none;color:inherit">
              <div class="stat__icon"><mat-icon>{{ l.icon }}</mat-icon></div>
              <div style="font-weight:650">{{ l.label }}</div>
              <div class="stat__label">{{ l.description }}</div>
              <span class="stat__hint" style="margin-top:6px">Open<mat-icon style="font-size:16px;width:16px;height:16px">arrow_forward</mat-icon></span>
            </a>
          }
        </div>

        @if (roles().length) {
          <div class="card" style="margin-top:24px">
            <h3 class="section-title"><mat-icon>verified_user</mat-icon>Role catalogue</h3>
            <div class="row-actions" style="flex-wrap:wrap;gap:8px">
              @for (r of roles(); track r.roleId) {
                <span class="chip chip--neutral">{{ r.roleName }}</span>
              }
            </div>
            <p class="muted" style="margin:12px 0 0;font-size:.82rem">
              Access across the API is granted by role name. Manage the catalogue under Roles &amp; Access.
            </p>
          </div>
        }
      }
    </section>
  `,
})
export class AdminDashboardComponent {
  private readonly users = inject(UserAdminService);
  private readonly roleSvc = inject(RoleService);
  protected readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly userCount = signal(0);
  readonly roles = signal<RoleResponse[]>([]);

  readonly links: AdminLink[] = [
    { label: 'User Management', description: 'Accounts, roles, passwords, access', icon: 'manage_accounts', route: '/admin/users' },
    { label: 'Roles & Access', description: 'The role catalogue the API authorizes against', icon: 'admin_panel_settings', route: '/admin/roles' },
    { label: 'Doctor Directory', description: 'Clinical-staff records referenced by visits & results', icon: 'stethoscope', route: '/admin/doctors' },
    { label: 'Manager Directory', description: 'Clinical and trial management staff records', icon: 'badge', route: '/admin/managers' },
    { label: 'Notifications', description: 'Send and inspect user notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Audit Trail', description: 'System-wide activity recorded by the backend', icon: 'history', route: '/admin/audit-logs' }
  ];

  constructor() {
    forkJoin({
      count: this.users.count(),
      roles: this.roleSvc.listAll(),
    }).subscribe({
      next: ({ count, roles }) => {
        this.userCount.set(count);
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
