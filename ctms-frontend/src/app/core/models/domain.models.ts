/* ============================================================================
   Response/request DTO mirrors of com.ctms.dto.* used by the implemented
   features (Participant Portal + Admin User Management). Field names and
   nullability match the Java DTOs verbatim.
   ========================================================================== */

/* ---- Users / roles (Admin) ---------------------------------------------- */

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
  phone?: string;
  status?: string; // defaults to Active server-side when omitted
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface ChangeRoleRequest {
  roleId: number;
}

export interface ChangePasswordRequest {
  /** Required only when a user changes their OWN password; ignored for admin reset. */
  currentPassword?: string;
  newPassword: string;
}

export interface RoleResponse {
  roleId: number;
  roleName: string;
  description?: string;
  status: string;
  permissions?: string[];
}

/* ---- Participant-facing -------------------------------------------------- */

export interface PatientResponse {
  patientId: number;
  userId?: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  status: string;
  medicalHistoryDocumentName?: string;
  createdAt?: string;
}

/** PUT /api/portal/me — the only self-editable participant fields. */
export interface UpdateMyProfileRequest {
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
}

export interface TrialResponse {
  trialId: number;
  trialCode: string;
  trialName: string;
  phase: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  createdById?: number;
  createdAt?: string;
}

export interface EnrollmentResponse {
  enrollmentId: number;
  patientId: number;
  trialId: number;
  trialName?: string;
  trialCode?: string;
  trialStatus?: string;
  enrollmentDate?: string;
  status: string;
}

/** POST /api/portal/me/enrollments. */
export interface ApplyToTrialRequest {
  trialId: number;
}

export interface ConsentResponse {
  consentId: number;
  patientId: number;
  patientName?: string;
  trialId: number;
  trialName?: string;
  consentVersion?: string;
  consentDate?: string;
  consentStatus: string;
  filePath?: string;
  documentName?: string;
  documentSize?: number;
  uploadedBy?: string;
  uploadedDate?: string;
  signedDate?: string;
}

export interface VisitResponse {
  visitId: number;
  trialId: number;
  trialName?: string;
  patientId: number;
  patientName?: string;
  doctorId?: number;
  managerId?: number;
  visitNumber?: number;
  visitType?: string;
  scheduledDate?: string;
  windowStart?: string;
  windowEnd?: string;
  actualDate?: string;
  visitStatus: string;
  notes?: string;
}

export interface ParticipantVisitSummaryResponse {
  patientId: number;
  patientName: string;
  trialId: number;
  trialName: string;
  trialCode: string;
  enrollmentStatus: string;
  totalTrialVisits: number;
  completedVisits: number;
  remainingVisits: number;
  nextExpectedVisitNumber?: number;
  nextExpectedVisitDate?: string;
}

export interface TestResultResponse {
  resultId: number;
  visitId?: number;
  patientId: number;
  patientName?: string;
  visitDate?: string;
  doctorId?: number;
  doctorName?: string;
  trialId?: number;
  trialName?: string;
  trialCode?: string;
  testName: string;
  resultValue?: string;
  unit?: string;
  resultStatus: string;
  collectedDate?: string;
  createdAt?: string;
}

export interface PatientTestResultSummaryResponse {
  patientId: number;
  patientName: string;
  trialName?: string;
  latestResultDate?: string;
  totalResults: number;
  status?: string;
  eventType?: string;
  seriousAdverseEvent?: boolean;
  expectedEvent?: boolean;
  relatedToTrialDrug?: string;
  causalityAssessment?: string;
  outcome?: string;
  medicationGiven?: string;
  hospitalized?: boolean;
  hospitalName?: string;
  reportedToSponsor?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
  attachments?: string;
}

export interface UpdateAdverseEventStatusRequest {
  status: string;
}

export interface AdverseEventResponse {
  eventId: number;
  trialId: number;
  trialName?: string;
  patientId: number;
  reportedById?: number;
  eventDate?: string;
  severity: string;
  title?: string;
  description: string;
  symptoms?: string;
  startDate?: string;
  endDate?: string;
  actionsTaken?: string;
  requiresMedicalAttention?: boolean;
  eventType?: string;
  seriousAdverseEvent?: boolean;
  expectedEvent?: boolean;
  relatedToTrialDrug?: string;
  causalityAssessment?: string;
  outcome?: string;
  medicationGiven?: string;
  hospitalized?: boolean;
  hospitalName?: string;
  reportedToSponsor?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
  attachments?: string;
  status: string;
  createdAt?: string;
  createdByUserId?: number;
  createdByName?: string;
  createdByRole?: string;
  createdDate?: string;
}



export interface NotificationResponse {
  notificationId: number;
  userId: number;
  title?: string;
  message?: string;
  read: boolean;
  createdAt?: string;
}

