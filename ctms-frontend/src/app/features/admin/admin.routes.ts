import { Routes } from '@angular/router';

/**
 * Admin routes (mounted at /admin behind authGuard + roleGuard[ADMIN,
 * SUPER_ADMIN]). User management is backed by UserController; Roles, Audit Logs
 * and Settings are backed by the ADMIN-only RoleController / AuditLogController
 */
export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Admin Dashboard · CTMS',
    loadComponent: () =>
      import('./pages/dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    title: 'User Management · CTMS',
    loadComponent: () =>
      import('./pages/user-list.component').then((m) => m.AdminUserListComponent),
  },
  {
    path: 'roles',
    title: 'Roles & Access · CTMS',
    loadComponent: () =>
      import('./pages/roles.component').then((m) => m.AdminRolesComponent),
  },
  {
    path: 'audit-logs',
    title: 'Audit Trail · CTMS',
    loadComponent: () =>
      import('./pages/audit-logs.component').then((m) => m.AdminAuditLogsComponent),
  },

  {
    path: 'doctors',
    title: 'Doctor Directory · CTMS',
    loadComponent: () =>
      import('./pages/doctors.component').then((m) => m.AdminDoctorsComponent),
  },
  {
    path: 'managers',
    title: 'Manager Directory · CTMS',
    loadComponent: () =>
      import('./pages/managers.component').then((m) => m.AdminManagersComponent),
  },
  {
    path: 'notifications',
    title: 'Notifications · CTMS',
    loadComponent: () =>
      import('./pages/notifications.component').then((m) => m.AdminNotificationsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
