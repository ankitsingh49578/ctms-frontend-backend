package com.ctms.security;

import com.ctms.enums.RoleType;
import com.ctms.repository.AdverseEventRepository;
import com.ctms.repository.ConsentFormRepository;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.NotificationRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TestResultRepository;
import com.ctms.repository.TrialAssignmentRepository;
import com.ctms.repository.VisitScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Record-level (ownership) authorization checks, referenced from
 * {@code @PreAuthorize} SpEL as {@code @accessGuard.<method>(...)}. Role checks
 * decide <i>which class of user</i> may call an endpoint; this bean decides
 * <i>which rows</i> a non-staff caller may touch, closing the IDOR class of
 * vulnerabilities (participant A reading participant B's data by changing an id
 * in the URL).
 *
 * <p>Every method is <b>fail-closed</b>: anonymous callers, {@code null} ids and
 * principals that are not a CTMS {@link AuthenticatedUser} all yield
 * {@code false}.</p>
 *
 * <p>The checks are single {@code EXISTS} queries over the same foreign keys the
 * schema already enforces:</p>
 * <ul>
 *   <li>participant ownership — {@code patients.user_id}</li>
 *   <li>doctor↔participant assignment — {@code visit_schedule(doctor_id, patient_id)}</li>
 *   <li>clinical-manager↔trial scope — {@code trial_assignments(manager_id, trial_id)}</li>
 * </ul>
 */
@Component("accessGuard")
@RequiredArgsConstructor
public class AccessGuard {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final VisitScheduleRepository visitScheduleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ConsentFormRepository consentFormRepository;
    private final TestResultRepository testResultRepository;

    private final AdverseEventRepository adverseEventRepository;
    private final NotificationRepository notificationRepository;
    private final TrialAssignmentRepository trialAssignmentRepository;

    /* ------------------------------------------------------------------ */
    /* Identity                                                            */
    /* ------------------------------------------------------------------ */

    /** True when the authenticated user IS the user identified by {@code userId}. */
    public boolean isSelf(Integer userId) {
        AuthenticatedUser me = principal();
        return me != null && userId != null && userId.equals(me.userId());
    }

    /** True when the authenticated user owns the doctor profile {@code doctorId}. */
    public boolean isDoctorProfile(Integer doctorId) {
        AuthenticatedUser me = principal();
        return me != null && doctorId != null
                && doctorRepository.existsByDoctorIdAndUser_UserId(doctorId, me.userId());
    }

    /* ------------------------------------------------------------------ */
    /* Participant ownership (patients.user_id)                            */
    /* ------------------------------------------------------------------ */

    /** True when the authenticated user is the participant behind {@code patientId}. */
    public boolean isOwnPatient(Integer patientId) {
        AuthenticatedUser me = principal();
        return me != null && patientId != null
                && patientRepository.existsByPatientIdAndUser_UserId(patientId, me.userId());
    }

    /**
     * True when the authenticated user is a doctor with at least one scheduled
     * visit for {@code patientId} — the system's definition of an "assigned"
     * doctor (visit_schedule is the only doctor↔patient link in the schema).
     */
    public boolean isAssignedDoctor(Integer patientId) {
        AuthenticatedUser me = principal();
        return me != null && patientId != null && me.role() == RoleType.DOCTOR
                && visitScheduleRepository
                        .existsByDoctor_User_UserIdAndPatient_PatientId(me.userId(), patientId);
    }

    /** Own participant record, or assigned doctor. Staff roles pass via hasRole. */
    public boolean canViewPatient(Integer patientId) {
        return isOwnPatient(patientId) || isAssignedDoctor(patientId);
    }

    /* ------------------------------------------------------------------ */
    /* Per-record ownership                                                */
    /* ------------------------------------------------------------------ */

    public boolean isOwnVisit(Integer visitId) {
        AuthenticatedUser me = principal();
        return me != null && visitId != null
                && visitScheduleRepository.existsByVisitIdAndPatient_User_UserId(visitId, me.userId());
    }

    /** True when the authenticated doctor is the doctor on visit {@code visitId}. */
    public boolean isDoctorForVisit(Integer visitId) {
        AuthenticatedUser me = principal();
        return me != null && visitId != null
                && visitScheduleRepository.existsByVisitIdAndDoctor_User_UserId(visitId, me.userId());
    }

    public boolean isOwnEnrollment(Integer enrollmentId) {
        AuthenticatedUser me = principal();
        return me != null && enrollmentId != null
                && enrollmentRepository.existsByEnrollmentIdAndPatient_User_UserId(enrollmentId, me.userId());
    }

    public boolean isOwnConsent(Integer consentId) {
        AuthenticatedUser me = principal();
        return me != null && consentId != null
                && consentFormRepository.existsByConsentIdAndPatient_User_UserId(consentId, me.userId());
    }

    public boolean isOwnTestResult(Integer resultId) {
        AuthenticatedUser me = principal();
        return me != null && resultId != null
                && testResultRepository.existsByResultIdAndPatient_User_UserId(resultId, me.userId());
    }


    public boolean isOwnAdverseEvent(Integer eventId) {
        AuthenticatedUser me = principal();
        return me != null && eventId != null
                && adverseEventRepository.existsByEventIdAndPatient_User_UserId(eventId, me.userId());
    }

    public boolean isOwnNotification(Integer notificationId) {
        AuthenticatedUser me = principal();
        return me != null && notificationId != null
                && notificationRepository.existsByNotificationIdAndUser_UserId(notificationId, me.userId());
    }

    /* ------------------------------------------------------------------ */
    /* Trial scope                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * True when the authenticated clinical manager is assigned to
     * {@code trialId} via {@code trial_assignments}. Note: only clinical
     * managers have an assignment vehicle in the current schema; the plain
     * "Manager" role has no {@code clinical_managers} profile row and is
     * therefore scoped at role level only (documented in SECURITY_AUDIT_RBAC).
     */
    @Transactional(readOnly = true)
    public boolean managesTrial(Integer trialId) {
        AuthenticatedUser me = principal();
        return me != null && trialId != null
                && trialAssignmentRepository
                        .existsByTrial_TrialIdAndManager_User_UserId(trialId, me.userId());
    }

    /* ------------------------------------------------------------------ */

    private AuthenticatedUser principal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            return null;
        }
        return user;
    }
}
