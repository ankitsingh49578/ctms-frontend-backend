/**
 * Enum string values EXACTLY as stored/emitted by the backend (the Java enums'
 * dbValue, e.g. VisitStatus.SCHEDULED -> "Scheduled"). These are the literal
 * strings that appear in response payloads and that write endpoints expect.
 */

export const USER_STATUSES = ['Active', 'Inactive'] as const;
export const TRIAL_STATUSES = ['Planned', 'Active', 'Completed', 'On Hold', 'Terminated'] as const;
export const TRIAL_PHASES = ['I', 'II', 'III', 'IV'] as const;
export const ENROLLMENT_STATUSES = ['Screening', 'Enrolled', 'Completed', 'Withdrawn', 'Terminated'] as const;
export const CONSENT_STATUSES = ['Pending', 'Signed', 'Declined', 'Withdrawn'] as const;
export const VISIT_STATUSES = ['Scheduled', 'Completed', 'Missed', 'Cancelled', 'Rescheduled'] as const;
export const TEST_RESULT_STATUSES = ['Normal', 'Abnormal', 'Critical', 'Inconclusive'] as const;
export const ADVERSE_EVENT_STATUSES = ['Reported', 'In Review', 'Resolved', 'Closed'] as const;
export const SEVERITIES = ['Mild', 'Moderate', 'Severe', 'Life Threatening'] as const;
export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const REPORT_TYPES = ['Recruitment', 'Safety', 'Performance', 'Compliance', 'Other'] as const;
export const ASSIGNMENT_ROLES = ['Manager', 'Coordinator', 'Monitor'] as const;

export type ChipTone = 'success' | 'warn' | 'danger' | 'neutral';

/**
 * Maps a backend status string to a semantic chip tone for display. Unknown
 * values fall back to neutral so new server states never break the UI.
 */
export function statusTone(value: string | null | undefined): ChipTone {
  switch ((value ?? '').toLowerCase()) {
    case 'active':
    case 'enrolled':
    case 'signed':
    case 'completed':
    case 'normal':
    case 'resolved':
    case 'closed':
      return 'success';
    case 'pending':
    case 'screening':
    case 'scheduled':
    case 'rescheduled':
    case 'in review':
    case 'on hold':
    case 'planned':
    case 'abnormal':
    case 'inconclusive':
    case 'moderate':
    case 'reported':
      return 'warn';
    case 'declined':
    case 'withdrawn':
    case 'terminated':
    case 'missed':
    case 'cancelled':
    case 'inactive':
    case 'critical':
    case 'severe':
    case 'life threatening':
      return 'danger';
    default:
      return 'neutral';
  }
}
