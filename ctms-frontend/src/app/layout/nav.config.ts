import { RoleKey } from '../core/constants/roles';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

/** Sidebar navigation per role. Only roles with a built UI are listed here. */
export const NAV_BY_ROLE: Partial<Record<RoleKey, NavItem[]>> = {
  PARTICIPANT: [
    { label: 'Dashboard', icon: 'dashboard', route: '/portal/dashboard' },
    { label: 'My Profile', icon: 'person', route: '/portal/profile' },
    { label: 'Browse Trials', icon: 'science', route: '/portal/trials' },
    { label: 'My Applications', icon: 'assignment_turned_in', route: '/portal/enrollments' },
    { label: 'Consent Forms', icon: 'fact_check', route: '/portal/consents' },
    { label: 'Visits', icon: 'event', route: '/portal/visits' },
    { label: 'Test Results', icon: 'biotech', route: '/portal/results' },
    { label: 'Adverse Events', icon: 'report_problem', route: '/portal/adverse-events' },
    { label: 'Notifications', icon: 'notifications', route: '/portal/notifications' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'User Management', icon: 'manage_accounts', route: '/admin/users' },
    { label: 'Roles & Access', icon: 'admin_panel_settings', route: '/admin/roles' },
    { label: 'Doctor Directory', icon: 'stethoscope', route: '/admin/doctors' },
    { label: 'Manager Directory', icon: 'badge', route: '/admin/managers' },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Audit Trail', icon: 'history', route: '/admin/audit-logs' }
  ],
  SUPER_ADMIN: [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'User Management', icon: 'manage_accounts', route: '/admin/users' },
    { label: 'Roles & Access', icon: 'admin_panel_settings', route: '/admin/roles' },
    { label: 'Doctor Directory', icon: 'stethoscope', route: '/admin/doctors' },
    { label: 'Manager Directory', icon: 'badge', route: '/admin/managers' },
    { label: 'Notifications', icon: 'notifications', route: '/admin/notifications' },
    { label: 'Audit Trail', icon: 'history', route: '/admin/audit-logs' }
  ],
  DOCTOR: [
    { label: 'Dashboard', icon: 'dashboard', route: '/doctor/dashboard' },
    { label: 'My Profile', icon: 'person', route: '/doctor/profile' },
    { label: 'My Visits', icon: 'event', route: '/doctor/visits' },
    { label: 'Test Results', icon: 'biotech', route: '/doctor/test-results' },
    { label: 'Adverse Events', icon: 'health_and_safety', route: '/doctor/adverse-events' },
    { label: 'Trials', icon: 'science', route: '/doctor/trials' },
  ],
  CLINICAL_MANAGER: [
    { label: 'Dashboard', icon: 'dashboard', route: '/clinical/dashboard' },
    { label: 'Trials', icon: 'science', route: '/clinical/trials' },
    { label: 'Patients', icon: 'groups', route: '/clinical/patients' },
    { label: 'Consents', icon: 'fact_check', route: '/clinical/consents' },
    { label: 'Visits', icon: 'event', route: '/clinical/visits' },
    { label: 'Adverse Events', icon: 'health_and_safety', route: '/clinical/adverse-events' },
    { label: 'Reports', icon: 'summarize', route: '/clinical/reports' },
  ],
  TRIAL_MANAGER: [
    { label: 'Dashboard', icon: 'dashboard', route: '/manager/dashboard' },
    { label: 'Trials', icon: 'science', route: '/manager/trials' },
    { label: 'Patients', icon: 'groups', route: '/manager/patients' },
    { label: 'Visits', icon: 'event', route: '/manager/visits' },
    { label: 'Reports', icon: 'summarize', route: '/manager/reports' },
  ],
};
