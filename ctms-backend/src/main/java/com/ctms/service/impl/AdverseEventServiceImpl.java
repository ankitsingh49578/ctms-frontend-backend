package com.ctms.service.impl;

import com.ctms.dto.request.ReportAdverseEventRequest;
import com.ctms.dto.response.AdverseEventResponse;
import com.ctms.entity.AdverseEvent;
import com.ctms.entity.Doctor;
import com.ctms.entity.Patient;
import com.ctms.entity.Trial;
import com.ctms.enums.AdverseEventStatus;
import com.ctms.enums.Severity;
import com.ctms.enums.TrialStatus;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.AdverseEventMapper;
import com.ctms.repository.AdverseEventRepository;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.UserRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AdverseEventService;
import com.ctms.service.AuditService;
import com.ctms.service.NotificationService;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import com.ctms.security.AccessGuard;
import org.springframework.security.access.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * {@link AdverseEventService} implementation migrated from the legacy
 * AdverseEventServiceImpl. Required-field and severity validation, the
 * trial-Active and participant-enrolled guards, default event date/status and
 * the reporter stamp are preserved.
 */
@Service
@RequiredArgsConstructor
public class AdverseEventServiceImpl implements AdverseEventService {

    private static final Logger log = LoggerFactory.getLogger(AdverseEventServiceImpl.class);

    private final AdverseEventRepository eventRepository;
    private final TrialRepository trialRepository;
    private final PatientRepository patientRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final AuditService audit;
    private final NotificationService notifier;
    private final CurrentUserContext currentUser;
    private final AdverseEventMapper eventMapper;
    private final DoctorRepository doctorRepository;
    private final AccessGuard accessGuard;

