package com.ctms.service;

import com.ctms.dto.request.ApplyToTrialRequest;
import com.ctms.dto.request.ChangePasswordRequest;
import com.ctms.dto.request.UpdateMyProfileRequest;
import com.ctms.dto.response.AdverseEventResponse;
import com.ctms.dto.response.ConsentResponse;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.dto.response.NotificationResponse;
import com.ctms.dto.response.ParticipantDashboardResponse;
import com.ctms.dto.response.PatientResponse;
import com.ctms.dto.response.TestResultResponse;
import com.ctms.dto.response.TrialResponse;
import com.ctms.dto.response.VisitResponse;
import com.ctms.exception.CTMSException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Self-service facade for the {@code PARTICIPANT} role. Unlike the staff-facing
 * services (which address records by an arbitrary id supplied in the URL), every
 * method here resolves the acting participant from the security context and
 * operates strictly on that participant's own rows. No method accepts a patient
 * id, which is what makes the whole surface immune to the IDOR class of bugs by
 * construction: there is simply no id to tamper with.
 *
 * <p>Read operations delegate to the existing domain services after resolving the
 * caller's {@code patientId}/{@code userId}; mutations additionally rely on the
 * {@code @accessGuard} ownership predicates declared on the controller so the
 * caller can only act on consents, enrollments and notifications they own.</p>
 */
public interface ParticipantPortalService {

    /* ----- Profile & account ----------------------------------------- */

    /** The calling participant's own profile. */
    PatientResponse myProfile() throws CTMSException;

    /** Update the calling participant's own contact details (never status/identity). */
    PatientResponse updateMyProfile(UpdateMyProfileRequest request) throws CTMSException;

    /** Change the calling participant's own password. */
    void changeMyPassword(ChangePasswordRequest request) throws CTMSException;

    /** Live, self-scoped counts for the portal landing page. */
    ParticipantDashboardResponse myDashboard() throws CTMSException;

    /* ----- Trials & enrollment --------------------------------------- */

    /** Active trials the participant may apply to, paginated. */
    Page<TrialResponse> browseActiveTrials(Pageable pageable);

    /** A single trial by id (read-only; participants may inspect any trial they can see to apply). */
    TrialResponse getTrial(Integer trialId) throws CTMSException;

    /** The calling participant's own enrollments / applications. */
    List<EnrollmentResponse> myEnrollments() throws CTMSException;

    /** Apply to a trial: creates an enrollment for the caller in {@code Screening}. */
    EnrollmentResponse applyToTrial(ApplyToTrialRequest request) throws CTMSException;

    /** Withdraw an application that is still in {@code Screening} (caller-owned). */
    void withdrawApplication(Integer enrollmentId) throws CTMSException;

    /* ----- Consent ---------------------------------------------------- */

    /** The calling participant's own consent forms (including any awaiting signature). */
    List<ConsentResponse> myConsents() throws CTMSException;

    /** Sign one of the caller's own consent forms. */
    void signConsent(Integer consentId) throws CTMSException;

    /** Decline one of the caller's own consent forms. */
    void declineConsent(Integer consentId) throws CTMSException;

    /* ----- Clinical records ------------------------------------------ */

    /** The calling participant's own visit schedule/history, paginated by date. */
    Page<VisitResponse> myVisits(Pageable pageable) throws CTMSException;

    /** The calling participant's own test results. */
    List<TestResultResponse> myTestResults() throws CTMSException;

    /** The calling participant's own adverse events. */
    List<AdverseEventResponse> myAdverseEvents() throws CTMSException;

    /** Get a single adverse event owned by the calling participant. */
    AdverseEventResponse getAdverseEvent(Integer eventId) throws CTMSException;

    /** Report an adverse event for the calling participant. */
    AdverseEventResponse reportAdverseEvent(com.ctms.dto.request.ParticipantReportAdverseEventRequest request) throws CTMSException;



    /* ----- Notifications --------------------------------------------- */

    /** The calling participant's own notifications, paginated. */
    Page<NotificationResponse> myNotifications(Pageable pageable);

    /** The calling participant's own unread notifications. */
    List<NotificationResponse> myUnreadNotifications();

    /** Mark one of the caller's own notifications read. */
    void markNotificationRead(Integer notificationId) throws CTMSException;
}
