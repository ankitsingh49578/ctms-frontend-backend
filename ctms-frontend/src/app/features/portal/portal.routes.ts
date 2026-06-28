import { Routes } from '@angular/router';

/**
 * Participant self-service routes (mounted at /portal behind authGuard +
 * roleGuard[PARTICIPANT]). Each page is a standalone, lazily-loaded component
 * backed by PortalService -> /api/portal/**.
 */
export const PORTAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard · CTMS',
    loadComponent: () =>
      import('./pages/dashboard.component').then((m) => m.PortalDashboardComponent),
  },
  {
    path: 'profile',
    title: 'My Profile · CTMS',
    loadComponent: () =>
      import('./pages/profile.component').then((m) => m.PortalProfileComponent),
  },
  {
    path: 'trials',
    title: 'Browse Trials · CTMS',
    loadComponent: () =>
      import('./pages/trials.component').then((m) => m.PortalTrialsComponent),
  },
  {
    path: 'trials/:id',
    title: 'Trial Details · CTMS',
    loadComponent: () =>
      import('./pages/trial-detail.component').then((m) => m.PortalTrialDetailComponent),
  },
  {
    path: 'enrollments',
    title: 'My Applications · CTMS',
    loadComponent: () =>
      import('./pages/enrollments.component').then((m) => m.PortalEnrollmentsComponent),
  },
  {
    path: 'consents',
    title: 'Consent Forms · CTMS',
    loadComponent: () =>
      import('./pages/consents.component').then((m) => m.PortalConsentsComponent),
  },
  {
    path: 'visits',
    title: 'My Visits · CTMS',
    loadComponent: () =>
      import('./pages/visits.component').then((m) => m.PortalVisitsComponent),
  },
  {
    path: 'results',
    title: 'Test Results · CTMS',
    loadComponent: () =>
      import('./pages/results.component').then((m) => m.PortalResultsComponent),
  },
  {
    path: 'adverse-events',
    title: 'Adverse Events · CTMS',
    loadComponent: () =>
      import('./pages/adverse-events.component').then((m) => m.PortalAdverseEventsComponent),
  },
  {
    path: 'adverse-events/new',
    title: 'Report Adverse Event · CTMS',
    loadComponent: () =>
      import('./pages/adverse-event-report.component').then((m) => m.PortalAdverseEventReportComponent),
  },
  {
    path: 'adverse-events/:id',
    title: 'Adverse Event Details · CTMS',
    loadComponent: () =>
      import('./pages/adverse-event-detail.component').then((m) => m.PortalAdverseEventDetailComponent),
  },

  {
    path: 'notifications',
    title: 'Notifications · CTMS',
    loadComponent: () =>
      import('./pages/notifications.component').then((m) => m.PortalNotificationsComponent),
  },
];
