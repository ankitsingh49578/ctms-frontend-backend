import { Routes } from '@angular/router';

/**
 * Clinical Manager portal (/clinical). Uses the shared, capability-aware
 * clinical components; the signed-in role unlocks the CM-specific actions
 * (consents, visit completion, adverse-event reporting).
 */
export const CLINICAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Clinical Manager · Dashboard',
    loadComponent: () => import('../clinical/pages/dashboard.component').then((m) => m.ClinicalDashboardComponent),
  },
  {
    path: 'trials',
    title: 'Clinical Manager · Trials',
    loadComponent: () => import('../clinical/pages/trials.component').then((m) => m.TrialsManagementComponent),
  },
  {
    path: 'trials/:id',
    title: 'Clinical Manager · Trial Details',
    loadComponent: () => import('../clinical/pages/trial-details.component').then((m) => m.TrialDetailsComponent),
  },
  {
    path: 'patients',
    title: 'Clinical Manager · Patients',
    loadComponent: () => import('../clinical/pages/patients.component').then((m) => m.PatientsManagementComponent),
  },
  {
    path: 'patients/:patientId',
    title: 'Clinical Manager · Patient Details',
    loadComponent: () => import('../clinical/pages/patient-details.component').then((m) => m.PatientDetailsComponent),
  },
  {
    path: 'consents',
    title: 'Clinical Manager · Consents',
    loadComponent: () => import('../clinical/pages/consents.component').then((m) => m.ConsentsManagementComponent),
  },
  {
    path: 'visits',
    title: 'Clinical Manager · Visits',
    loadComponent: () => import('../clinical/pages/visits.component').then((m) => m.VisitsManagementComponent),
  },
  {
    path: 'adverse-events',
    title: 'Clinical Manager · Adverse events',
    loadComponent: () => import('../clinical/pages/adverse-events.component').then((m) => m.AdverseEventsManagementComponent),
  },
  {
    path: 'reports',
    title: 'Clinical Manager · Reports',
    loadComponent: () => import('../clinical/pages/reports.component').then((m) => m.ReportsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