/** GET /api/portal/me/dashboard (ParticipantDashboardResponse). */
export interface ParticipantDashboardResponse {
  patientId: number;
  fullName: string;
  accountStatus: string;
  totalEnrollments: number;
  pendingApplications: number;
  activeEnrollments: number;
  pendingConsents: number;
  totalVisits: number;
  unreadNotifications: number;
}

/* ============================================================================
   Staff-facing DTOs (Doctor / Clinical Manager / Trial Manager portals).
   Mirror com.ctms.dto.request.* and com.ctms.dto.response.* verbatim.
   ========================================================================== */

/* ---- Trials -------------------------------------------------------------- */

export interface CreateTrialRequest {
  trialCode: string;
  trialName: string;
  phase: string;        // I / II / III / IV
  description?: string;
  startDate: string;    // ISO date
  endDate?: string;
  status?: string;
}

export interface UpdateTrialRequest {
  trialCode?: string;
  trialName: string;
  phase: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

export interface TrialEnrollmentSummaryResponse {
  totalTarget: number;
  currentEnrollment: number;
  screeningParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  withdrawnParticipants: number;
  enrollmentPercentage: number;
}

export interface TrialVisitSummaryResponse {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  missedVisits: number;
  completionRate: number;
}

export interface TrialConsentSummaryResponse {
  totalConsents: number;
  signedConsents: number;
  pendingConsents: number;
  expiredConsents: number;
  complianceRate: number;
}

export interface TrialAdverseEventSummaryResponse {
  eventCount: number;
  seriousEvents: number;
  openEvents: number;
  closedEvents: number;
  adverseEventRate: number;
}

export interface TestResultSummaryResponse {
  totalTests: number;
  pendingResults: number;
  abnormalResults: number;
}

export interface TrialDetailsResponse {
  trialInformation: TrialResponse;
  enrollmentSummary: TrialEnrollmentSummaryResponse;
  visitSummary: TrialVisitSummaryResponse;
  consentSummary: TrialConsentSummaryResponse;
  adverseEventSummary: TrialAdverseEventSummaryResponse;
  testResultSummary: TestResultSummaryResponse;
  totalEnrolled: number;
  totalAdverseEvents: number;
  successRate: number;
}

/** POST /api/trials/{id}/assign-manager. role ∈ Manager/Coordinator/Monitor. */
export interface AssignManagerRequest {
  managerId: number;
  role: string;
}

export interface TrialAssignmentResponse {
  assignmentId: number;
  trialId: number;
  managerId: number;
  role: string;
  assignedDate?: string;
  status: string;
}

/* ---- Patients ------------------------------------------------------------ */

export interface CreatePatientRequest {
  userId?: number;
  firstName: string;
  lastName: string;
  dob: string;          // ISO date
  gender: string;       // Male / Female / Other
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  status?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  status?: string;
}

/* ---- Enrollments --------------------------------------------------------- */

export interface CreateEnrollmentRequest {
  patientId: number;
  trialId: number;
}

export interface UpdateEnrollmentStatusRequest {
  status: string;       // Screening / Enrolled / Completed / Withdrawn / Terminated
}

/* ---- Consents (Clinical Manager) ---------------------------------------- */

export interface CreateConsentRequest {
  patientId: number;
  trialId: number;
  consentVersion?: string;
  consentDate?: string;
  consentStatus?: string;
  filePath?: string;
}

/* ---- Visits -------------------------------------------------------------- */

export interface CreateVisitRequest {
  trialId: number;
  patientId: number;
  doctorId?: number;
  managerId?: number;
  visitNumber: number;
  visitType: string;
  scheduledDate: string;   // ISO date
  windowStart?: string;
  windowEnd?: string;
  visitStatus?: string;
  notes?: string;
}

export interface CompleteVisitRequest {
  actualDate?: string;     // defaults to today server-side when omitted
}

export interface RescheduleVisitRequest {
  newDate: string;         // ISO date
}

/* ---- Test results (Doctor) ---------------------------------------------- */

export interface RecordTestResultRequest {
  visitId: number;
  patientId: number;
  doctorId: number;
  testName: string;
  resultValue?: string;
  unit?: string;
  resultStatus?: string;   // Normal / Abnormal / Critical / Inconclusive
  collectedDate?: string;
}

export interface UpdateTestResultStatusRequest {
  status: string;
}

/* ---- Adverse events ------------------------------------------------------ */

export interface ReportAdverseEventRequest {
  trialId: number;
  patientId: number;
  eventDate?: string;
  severity: string;        // Mild / Moderate / Severe / Life Threatening
  title?: string;
  description: string;
  symptoms?: string;
  startDate?: string;
  endDate?: string;
  actionsTaken?: string;
  requiresMedicalAttention?: boolean;
  eventType?: string;
  seriousAdverseEvent?: boolean;
  expectedEvent?: boolean;
  relatedToTrialDrug?: string;
  causalityAssessment?: string;
  outcome?: string;
  medicationGiven?: string;
  hospitalized?: boolean;
  hospitalName?: string;
  reportedToSponsor?: boolean;
  followUpRequired?: boolean;
  followUpDate?: string;
  attachments?: string;
  status?: string;
}

export interface UpdateAdverseEventStatusRequest {
  status: string;          // Reported / In Review / Resolved / Closed
}

/* ---- Directory (doctors / managers) ------------------------------------- */

export interface DoctorResponse {
  doctorId: number;
  userId?: number;
  doctorName: string;
  specialization?: string;
  licenseNo?: string;
  phone?: string;
  profileImage?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  address?: string;
  emergencyContact?: string;
  email?: string;
  status?: string;
  createdAt?: string;
}

export interface ManagerResponse {
  managerId: number;
  userId?: number;
  managerName: string;
  department?: string;
  phone?: string;
}

/* ---- Analytics & reports (insights) ------------------------------------- */

export interface AnalyticsResponse {
  analyticsId?: number;
  metricDate?: string;
  activeTrials: number;
  totalPatients: number;
  enrolledPatients: number;
  completionRate?: number;   // BigDecimal -> number (percentage)
  complianceRate?: number;
  pendingVisits: number;
  overdueVisits: number;
  generatedAt?: string;
}

export interface DashboardResponse {
  totalUsers: number;
  totalPatients: number;
  totalTrials: number;
  activeTrials: number;
  totalReports: number;
  latestSnapshot?: AnalyticsResponse;
}

export interface GenerateReportRequest {
  reportName: string;
  reportType: string;        // Recruitment / Safety / Performance / Compliance / Other
  trialId?: number;
}

export interface ReportResponse {
  reportId: number;
  trialId?: number;
  reportName: string;
  reportType: string;
  generatedById?: number;
  generatedDate?: string;
  filePath?: string;
}

/* ============================================================================
   Admin system administration DTOs (Audit Logs, Roles CRUD).
   Mirror com.ctms.dto.response.* / com.ctms.dto.request.* verbatim. These back
   the two ADMIN-only controllers (AuditLogController, RoleController write paths)
   that the security audit exposed over HTTP.
   ========================================================================== */

/** Read model for an audit-trail entry (com.ctms.dto.response.AuditLogResponse). */
export interface AuditLogResponse {
  logId: number;
  userId?: number;
  action?: string;
  module?: string;
  ipAddress?: string;
  createdAt?: string;
}



/**
 * Payload for POST /api/roles (com.ctms.dto.request.CreateRoleRequest).
 * NOTE: `permissionIds` is accepted server-side but does NOT drive authorization
 * in this system — access is enforced by role NAME via @PreAuthorize, not by the
 * (seeded-but-unqueried) permissions tables. We do not surface a permission
 * editor so the UI never implies otherwise.
 */
export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  status?: string; // defaults to Active server-side when omitted
  permissionIds?: number[];
}

