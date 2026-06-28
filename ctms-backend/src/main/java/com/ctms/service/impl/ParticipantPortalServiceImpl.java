package com.ctms.service.impl;

import com.ctms.dto.request.ApplyToTrialRequest;
import com.ctms.dto.request.ChangePasswordRequest;
import com.ctms.dto.request.CreateEnrollmentRequest;
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
import com.ctms.entity.Patient;
import com.ctms.enums.ConsentStatus;
import com.ctms.enums.EnrollmentStatus;
import com.ctms.enums.TrialStatus;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.PatientMapper;
import com.ctms.mapper.TrialMapper;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AdverseEventService;
import com.ctms.service.AuditService;
import com.ctms.service.ConsentService;
import com.ctms.service.NotificationService;
import com.ctms.service.ParticipantPortalService;
import com.ctms.service.ParticipantService;
import com.ctms.service.TestResultService;
import com.ctms.service.TrialService;
import com.ctms.service.UserService;
import com.ctms.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Default {@link ParticipantPortalService}. A thin aggregation/resolution layer:
 * it turns the authenticated principal into the caller's own {@code patientId}
 * (via {@code patients.user_id}) and {@code userId}, then reuses the already-tested
 * domain services. It owns no new persistence logic except the deliberately
 * narrowed self-profile update.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ParticipantPortalServiceImpl implements ParticipantPortalService {

    private static final Logger log = LoggerFactory.getLogger(ParticipantPortalServiceImpl.class);

    private final PatientRepository patientRepository;
    private final TrialRepository trialRepository;
    private final PatientMapper patientMapper;
    private final TrialMapper trialMapper;
    private final CurrentUserContext currentUser;

    private final ParticipantService participantService;
    private final ConsentService consentService;
    private final VisitService visitService;
    private final TestResultService testResultService;
    private final AdverseEventService adverseEventService;
    private final NotificationService notificationService;
    private final UserService userService;
    private final TrialService trialService;
    private final AuditService audit;

    /* ================================================================== */
    /* Profile & account                                                  */
    /* ================================================================== */

    @Override
    @Transactional(readOnly = true)
    public PatientResponse myProfile() throws CTMSException {
        return patientMapper.toResponse(currentPatient());
    }

    @Override
    public PatientResponse updateMyProfile(UpdateMyProfileRequest request) throws CTMSException {
        Patient me = currentPatient();
        // Only contact fields are mutable via self-service. Name, DOB, gender and —
        // critically — verification status are intentionally left untouched here so a
        // participant cannot self-promote past the screening gate.
        if (request.getPhone() != null)      me.setPhone(request.getPhone());
        if (request.getEmail() != null)      me.setEmail(request.getEmail());
        if (request.getAddress() != null)    me.setAddress(request.getAddress());
        if (request.getBloodGroup() != null) me.setBloodGroup(request.getBloodGroup());
        Patient saved = patientRepository.save(me);
        audit.record(currentUser.currentUserId(), "UPDATE_OWN_PROFILE", "Patient");
        log.info("Participant id={} updated own contact details", saved.getPatientId());
        return patientMapper.toResponse(saved);
    }

    @Override
    public void changeMyPassword(ChangePasswordRequest request) throws CTMSException {
        // Delegates to the same vetted flow as POST /api/users/{id}/change-password,
        // but pins the target to the caller so no id can be supplied.
        userService.changePassword(currentUser.currentUserId(), request);
        audit.record(currentUser.currentUserId(), "CHANGE_OWN_PASSWORD", "User");
    }

    @Override
    @Transactional(readOnly = true)
    public ParticipantDashboardResponse myDashboard() throws CTMSException {
        Patient me = currentPatient();
        Integer patientId = me.getPatientId();
        Integer userId = currentUser.currentUserId();

        List<EnrollmentResponse> enrollments = participantService.enrollmentsForPatient(patientId);
        long pendingApplications = enrollments.stream()
                .filter(e -> EnrollmentStatus.SCREENING.dbValue().equalsIgnoreCase(e.getStatus()))
                .count();
        long activeEnrollments = enrollments.stream()
                .filter(e -> EnrollmentStatus.ENROLLED.dbValue().equalsIgnoreCase(e.getStatus()))
                .count();

        long pendingConsents = consentService.consentsForPatient(patientId).stream()
                .filter(c -> ConsentStatus.PENDING.dbValue().equalsIgnoreCase(c.getConsentStatus()))
                .count();

        long unread = notificationService.unreadForUser(userId).size();

        // Cheap total without materialising rows: ask for a 1-element page and read the count.
        long totalVisits = visitService.visitsForPatient(patientId, PageRequest.of(0, 1)).getTotalElements();

        return ParticipantDashboardResponse.builder()
                .patientId(patientId)
                .fullName(((me.getFirstName() == null ? "" : me.getFirstName()) + " "
                        + (me.getLastName() == null ? "" : me.getLastName())).trim())
                .accountStatus(me.getStatus())
                .totalEnrollments(enrollments.size())
                .pendingApplications(pendingApplications)
                .activeEnrollments(activeEnrollments)
                .pendingConsents(pendingConsents)
                .totalVisits(totalVisits)
                .unreadNotifications(unread)
                .build();
    }

    /* ================================================================== */
    /* Trials & enrollment                                                */
    /* ================================================================== */

    @Override
    @Transactional(readOnly = true)
    public Page<TrialResponse> browseActiveTrials(Pageable pageable) {
        return trialRepository.findByStatus(TrialStatus.ACTIVE, pageable).map(trialMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TrialResponse getTrial(Integer trialId) throws CTMSException {
        return trialService.getTrial(trialId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> myEnrollments() throws CTMSException {
        try {
            return participantService.enrollmentsForPatient(currentPatient().getPatientId());
        } catch (ResourceNotFoundException e) {
            return java.util.Collections.emptyList();
        }
    }

    @Override
    public EnrollmentResponse applyToTrial(ApplyToTrialRequest request) throws CTMSException {
        // Force the patient id to the caller; reuse the full enrollment rule set
        // (must be verified, trial Active, no duplicate) from ParticipantService.
        CreateEnrollmentRequest delegate = new CreateEnrollmentRequest();
        delegate.setPatientId(currentPatient().getPatientId());
        delegate.setTrialId(request.getTrialId());
        EnrollmentResponse created = participantService.enroll(delegate);
        log.info("Participant id={} applied to trial id={}", delegate.getPatientId(), request.getTrialId());
        return created;
    }

    @Override
    public void withdrawApplication(Integer enrollmentId) throws CTMSException {
        // Ownership is enforced by @accessGuard.isOwnEnrollment on the controller.
        // Here we enforce the lifecycle rule: only an application still in screening
        // may be self-withdrawn; an active or completed enrollment is staff-managed.
        EnrollmentResponse e = participantService.getEnrollment(enrollmentId);
        if (!EnrollmentStatus.SCREENING.dbValue().equalsIgnoreCase(e.getStatus())) {
            throw new ValidationException(
                    "Only applications still in screening can be withdrawn (current status="
                            + e.getStatus() + ")");
        }
        participantService.updateEnrollmentStatus(enrollmentId, EnrollmentStatus.WITHDRAWN.dbValue());
        audit.record(currentUser.currentUserId(), "WITHDRAW_APPLICATION", "Enrollment");
    }

    /* ================================================================== */
    /* Consent                                                            */
    /* ================================================================== */

    @Override
    @Transactional(readOnly = true)
    public List<ConsentResponse> myConsents() throws CTMSException {
        return consentService.consentsForPatient(currentPatient().getPatientId());
    }

    @Override
    public void signConsent(Integer consentId) throws CTMSException {
        consentService.signConsent(consentId);   // ownership guarded on controller
    }

    @Override
    public void declineConsent(Integer consentId) throws CTMSException {
        consentService.declineConsent(consentId); // ownership guarded on controller
    }

    /* ================================================================== */
    /* Clinical records                                                   */
    /* ================================================================== */

    @Override
    @Transactional(readOnly = true)
    public Page<VisitResponse> myVisits(Pageable pageable) throws CTMSException {
        return visitService.visitsForPatient(currentPatient().getPatientId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultResponse> myTestResults() throws CTMSException {
        return testResultService.resultsForPatient(currentPatient().getPatientId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdverseEventResponse> myAdverseEvents() throws CTMSException {
        return adverseEventService.eventsForPatient(currentPatient().getPatientId());
    }

    @Override
    @Transactional(readOnly = true)
    public AdverseEventResponse getAdverseEvent(Integer eventId) throws CTMSException {
        // Ownership is guarded by @accessGuard on the controller, so we can just fetch it
        return adverseEventService.getEvent(eventId);
    }

    @Override
    public AdverseEventResponse reportAdverseEvent(com.ctms.dto.request.ParticipantReportAdverseEventRequest request) throws CTMSException {
        Patient me = currentPatient();
        
        // Ensure patient is enrolled in the trial and it is active.
        // We can do this by checking if they have an ENROLLED status enrollment for this trial.
        List<EnrollmentResponse> myEnrollments = participantService.enrollmentsForPatient(me.getPatientId());
        boolean isEnrolled = myEnrollments.stream()
                .anyMatch(e -> e.getTrialId().equals(request.getTrialId()) 
                            && EnrollmentStatus.ENROLLED.dbValue().equalsIgnoreCase(e.getStatus()));
                            
        if (!isEnrolled) {
            throw new ValidationException("You can only report adverse events for trials you are currently enrolled in.");
        }

        // Map to internal request
        com.ctms.dto.request.ReportAdverseEventRequest internalReq = new com.ctms.dto.request.ReportAdverseEventRequest();
        internalReq.setPatientId(me.getPatientId());
        internalReq.setTrialId(request.getTrialId());
        internalReq.setEventDate(request.getEventDate());
        internalReq.setSeverity(request.getSeverity());
        internalReq.setDescription(request.getDescription());
        
        // We will need to set the new fields as well if we added them to ReportAdverseEventRequest
        // Let's assume we update ReportAdverseEventRequest to hold the extra fields.
        internalReq.setTitle(request.getTitle());
        internalReq.setSymptoms(request.getSymptoms());
        internalReq.setStartDate(request.getStartDate());
        internalReq.setEndDate(request.getEndDate());
        internalReq.setActionsTaken(request.getActionsTaken());
        internalReq.setRequiresMedicalAttention(request.getRequiresMedicalAttention());
        internalReq.setAttachments(request.getAttachments());

        AdverseEventResponse created = adverseEventService.reportEvent(internalReq);
        audit.record(currentUser.currentUserId(), "REPORT_ADVERSE_EVENT", "AdverseEvent");
        
        // Notify
        String msg = "New adverse event reported by " + me.getFirstName() + " for trial #" + request.getTrialId();
        notificationService.notifyRole("ROLE_CLINICAL_MANAGER", "New Adverse Event", msg);
        notificationService.notifyRole("ROLE_TRIAL_MANAGER", "New Adverse Event", msg);
        
        // Attempt to notify assigned doctor if available in the enrollments or trial
        // For simplicity, we just notify managers. In a real system we'd notify the specific PI.

        return created;
    }

    /* ================================================================== */
    /* Notifications                                                      */
    /* ================================================================== */

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> myNotifications(Pageable pageable) {
        return notificationService.forUser(currentUser.currentUserId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> myUnreadNotifications() {
        return notificationService.unreadForUser(currentUser.currentUserId());
    }

    @Override
    public void markNotificationRead(Integer notificationId) throws CTMSException {
        notificationService.markRead(notificationId); // ownership guarded on controller
    }

    /* ================================================================== */

    /**
     * Resolve the {@link Patient} row owned by the authenticated user. A 404 here
     * means the caller authenticated but has no participant profile linked to
     * their login (e.g. a staff account that inherits the PARTICIPANT authority
     * through the role hierarchy) — they simply have no "me" to read.
     */
    private Patient currentPatient() throws ResourceNotFoundException {
        Integer userId = currentUser.currentUserId();
        return patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No participant profile is linked to the current account"));
    }
}
