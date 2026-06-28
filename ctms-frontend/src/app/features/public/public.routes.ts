import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    title: 'Home · CTMS',
    loadComponent: () =>
      import('./pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    title: 'About Us · CTMS',
    loadComponent: () =>
      import('./pages/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'trials',
    title: 'Clinical Trials · CTMS',
    loadComponent: () =>
      import('./pages/trials.component').then((m) => m.PublicTrialsComponent),
  },
  {
    path: 'contact',
    title: 'Contact Us · CTMS',
    loadComponent: () =>
      import('./pages/contact.component').then((m) => m.ContactComponent),
  },
];
