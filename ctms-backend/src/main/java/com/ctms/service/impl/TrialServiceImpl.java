package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.AssignManagerRequest;
import com.ctms.dto.request.CreateTrialRequest;
import com.ctms.dto.request.UpdateTrialRequest;
import com.ctms.dto.response.TrialAssignmentResponse;
import com.ctms.dto.response.TrialResponse;
import com.ctms.entity.ClinicalManager;
import com.ctms.entity.Trial;
import com.ctms.entity.TrialAssignment;
import com.ctms.enums.AssignmentRole;
import com.ctms.enums.TrialPhase;
import com.ctms.enums.TrialStatus;
import com.ctms.enums.UserStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.TrialAssignmentMapper;
import com.ctms.mapper.TrialMapper;
import com.ctms.repository.ClinicalManagerRepository;
import com.ctms.repository.TrialAssignmentRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.UserRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.VisitScheduleRepository;
import com.ctms.repository.ConsentFormRepository;
import com.ctms.repository.AdverseEventRepository;
import com.ctms.repository.TestResultRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.NotificationService;
import com.ctms.service.TrialService;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * {@link TrialService} implementation migrated from the legacy TrialServiceImpl.
 * Trial-code format/uniqueness, phase/status enum validation, date-range checks,
 * the creator stamp and manager-assignment role validation are preserved; the
 * {@code created_by} int FK is now a real {@link com.ctms.entity.User} association.
 */
@Service
@RequiredArgsConstructor
public class TrialServiceImpl implements TrialService {

    private static final Logger log = LoggerFactory.getLogger(TrialServiceImpl.class);

    private final TrialRepository trialRepository;
    private final TrialAssignmentRepository assignmentRepository;
    private final ClinicalManagerRepository managerRepository;
    private final UserRepository userRepository;
    private final AuditService audit;
    private final NotificationService notifier;
    private final CurrentUserContext currentUser;
    private final TrialMapper trialMapper;
    private final TrialAssignmentMapper assignmentMapper;
    private final EnrollmentRepository enrollmentRepository;
    private final VisitScheduleRepository visitRepository;
    private final ConsentFormRepository consentRepository;
    private final AdverseEventRepository adverseEventRepository;
    private final TestResultRepository testResultRepository;

