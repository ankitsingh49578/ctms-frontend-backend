import { Routes } from '@angular/router';

/** Doctor portal (/doctor): visits, test results, adverse events, trial reference. */
export const DOCTOR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Doctor · Dashboard',
    loadComponent: () => import('./pages/dashboard.component').then((m) => m.DoctorDashboardComponent),
  },
  {
    path: 'profile',
    title: 'Doctor · Profile',
    loadComponent: () => import('./pages/doctor-profile.component').then((m) => m.DoctorProfileComponent),
  },
  {
    path: 'visits',
    title: 'Doctor · My visits',
    loadComponent: () => import('./pages/visits.component').then((m) => m.DoctorVisitsComponent),
  },
  {
    path: 'visits/:id',
    title: 'Doctor · Visit details',
    loadComponent: () => import('./pages/visit-details.component').then((m) => m.VisitDetailsComponent),
  },
  {
    path: 'test-results',
    title: 'Doctor · Test results',
    loadComponent: () => import('./pages/test-results.component').then((m) => m.DoctorTestResultsComponent),
  },
  {
    path: 'adverse-events',
    title: 'Doctor · Adverse events',
    loadComponent: () => import('./pages/adverse-events.component').then((m) => m.DoctorAdverseEventsComponent),
  },
  {
    path: 'trials',
    title: 'Doctor · Trials',
    loadComponent: () => import('./pages/trials.component').then((m) => m.DoctorTrialsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
