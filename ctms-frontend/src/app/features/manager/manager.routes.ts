import { Routes } from '@angular/router';

/**
 * Trial Manager portal (/manager). Reuses the shared clinical components; the
 * TM role unlocks trial setup, assignments, analytics and reports while adverse
 * events are read-only oversight and consents are not theirs to manage.
 */
export const MANAGER_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Trial Manager · Dashboard',
    loadComponent: () => import('../clinical/pages/dashboard.component').then((m) => m.ClinicalDashboardComponent),
  },
  {
    path: 'trials',
    title: 'Trial Manager · Trials',
    loadComponent: () => import('../clinical/pages/trials.component').then((m) => m.TrialsManagementComponent),
  },
  {
    path: 'trials/:id',
    title: 'Trial Manager · Trial Details',
    loadComponent: () => import('../clinical/pages/trial-details.component').then((m) => m.TrialDetailsComponent),
  },
  {
    path: 'patients',
    title: 'Trial Manager · Patients',
    loadComponent: () => import('../clinical/pages/patients.component').then((m) => m.PatientsManagementComponent),
  },
  {
    path: 'patients/:patientId',
    title: 'Trial Manager · Patient Details',
    loadComponent: () => import('../clinical/pages/patient-details.component').then((m) => m.PatientDetailsComponent),
  },
  {
    path: 'visits',
    title: 'Trial Manager · Visits',
    loadComponent: () => import('../clinical/pages/visits.component').then((m) => m.VisitsManagementComponent),
  },
  {
    path: 'reports',
    title: 'Trial Manager · Reports',
    loadComponent: () => import('../clinical/pages/reports.component').then((m) => m.ReportsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