    @Override
    @Transactional
    public TrialResponse createTrial(CreateTrialRequest req) throws CTMSException {
        log.info("Creating new trial code='{}'", req.getTrialCode());
        ValidationUtil.requireNonBlank(req.getTrialCode(), "trialCode");
        ValidationUtil.requireNonBlank(req.getTrialName(), "trialName");
        ValidationUtil.validateTrialCode(req.getTrialCode());

        TrialPhase phase = EnumValidator.validate(req.getPhase(), "phase", TrialPhase::fromDb);
        String rawStatus = (req.getStatus() == null || req.getStatus().isBlank())
                ? TrialStatus.PENDING.dbValue() : req.getStatus();
        TrialStatus status = EnumValidator.validate(rawStatus, "status", TrialStatus::fromDb);
        if (req.getStartDate() != null) {
            ValidationUtil.validateDateRange(req.getStartDate(), req.getEndDate(), "trial dates");
        }
        if (trialRepository.existsByTrialCode(req.getTrialCode())) {
            throw new ValidationException("Trial code already exists: " + req.getTrialCode());
        }

        Trial trial = new Trial();
        trial.setTrialCode(req.getTrialCode());
        trial.setTrialName(req.getTrialName());
        trial.setPhase(phase);
        trial.setDescription(req.getDescription());
        trial.setStartDate(req.getStartDate());
        trial.setEndDate(req.getEndDate());
        trial.setStatus(status);
        trial.setCreatedBy(userRepository.findById(currentUser.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Acting user not found: id=" + currentUser.currentUserId())));

        Trial saved = trialRepository.save(trial);
        audit.record(currentUser.currentUserId(), "CREATE_TRIAL", "Trial");
        notifyActor("Trial created",
                "Trial '" + saved.getTrialCode() + " - " + saved.getTrialName() + "' was created.");
        log.info("Trial created successfully id={}", saved.getTrialId());
        return trialMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TrialResponse updateTrial(Integer trialId, UpdateTrialRequest req) throws CTMSException {
        log.info("Updating trial id={}", trialId);
        Trial trial = loadTrial(trialId);

        if (req.getTrialCode() != null && !req.getTrialCode().isBlank()
                && !req.getTrialCode().equals(trial.getTrialCode())) {
            ValidationUtil.validateTrialCode(req.getTrialCode());
            if (trialRepository.existsByTrialCode(req.getTrialCode())) {
                throw new ValidationException("Trial code already exists: " + req.getTrialCode());
            }
            trial.setTrialCode(req.getTrialCode());
        }
        if (req.getTrialName() != null && !req.getTrialName().isBlank()) trial.setTrialName(req.getTrialName());
        if (req.getPhase() != null && !req.getPhase().isBlank()) {
            trial.setPhase(EnumValidator.validate(req.getPhase(), "phase", TrialPhase::fromDb));
        }
        if (req.getDescription() != null) trial.setDescription(req.getDescription());
        if (req.getStartDate() != null) trial.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) trial.setEndDate(req.getEndDate());
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            trial.setStatus(EnumValidator.validate(req.getStatus(), "status", TrialStatus::fromDb));
        }
        ValidationUtil.validateDateRange(trial.getStartDate(), trial.getEndDate(), "trial dates");

        Trial saved = trialRepository.save(trial);
        audit.record(currentUser.currentUserId(), "UPDATE_TRIAL", "Trial");
        log.info("Trial updated id={}", trialId);
        return trialMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteTrial(Integer trialId) throws CTMSException {
        log.info("Deleting trial id={}", trialId);
        Trial trial = loadTrial(trialId);
        try {
            trialRepository.delete(trial);
            trialRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException(
                    "Cannot delete trial id=" + trialId + ": it is referenced by other records");
        }
        audit.record(currentUser.currentUserId(), "DELETE_TRIAL", "Trial");
        log.info("Trial deleted id={}", trialId);
    }

    @Override
    @Transactional
    public void updateStatus(Integer trialId, String status) throws CTMSException {
        log.info("Updating trial status id={} -> {}", trialId, status);
        Trial trial = loadTrial(trialId);
        trial.setStatus(EnumValidator.validate(status, "status", TrialStatus::fromDb));
        trialRepository.save(trial);
        audit.record(currentUser.currentUserId(), "UPDATE_TRIAL_STATUS", "Trial");
        log.info("Trial status updated id={}", trialId);
    }

    @Override
    @Transactional(readOnly = true)
    public TrialResponse getTrial(Integer trialId) throws CTMSException {
        return trialMapper.toResponse(loadTrial(trialId));
    }

    @Override
    @Transactional(readOnly = true)
    public com.ctms.dto.response.TrialDetailsResponse getTrialDetails(Integer trialId) throws CTMSException {
        Trial trial = loadTrial(trialId);
        
        // 1. Enrollments
        var enrollments = enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId);
        long active = enrollments.stream().filter(e -> "Active".equalsIgnoreCase(e.getStatus().dbValue())).count();
        long completed = enrollments.stream().filter(e -> "Completed".equalsIgnoreCase(e.getStatus().dbValue())).count();
        long withdrawn = enrollments.stream().filter(e -> "Withdrawn".equalsIgnoreCase(e.getStatus().dbValue())).count();
        long screening = enrollments.stream().filter(e -> "Screening".equalsIgnoreCase(e.getStatus().dbValue())).count();
        long totalTarget = 100; // Mock target for MVP
        double enrollPct = totalTarget > 0 ? (double) enrollments.size() / totalTarget * 100 : 0;
        
        var enrollmentSummary = com.ctms.dto.response.TrialEnrollmentSummaryResponse.builder()
            .totalTarget(totalTarget).currentEnrollment(enrollments.size())
            .activeParticipants(active).completedParticipants(completed)
            .withdrawnParticipants(withdrawn).screeningParticipants(screening)
            .enrollmentPercentage(enrollPct).build();
            
        // 2. Visits
        var visits = visitRepository.findByTrial_TrialIdOrderByScheduledDateAsc(trialId);
        long completedVisits = visits.stream().filter(v -> "Completed".equalsIgnoreCase(v.getVisitStatus().dbValue())).count();
        long pendingVisits = visits.stream().filter(v -> "Scheduled".equalsIgnoreCase(v.getVisitStatus().dbValue())).count();
        long missedVisits = visits.stream().filter(v -> "Missed".equalsIgnoreCase(v.getVisitStatus().dbValue())).count();
        double visitPct = visits.isEmpty() ? 0 : (double) completedVisits / visits.size() * 100;
        
        var visitSummary = com.ctms.dto.response.TrialVisitSummaryResponse.builder()
            .totalVisits(visits.size()).completedVisits(completedVisits)
            .pendingVisits(pendingVisits).missedVisits(missedVisits)
            .completionRate(visitPct).build();
            
        // 3. Consents
        var consents = consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId);
        long signedConsents = consents.stream().filter(c -> "Signed".equalsIgnoreCase(c.getConsentStatus().dbValue())).count();
        long pendingConsents = consents.stream().filter(c -> "Pending".equalsIgnoreCase(c.getConsentStatus().dbValue())).count();
        long expiredConsents = consents.stream().filter(c -> "Expired".equalsIgnoreCase(c.getConsentStatus().dbValue())).count();
        double consentPct = consents.isEmpty() ? 0 : (double) signedConsents / consents.size() * 100;
        
        var consentSummary = com.ctms.dto.response.TrialConsentSummaryResponse.builder()
            .totalConsents(consents.size()).signedConsents(signedConsents)
            .pendingConsents(pendingConsents).expiredConsents(expiredConsents)
            .complianceRate(consentPct).build();
            
        // 4. Adverse Events
        var aes = adverseEventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId);
        long seriousAes = aes.stream().filter(a -> "Severe".equalsIgnoreCase(a.getSeverity().dbValue()) || "Life_Threatening".equalsIgnoreCase(a.getSeverity().dbValue())).count();
        long openAes = aes.stream().filter(a -> "Open".equalsIgnoreCase(a.getStatus().dbValue())).count();
        long closedAes = aes.stream().filter(a -> "Resolved".equalsIgnoreCase(a.getStatus().dbValue())).count();
        double aeRate = enrollments.isEmpty() ? 0 : (double) aes.size() / enrollments.size() * 100;
        
