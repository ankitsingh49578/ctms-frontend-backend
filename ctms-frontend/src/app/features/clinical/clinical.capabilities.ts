import { RoleKey } from '../../core/constants/roles';

/**
 * Capability flags for the shared clinical screens. These encode the backend's
 * @PreAuthorize rules so a single component can serve Clinical Manager and
 * Trial Manager while only showing actions the signed-in role can actually
 * perform. Read access to the management screens themselves is granted to both
 * manager roles; the differences are all in the write actions.
 *
 *   Clinical Manager — full operational control incl. consents, visit
 *     completion and adverse-event reporting.
 *   Trial Manager   — trial/patient/visit setup, manager assignment, analytics
 *     and reports; adverse events are read-only oversight and consents are not
 *     theirs to manage.
 */
export interface ClinicalCapabilities {
  manageTrials: boolean;        // create / edit / change status
  assignManagers: boolean;      // POST /trials/{id}/assign-manager
  viewAssignments: boolean;     // GET /trials/{id}/assignments (TM, or trial's manager)
  managePatients: boolean;      // create / edit / verify
  manageEnrollments: boolean;   // enroll + status
  scheduleVisits: boolean;      // schedule / reschedule / cancel
  completeVisits: boolean;      // complete / mark-missed (CM here; doctors elsewhere)
  manageConsents: boolean;      // CM only
  reportAdverseEvents: boolean; // report + update status (CM here; doctors elsewhere)
  generateReports: boolean;     // generate (both manager roles)
  deleteTrials: boolean;        // CM only
}

export function capabilitiesFor(role: RoleKey | null): ClinicalCapabilities {
  const isCM = role === 'CLINICAL_MANAGER';
  const isTM = role === 'TRIAL_MANAGER';
  const isManager = isCM || isTM;
  return {
    manageTrials: isCM,
    assignManagers: isManager,
    viewAssignments: isManager,
    managePatients: isCM,
    manageEnrollments: isCM,
    scheduleVisits: isCM,
    completeVisits: isCM,
    manageConsents: isCM,
    reportAdverseEvents: isCM,
    generateReports: isManager,
    deleteTrials: isCM,
  };
}
