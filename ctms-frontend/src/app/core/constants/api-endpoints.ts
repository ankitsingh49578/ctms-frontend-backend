/**
 * Central registry of backend endpoints. Paths are relative; the ApiService
 * prefixes environment.apiBaseUrl. Builders cover the full API surface (19
 * controllers / 118 endpoints) for reference and future features; the ones
 * marked [IMPLEMENTED] are wired into a UI in this build.
 */
export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',            // [IMPLEMENTED] POST (public)
    register: '/api/auth/register',      // [IMPLEMENTED] POST (public)
    logout: '/api/auth/logout',          // [IMPLEMENTED] POST
    me: '/api/auth/me',                  // [IMPLEMENTED] GET
  },

  /** Participant self-service — [IMPLEMENTED] in full. */
  portal: {
    me: '/api/portal/me',                          // GET, PUT
    password: '/api/portal/me/password',           // PUT
    dashboard: '/api/portal/me/dashboard',         // GET
    trials: '/api/portal/trials',                  // GET (paged)
    trial: (id: number) => `/api/portal/trials/${id}`,
    enrollments: '/api/portal/me/enrollments',     // GET, POST
    enrollment: (id: number) => `/api/portal/me/enrollments/${id}`, // DELETE
    consents: '/api/portal/me/consents',           // GET
    signConsent: (id: number) => `/api/portal/me/consents/${id}/sign`,
    declineConsent: (id: number) => `/api/portal/me/consents/${id}/decline`,
    consentDocument: (id: number) => `/api/portal/me/consents/${id}/document`,
    visits: '/api/portal/me/visits',               // GET (paged)
    testResults: '/api/portal/me/test-results',    // GET
    adverseEvents: '/api/portal/adverse-events',
    adverseEvent: (id: number) => `/api/portal/adverse-events/${id}`,
    notifications: '/api/portal/me/notifications', // GET (paged)
    unreadNotifications: '/api/portal/me/notifications/unread', // GET
    markNotificationRead: (id: number) => `/api/portal/me/notifications/${id}/read`,
  },

  /** Admin user management — [IMPLEMENTED] in full. */
  users: {
    list: '/api/users',                  // GET (paged), POST (create)
    search: '/api/users/search',         // GET (paged) ?keyword
    count: '/api/users/count',           // GET
    byId: (id: number) => `/api/users/${id}`,                 // GET, PUT, DELETE
    changePassword: (id: number) => `/api/users/${id}/change-password`, // POST
    changeRole: (id: number) => `/api/users/${id}/change-role`,         // POST
    enable: (id: number) => `/api/users/${id}/enable`,        // POST
    disable: (id: number) => `/api/users/${id}/disable`,      // POST
  },

  /** Roles — read paths [IMPLEMENTED] (role dropdown); writes available for future admin UI. */
  roles: {
    list: '/api/roles',                  // GET (paged), POST
    search: '/api/roles/search',
    count: '/api/roles/count',
    byName: '/api/roles/by-name',        // GET ?name
    exists: '/api/roles/exists',
    byId: (id: number) => `/api/roles/${id}`,
  },

  /* ---- Available for the next milestones (Doctor / Clinical Mgr / Trial Mgr) ---- */
  trials: {
    list: '/api/trials', search: '/api/trials/search', count: '/api/trials/count',
    byId: (id: number) => `/api/trials/${id}`,
    details: (id: number) => `/api/trials/${id}/details`,
    status: (id: number) => `/api/trials/${id}/status`,
    assignManager: (id: number) => `/api/trials/${id}/assign-manager`,
    assignments: (id: number) => `/api/trials/${id}/assignments`,
  },
  patients: {
    list: '/api/patients', search: '/api/patients/search', count: '/api/patients/count',
    byId: (id: number) => `/api/patients/${id}`,
    verify: (id: number) => `/api/patients/${id}/verify`,
    enrollments: (id: number) => `/api/patients/${id}/enrollments`,
    visitSummary: (id: number) => `/api/patients/${id}/visit-summary`,
  },
  enrollments: {
    create: '/api/enrollments',
    byId: (id: number) => `/api/enrollments/${id}`,
    byTrial: (id: number) => `/api/enrollments/trial/${id}`,
    status: (id: number) => `/api/enrollments/${id}/status`,
  },
  consents: {
    create: '/api/consents',
    byId: (id: number) => `/api/consents/${id}`,
    sign: (id: number) => `/api/consents/${id}/sign`,
    decline: (id: number) => `/api/consents/${id}/decline`,
    withdraw: (id: number) => `/api/consents/${id}/withdraw`,
    byPatient: (id: number) => `/api/consents/patient/${id}`,
    byTrial: (id: number) => `/api/consents/trial/${id}`,
    document: (id: number) => `/api/consents/${id}/document`,
  },
  visits: {
    create: '/api/visits', count: '/api/visits/count', upcoming: '/api/visits/upcoming',
    byId: (id: number) => `/api/visits/${id}`,
    reschedule: (id: number) => `/api/visits/${id}/reschedule`,
    complete: (id: number) => `/api/visits/${id}/complete`,
    missed: (id: number) => `/api/visits/${id}/missed`,
    cancel: (id: number) => `/api/visits/${id}/cancel`,
    byPatient: (id: number) => `/api/visits/patient/${id}`,
    byTrial: (id: number) => `/api/visits/trial/${id}`,
    byDoctor: (id: number) => `/api/visits/doctor/${id}`,
  },
  testResults: {
    create: '/api/test-results', search: '/api/test-results/search', count: '/api/test-results/count',
    byId: (id: number) => `/api/test-results/${id}`,
    status: (id: number) => `/api/test-results/${id}/status`,
    byPatient: (id: number) => `/api/test-results/patient/${id}`,
    byVisit: (id: number) => `/api/test-results/visit/${id}`,
  },
  adverseEvents: {
    create: '/api/adverse-events', count: '/api/adverse-events/count',
    byId: (id: number) => `/api/adverse-events/${id}`,
    status: (id: number) => `/api/adverse-events/${id}/status`,
    byTrial: (id: number) => `/api/adverse-events/trial/${id}`,
    byPatient: (id: number) => `/api/adverse-events/patient/${id}`,
  },
  doctors: {
    list: '/api/doctors', search: '/api/doctors/search', count: '/api/doctors/count',
    byUser: (userId: number) => `/api/doctors/by-user/${userId}`,
    byId: (id: number) => `/api/doctors/${id}`,
  },
  managers: {
    list: '/api/managers', search: '/api/managers/search', count: '/api/managers/count',
    byUser: (userId: number) => `/api/managers/by-user/${userId}`,
    byId: (id: number) => `/api/managers/${id}`,
  },
  notifications: {
    create: '/api/notifications',
    byUser: (userId: number) => `/api/notifications/user/${userId}`,
    unreadByUser: (userId: number) => `/api/notifications/user/${userId}/unread`,
    markRead: (id: number) => `/api/notifications/${id}/read`,
  },
  analytics: {
    snapshot: '/api/analytics/snapshot', latest: '/api/analytics/latest', dashboard: '/api/analytics/dashboard',
  },
  reports: { list: '/api/reports', generate: '/api/reports/generate' },
  auditLogs: { list: '/api/audit-logs', byUser: (userId: number) => `/api/audit-logs/user/${userId}` },
} as const;
