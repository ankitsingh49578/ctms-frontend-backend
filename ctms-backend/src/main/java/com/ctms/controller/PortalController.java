package com.ctms.controller;

import com.ctms.dto.ApiResponse;
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
import com.ctms.service.ConsentService;
import com.ctms.service.ParticipantPortalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Self-service portal for the {@code PARTICIPANT} role: the participant-facing
 * counterpart to the staff/management controllers. Every endpoint is scoped to
 * the authenticated participant — none accepts a patient id — so a participant
 * can browse and apply to trials, manage their consent, and view their own
 * visits, results, documents and notifications, but can never reach another
 * participant's data.
 *
 * <p>Following the convention used throughout this API, every endpoint carries an
 * explicit method-level {@code @PreAuthorize}. Read endpoints require only
 * {@code ROLE_PARTICIPANT} (the service resolves "me" from the principal, so
 * there is no id to tamper with); endpoints that act on a specific consent,
 * enrollment or notification additionally assert ownership via the
 * {@code @accessGuard} predicates, giving defence in depth alongside the
 * id-from-principal resolution done in the service.</p>
 */
@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
@Tag(name = "Participant Portal", description = "Self-service endpoints for the logged-in participant")
public class PortalController {

    private final ParticipantPortalService portal;
    private final ConsentService consentService;

    /* ----- Profile & account ----------------------------------------- */

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me")
    @Operation(summary = "Get my participant profile")
    public ResponseEntity<ApiResponse<PatientResponse>> me() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myProfile()));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @PutMapping("/me")
    @Operation(summary = "Update my own contact details (phone, email, address, blood group)")
    public ResponseEntity<ApiResponse<PatientResponse>> updateMe(
            @Valid @RequestBody UpdateMyProfileRequest request) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", portal.updateMyProfile(request)));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @PutMapping("/me/password")
    @Operation(summary = "Change my own password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) throws CTMSException {
        portal.changeMyPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed", null));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/dashboard")
    @Operation(summary = "My dashboard: live counts of applications, consents, visits and notifications")
    public ResponseEntity<ApiResponse<ParticipantDashboardResponse>> dashboard() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myDashboard()));
    }

    /* ----- Trials & enrollment --------------------------------------- */

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/trials")
    @Operation(summary = "Browse active trials available to apply to")
    public ResponseEntity<ApiResponse<Page<TrialResponse>>> browseTrials(
            @PageableDefault(size = 20, sort = "trialId") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(portal.browseActiveTrials(pageable)));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/trials/{trialId}")
    @Operation(summary = "View a trial's details")
    public ResponseEntity<ApiResponse<TrialResponse>> trial(@PathVariable Integer trialId)
            throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.getTrial(trialId)));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/enrollments")
    @Operation(summary = "List my enrollments and applications")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> myEnrollments() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myEnrollments()));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @PostMapping("/me/enrollments")
    @Operation(summary = "Apply to a trial (creates a screening enrollment for me)")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> apply(
            @Valid @RequestBody ApplyToTrialRequest request) throws CTMSException {
        EnrollmentResponse created = portal.applyToTrial(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Application submitted", created));
    }

    @PreAuthorize("hasRole('PARTICIPANT') and @accessGuard.isOwnEnrollment(#enrollmentId)")
    @DeleteMapping("/me/enrollments/{enrollmentId}")
    @Operation(summary = "Withdraw one of my applications while it is still in screening")
    public ResponseEntity<ApiResponse<Void>> withdraw(@PathVariable Integer enrollmentId)
            throws CTMSException {
        portal.withdrawApplication(enrollmentId);
        return ResponseEntity.ok(ApiResponse.ok("Application withdrawn", null));
    }

    /* ----- Consent ---------------------------------------------------- */

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/consents")
    @Operation(summary = "List my consent forms, including any awaiting signature")
    public ResponseEntity<ApiResponse<List<ConsentResponse>>> myConsents() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myConsents()));
    }

    @PreAuthorize("hasRole('PARTICIPANT') and @accessGuard.isOwnConsent(#consentId)")
    @PostMapping("/me/consents/{consentId}/sign")
    @Operation(summary = "Sign one of my consent forms")
    public ResponseEntity<ApiResponse<Void>> signConsent(@PathVariable Integer consentId)
            throws CTMSException {
        portal.signConsent(consentId);
        return ResponseEntity.ok(ApiResponse.ok("Consent signed", null));
    }

    @PreAuthorize("hasRole('PARTICIPANT') and @accessGuard.isOwnConsent(#consentId)")
    @PostMapping("/me/consents/{consentId}/decline")
    @Operation(summary = "Decline one of my consent forms")
    public ResponseEntity<ApiResponse<Void>> declineConsent(@PathVariable Integer consentId)
            throws CTMSException {
        portal.declineConsent(consentId);
        return ResponseEntity.ok(ApiResponse.ok("Consent declined", null));
    }

    @PreAuthorize("hasRole('PARTICIPANT') and @accessGuard.isOwnConsent(#consentId)")
    @GetMapping("/me/consents/{consentId}/document")
    @Operation(summary = "Download the PDF document for one of my consent forms")
    public ResponseEntity<Resource> getConsentDocument(@PathVariable Integer consentId) throws CTMSException {
        Resource resource = consentService.getConsentDocument(consentId);
        String filename = consentService.getConsentDocumentName(consentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    /* ----- Clinical records ------------------------------------------ */

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/visits")
    @Operation(summary = "My visit schedule and history, ordered by scheduled date")
    public ResponseEntity<ApiResponse<Page<VisitResponse>>> myVisits(
            @PageableDefault(size = 20, sort = "scheduledDate") Pageable pageable) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myVisits(pageable)));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/test-results")
    @Operation(summary = "My test results")
    public ResponseEntity<ApiResponse<List<TestResultResponse>>> myResults() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myTestResults()));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/adverse-events")
    @Operation(summary = "My reported adverse events")
    public ResponseEntity<ApiResponse<List<AdverseEventResponse>>> myAdverseEvents() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.myAdverseEvents()));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/adverse-events/{id}")
    @Operation(summary = "Get a single adverse event")
    public ResponseEntity<ApiResponse<AdverseEventResponse>> getAdverseEvent(@PathVariable Integer id) throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(portal.getAdverseEvent(id)));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @PostMapping("/adverse-events")
    @Operation(summary = "Report an adverse event")
    public ResponseEntity<ApiResponse<AdverseEventResponse>> reportAdverseEvent(
            @Valid @RequestBody com.ctms.dto.request.ParticipantReportAdverseEventRequest request) throws CTMSException {
        AdverseEventResponse created = portal.reportAdverseEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Adverse event reported", created));
    }


    /* ----- Notifications --------------------------------------------- */

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/notifications")
    @Operation(summary = "My notifications")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> myNotifications(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(portal.myNotifications(pageable)));
    }

    @PreAuthorize("hasRole('PARTICIPANT')")
    @GetMapping("/me/notifications/unread")
    @Operation(summary = "My unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> myUnread() {
        return ResponseEntity.ok(ApiResponse.ok(portal.myUnreadNotifications()));
    }

    @PreAuthorize("hasRole('PARTICIPANT') and @accessGuard.isOwnNotification(#notificationId)")
    @PutMapping("/me/notifications/{notificationId}/read")
    @Operation(summary = "Mark one of my notifications read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Integer notificationId)
            throws CTMSException {
        portal.markNotificationRead(notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked read", null));
    }
}