        var aeSummary = com.ctms.dto.response.TrialAdverseEventSummaryResponse.builder()
            .eventCount(aes.size()).seriousEvents(seriousAes)
            .openEvents(openAes).closedEvents(closedAes)
            .adverseEventRate(aeRate).build();
            
        // 5. Test Results
        var tests = testResultRepository.findByVisit_Trial_TrialIdOrderByCollectedDateDesc(trialId);
        long pendingTests = tests.stream().filter(t -> "Pending".equalsIgnoreCase(t.getResultStatus().dbValue())).count();
        long abnormalTests = tests.stream().filter(t -> "Abnormal".equalsIgnoreCase(t.getResultStatus().dbValue())).count();
        
        var testSummary = com.ctms.dto.response.TestResultSummaryResponse.builder()
            .totalTests(tests.size()).pendingResults(pendingTests).abnormalResults(abnormalTests).build();
            
        long totalEnrolled = enrollments.size();
        long totalAdverseEvents = aeSummary.getEventCount();
        long participantsWithAe = aes.stream()
            .filter(a -> a.getPatient() != null)
            .map(a -> a.getPatient().getPatientId())
            .distinct()
            .count();

        double successRate = 0.0;
        if (totalEnrolled > 0) {
            long net = totalEnrolled - participantsWithAe;
            if (net < 0) {
                successRate = 0.0;
            } else {
                successRate = ((double) net / totalEnrolled) * 100.0;
            }
            if (successRate > 100.0) {
                successRate = 100.0;
            }
        }
        successRate = Math.round(successRate * 100.0) / 100.0;

        return com.ctms.dto.response.TrialDetailsResponse.builder()
            .trialInformation(trialMapper.toResponse(trial))
            .enrollmentSummary(enrollmentSummary)
            .visitSummary(visitSummary)
            .consentSummary(consentSummary)
            .adverseEventSummary(aeSummary)
            .testResultSummary(testSummary)
            .totalEnrolled(totalEnrolled)
            .totalAdverseEvents(totalAdverseEvents)
            .successRate(successRate)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrialResponse> listTrials(Pageable pageable) {
        return trialRepository.findAll(pageable).map(trialMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrialResponse> searchTrials(String keyword, Pageable pageable) {
        return trialRepository.search(keyword == null ? "" : keyword, pageable)
                .map(trialMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String status) throws CTMSException {
        TrialStatus resolved = EnumValidator.validate(status, "status", TrialStatus::fromDb);
        return trialRepository.countByStatus(resolved);
    }

    @Override
    @Transactional
    public TrialAssignmentResponse assignManager(Integer trialId, AssignManagerRequest req) throws CTMSException {
        log.info("Assigning manager managerId={} to trial id={} as {}", req.getManagerId(), trialId, req.getRole());
        loadTrial(trialId);
        ValidationUtil.requirePositive(req.getManagerId() == null ? 0 : req.getManagerId(), "managerId");
        ValidationUtil.requireNonBlank(req.getRole(), "role");
        AssignmentRole role = EnumValidator.validate(req.getRole(), "assignment role", AssignmentRole::fromDb);

        ClinicalManager manager = managerRepository.findById(req.getManagerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Clinical manager not found: id=" + req.getManagerId()));

        TrialAssignment a = new TrialAssignment();
        a.setTrial(trialRepository.getReferenceById(trialId));
        a.setManager(manager);
        a.setRole(role);
        a.setAssignedDate(LocalDate.now());
        a.setStatus(UserStatus.ACTIVE);
        TrialAssignment saved = assignmentRepository.save(a);

        audit.record(currentUser.currentUserId(), "ASSIGN_TRIAL", "Trial");
        log.info("Assignment created id={}", saved.getAssignmentId());
        return assignmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrialAssignmentResponse> assignmentsForTrial(Integer trialId) throws CTMSException {
        loadTrial(trialId);
        return assignmentRepository.findByTrial_TrialIdOrderByAssignmentId(trialId)
                .stream().map(assignmentMapper::toResponse).toList();
    }

    /* ------------------------------------------------------------------ */

    private Trial loadTrial(Integer trialId) throws ResourceNotFoundException {
        return trialRepository.findById(trialId)
                .orElseThrow(() -> new ResourceNotFoundException("Trial not found: id=" + trialId));
    }

    private void notifyActor(String title, String message) {
        try {
            notifier.notify(currentUser.currentUserId(), title, message);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
    }
}