/** Payload for PUT /api/roles/{id} (com.ctms.dto.request.UpdateRoleRequest). */
export interface UpdateRoleRequest {
  roleName: string;
  description?: string;
  status: string; // required (Active / Inactive)
  permissionIds?: number[];
}

/* ============================================================================
   Staff-directory and notification request DTOs. Back the Doctor Directory,
   Manager Directory and Notifications console. Reachable by an ADMIN login
   (ADMIN inherits TRIAL_MANAGER / CLINICAL_MANAGER / DOCTOR / PARTICIPANT via
   the backend RoleHierarchy, so admins satisfy the read/send gates as well).
   ========================================================================== */

/** POST /api/doctors (com.ctms.dto.request.CreateDoctorRequest). */
export interface CreateDoctorRequest {
  userId: number;          // required — links the doctor to a user account
  doctorName: string;      // required
  specialization?: string;
  licenseNo?: string;
  phone?: string;
  profileImage?: string;
}

/** PUT /api/doctors/{id} (com.ctms.dto.request.UpdateDoctorRequest). */
export interface UpdateDoctorRequest {
  doctorName: string;      // required
  specialization?: string;
  licenseNo?: string;
  phone?: string;
  profileImage?: string;
}

/** POST /api/managers (com.ctms.dto.request.CreateManagerRequest). */
export interface CreateManagerRequest {
  userId: number;          // required — links the manager to a user account
  managerName: string;     // required
  department?: string;
  phone?: string;
}

/** PUT /api/managers/{id} (com.ctms.dto.request.UpdateManagerRequest). */
export interface UpdateManagerRequest {
  managerName: string;     // required
  department?: string;
  phone?: string;
}

/** POST /api/notifications (com.ctms.dto.request.CreateNotificationRequest). */
export interface CreateNotificationRequest {
  userId: number;          // required — recipient
  title: string;           // required
  message?: string;
}

export interface ParticipantReportAdverseEventRequest {
  trialId: number;
  eventDate?: string;
  severity: string;
  title?: string;
  description: string;
  symptoms?: string;
  startDate?: string;
  endDate?: string;
  actionsTaken?: string;
  requiresMedicalAttention?: boolean;
  attachments?: string;
}