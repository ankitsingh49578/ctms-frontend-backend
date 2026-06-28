import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface SectionInfo {
  title: string;
  blurb: string;
  endpoints: string[];
}

const SECTIONS: Record<string, SectionInfo> = {
  doctor: {
    title: 'Doctor Portal',
    blurb: 'Assigned participants, visit completion, clinical test results and adverse-event review.',
    endpoints: [
      'GET  /api/visits/doctor/{doctorId}',
      'PUT  /api/visits/{id}/complete',
      'GET  /api/test-results/patient/{patientId}',
      'POST /api/test-results',
      'PUT  /api/test-results/{id}/status',
      'POST /api/adverse-events',
    ],
  },
  'clinical-manager': {
    title: 'Clinical Manager Portal',
    blurb: 'Enrollment, consent lifecycle, visit oversight and document management.',
    endpoints: [
      'POST /api/enrollments',
      'PUT  /api/enrollments/{id}/status',
      'POST /api/consents  ·  /api/consents/{id}/sign|decline|withdraw',
      'GET  /api/visits/trial/{trialId}',
    ],
  },
  'trial-manager': {
    title: 'Trial Manager Portal',
    blurb: 'Trial planning, manager assignment, progress tracking and analytics.',
    endpoints: [
      'POST /api/trials  ·  PUT /api/trials/{id}/status',
      'POST /api/trials/{id}/assign-manager',
      'GET  /api/trials/{id}/assignments',
      'GET  /api/analytics/dashboard  ·  /api/analytics/latest',
      'POST /api/reports/generate',
    ],
  },
  'study-coordinator': {
    title: 'Study Coordinator',
    blurb: 'Reserved role — defined in the RoleType enum but not seeded in the database.',
    endpoints: ['(No seeded account; role is unmapped at runtime.)'],
  },
};

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="page">
      <div class="card cs">
        <mat-icon class="cs__icon">construction</mat-icon>
        <h1 class="page__title">{{ info().title }}</h1>
        <p class="muted cs__blurb">{{ info().blurb }}</p>

        <div class="cs__panel">
          <div class="cs__panel-head">Backend endpoints this portal will use</div>
          <ul class="cs__list">
            @for (ep of info().endpoints; track ep) { <li><code>{{ ep }}</code></li> }
          </ul>
        </div>

        <p class="muted cs__foot">
          The authentication, routing, role-guarding and API layers are already in place — this
          portal is the next build milestone and follows the same pattern as the Participant and
          Admin areas.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .cs { max-width: 720px; margin: 24px auto; padding: 32px; }
    .cs__icon { font-size: 44px; width: 44px; height: 44px; color: var(--ctms-warn); }
    .cs__blurb { margin: 6px 0 18px; }
    .cs__panel { background: var(--ctms-bg); border: 1px solid var(--ctms-border); border-radius: 10px; padding: 14px 16px; }
    .cs__panel-head { font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; }
    .cs__list { margin: 0; padding-left: 18px; display: grid; gap: 4px; }
    .cs__list code { font-size: 0.8rem; }
    .cs__foot { margin: 18px 0 0; font-size: 0.86rem; }
  `],
})
export class ComingSoonComponent {
  /** Bound from the :section route param via withComponentInputBinding(). */
  @Input() set section(value: string) {
    this._section.set(value ?? '');
  }
  private readonly _section = signal('');

  readonly info = computed<SectionInfo>(
    () => SECTIONS[this._section()] ?? {
      title: 'Coming soon',
      blurb: 'This area is part of an upcoming milestone.',
      endpoints: [],
    },
  );
}
