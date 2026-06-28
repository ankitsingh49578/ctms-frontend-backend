import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'prefix',
        loadChildren: () =>
          import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
      },
    ],
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // Authenticated shell (sidebar + topbar). Children are role-gated.
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'portal',
        canActivate: [roleGuard],
        data: { roles: ['PARTICIPANT'] },
        loadChildren: () =>
          import('./features/portal/portal.routes').then((m) => m.PORTAL_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'doctor',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR'] },
        loadChildren: () =>
          import('./features/doctor/doctor.routes').then((m) => m.DOCTOR_ROUTES),
      },
      {
        path: 'clinical',
        canActivate: [roleGuard],
        data: { roles: ['CLINICAL_MANAGER'] },
        loadChildren: () =>
          import('./features/clinical/clinical.routes').then((m) => m.CLINICAL_ROUTES),
      },
      {
        path: 'manager',
        canActivate: [roleGuard],
        data: { roles: ['TRIAL_MANAGER'] },
        loadChildren: () =>
          import('./features/manager/manager.routes').then((m) => m.MANAGER_ROUTES),
      },
      {
        path: 'coming-soon/:section',
        loadComponent: () =>
          import('./features/errors/coming-soon.component').then((m) => m.ComingSoonComponent),
      },
    ],
  },

  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/errors/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found.component').then((m) => m.NotFoundComponent),
  },
];