    @Override
    @Transactional
    public AdverseEventResponse reportEvent(ReportAdverseEventRequest req) throws CTMSException {
        log.info("Reporting adverse event for patient id={} trial id={}", req.getPatientId(), req.getTrialId());
        ValidationUtil.requirePositive(req.getPatientId() == null ? 0 : req.getPatientId(), "patientId");
        ValidationUtil.requirePositive(req.getTrialId() == null ? 0 : req.getTrialId(), "trialId");
        ValidationUtil.requireNonBlank(req.getDescription(), "description");
        Severity severity = EnumValidator.validate(req.getSeverity(), "severity", Severity::fromDb);

        Trial trial = trialRepository.findById(req.getTrialId())
                .orElseThrow(() -> new ResourceNotFoundException("Trial not found: id=" + req.getTrialId()));
        if (trial.getStatus() != TrialStatus.ACTIVE) {
            throw new ValidationException(
                    "Cannot report event: trial is not Active (status=" + trial.getStatus().dbValue() + ")");
        }
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: id=" + req.getPatientId()));
        if (!enrollmentRepository.existsByPatient_PatientIdAndTrial_TrialId(req.getPatientId(), req.getTrialId())) {
            throw new ValidationException("Cannot report event: participant is not enrolled in this trial");
        }

        if (currentUser.hasRole("DOCTOR") && !accessGuard.isAssignedDoctor(req.getPatientId())) {
            audit.record(currentUser.currentUserId(), "UNAUTHORIZED_AE_CREATE_ATTEMPT - Patient: " + req.getPatientId(), "AdverseEvent");
            throw new AccessDeniedException("You are not authorized to create adverse events for this patient.");
        }

        AdverseEvent e = new AdverseEvent();
        e.setTrial(trial);
        e.setPatient(patient);
        e.setReportedBy(userRepository.findById(currentUser.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Acting user not found: id=" + currentUser.currentUserId())));
        
        if (currentUser.hasRole("DOCTOR")) {
            Doctor d = doctorRepository.findByUser_UserId(currentUser.currentUserId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found."));
            e.setCreatedByDoctorId(d.getDoctorId());
            e.setCreatedByDoctorName(d.getDoctorName());
        }

        e.setEventDate(req.getEventDate() == null ? LocalDate.now() : req.getEventDate());
        e.setSeverity(severity);
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setSymptoms(req.getSymptoms());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setActionsTaken(req.getActionsTaken());
        e.setRequiresMedicalAttention(req.getRequiresMedicalAttention());
        e.setActionsTaken(req.getActionsTaken());
        e.setRequiresMedicalAttention(req.getRequiresMedicalAttention());
        e.setAttachments(req.getAttachments());
        e.setAttachments(req.getAttachments());
        e.setStatus(req.getStatus() == null || req.getStatus().isBlank()
                ? AdverseEventStatus.REPORTED
                : EnumValidator.validate(req.getStatus(), "adverseEventStatus", AdverseEventStatus::fromDb));

        AdverseEvent saved = eventRepository.save(e);
        audit.record(currentUser.currentUserId(), "REPORT_ADVERSE_EVENT", "AdverseEvent");
        notifyActor("Adverse event reported",
                "A " + saved.getSeverity().dbValue() + " adverse event was reported for participant #"
                        + saved.getPatient().getPatientId() + " (trial #" + saved.getTrial().getTrialId() + ").");
        log.info("Adverse event reported id={} severity={}", saved.getEventId(), saved.getSeverity().dbValue());
        return eventMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void updateStatus(Integer eventId, String status) throws CTMSException {
        log.info("Updating adverse event id={} -> {}", eventId, status);
        AdverseEventStatus resolved = EnumValidator.validate(status, "adverseEventStatus", AdverseEventStatus::fromDb);
        AdverseEvent e = loadEvent(eventId);
        
        if (currentUser.hasRole("DOCTOR")) {
            Doctor d = doctorRepository.findByUser_UserId(currentUser.currentUserId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found."));
            if (!d.getDoctorId().equals(e.getCreatedByDoctorId())) {
                audit.record(currentUser.currentUserId(), "UNAUTHORIZED_AE_UPDATE_ATTEMPT - Event: " + eventId, "AdverseEvent");
                throw new AccessDeniedException("You are not authorized to update this adverse event. Only the creator can modify it.");
            }
        }

        e.setStatus(resolved);
        eventRepository.save(e);
        audit.record(currentUser.currentUserId(), "UPDATE_ADVERSE_EVENT", "AdverseEvent");
        log.info("Adverse event status updated id={}", eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public AdverseEventResponse getEvent(Integer eventId) throws CTMSException {
        AdverseEvent e = loadEvent(eventId);
        if (currentUser.hasRole("DOCTOR")) {
            Doctor d = doctorRepository.findByUser_UserId(currentUser.currentUserId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found."));
            if (!d.getDoctorId().equals(e.getCreatedByDoctorId())) {
                audit.record(currentUser.currentUserId(), "UNAUTHORIZED_AE_ACCESS_ATTEMPT - Event: " + eventId, "AdverseEvent");
                throw new AccessDeniedException("You are not authorized to view this adverse event.");
            }
        }
        return eventMapper.toResponse(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdverseEventResponse> eventsForTrial(Integer trialId) throws CTMSException {
        if (!trialRepository.existsById(trialId)) {
            throw new ResourceNotFoundException("Trial not found: id=" + trialId);
        }
        if (currentUser.hasRole("DOCTOR")) {
            Doctor d = doctorRepository.findByUser_UserId(currentUser.currentUserId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found."));
            return eventRepository.findByTrial_TrialIdAndCreatedByDoctorIdOrderByEventDateDesc(trialId, d.getDoctorId())
                    .stream().map(eventMapper::toResponse).toList();
        }
        return eventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId)
                .stream().map(eventMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdverseEventResponse> eventsForPatient(Integer patientId) throws CTMSException {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Participant not found: id=" + patientId);
        }
        if (currentUser.hasRole("DOCTOR")) {
            Doctor d = doctorRepository.findByUser_UserId(currentUser.currentUserId())
                    .orElseThrow(() -> new AccessDeniedException("Doctor profile not found."));
            return eventRepository.findByPatient_PatientIdAndCreatedByDoctorIdOrderByEventDateDesc(patientId, d.getDoctorId())
                    .stream().map(eventMapper::toResponse).toList();
        }
        return eventRepository.findByPatient_PatientIdOrderByEventDateDesc(patientId)
                .stream().map(eventMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countBySeverity(String severity) throws CTMSException {
        Severity resolved = EnumValidator.validate(severity, "severity", Severity::fromDb);
        return eventRepository.countBySeverity(resolved);
    }

    /* ------------------------------------------------------------------ */

    private AdverseEvent loadEvent(Integer eventId) throws ResourceNotFoundException {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Adverse event not found: id=" + eventId));
    }

    private void notifyActor(String title, String message) {
        try {
            notifier.notify(currentUser.currentUserId(), title, message);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
    }
}
