/**
 * Canonical role keys. These mirror the Java RoleType enum NAMES and the
 * Spring Security authorities (ROLE_<KEY>). Note the deliberate mismatch the
 * backend carries: the DB role_name "Manager" maps to the TRIAL_MANAGER key.
 */
export type RoleKey =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DOCTOR'
  | 'PARTICIPANT'
  | 'CLINICAL_MANAGER'
  | 'TRIAL_MANAGER'
  | 'STUDY_COORDINATOR';

/**
 * DB role_name (as returned in AuthResponse.role / UserResponse.roleName) to
 * canonical key. Mirrors RoleType.dbName() exactly. Comparison is
 * case-insensitive and trimmed.
 */
const DB_NAME_TO_KEY: Record<string, RoleKey> = {
  'super admin': 'SUPER_ADMIN',
  'admin': 'ADMIN',
  'doctor': 'DOCTOR',
  'participant': 'PARTICIPANT',
  'clinical manager': 'CLINICAL_MANAGER',
  'manager': 'TRIAL_MANAGER',
  'study coordinator': 'STUDY_COORDINATOR',
};

export function roleKeyFromName(roleName: string | null | undefined): RoleKey | null {
  if (!roleName) return null;
  return DB_NAME_TO_KEY[roleName.trim().toLowerCase()] ?? null;
}

export const ROLE_LABELS: Record<RoleKey, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  DOCTOR: 'Doctor',
  PARTICIPANT: 'Participant',
  CLINICAL_MANAGER: 'Clinical Manager',
  TRIAL_MANAGER: 'Trial Manager',
  STUDY_COORDINATOR: 'Study Coordinator',
};

/** Where each role lands after login. */
export function defaultRouteForRole(role: RoleKey | null): string {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin/dashboard';
    case 'PARTICIPANT':
      return '/portal/dashboard';
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'CLINICAL_MANAGER':
      return '/clinical/dashboard';
    case 'TRIAL_MANAGER':
      return '/manager/dashboard';
    case 'STUDY_COORDINATOR':
      return '/coming-soon/study-coordinator';
    default:
      return '/login';
  }
}
