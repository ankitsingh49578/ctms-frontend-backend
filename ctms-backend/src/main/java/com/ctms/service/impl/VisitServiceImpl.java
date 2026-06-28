package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateVisitRequest;
import com.ctms.dto.response.VisitResponse;
import com.ctms.entity.Patient;
import com.ctms.entity.Trial;
import com.ctms.entity.VisitSchedule;
import com.ctms.enums.TrialStatus;
import com.ctms.enums.VisitStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.VisitMapper;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.ClinicalManagerRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.VisitScheduleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.NotificationService;
import com.ctms.service.VisitService;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * {@link VisitService} implementation migrated from the legacy VisitServiceImpl.
 * Trial-Active, participant-enrolled and doctor-exists checks, the default
 * Scheduled status and the reschedule/complete/miss/cancel transitions are
 * preserved (reschedule also flips the status to Rescheduled, as in the legacy SQL).
 */
@Service
@RequiredArgsConstructor
public class VisitServiceImpl implements VisitService {

    private static final Logger log = LoggerFactory.getLogger(VisitServiceImpl.class);

    private final VisitScheduleRepository visitRepository;
    private final TrialRepository trialRepository;
    private final PatientRepository patientRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DoctorRepository doctorRepository;
    private final ClinicalManagerRepository managerRepository;
    private final AuditService audit;
    private final NotificationService notifier;
    private final CurrentUserContext currentUser;
    private final VisitMapper visitMapper;

    @Override
    @Transactional
    public VisitResponse scheduleVisit(CreateVisitRequest req) throws CTMSException {
        log.info("Scheduling visit for patient id={} trial id={}", req.getPatientId(), req.getTrialId());
        ValidationUtil.requirePositive(req.getPatientId() == null ? 0 : req.getPatientId(), "patientId");
        ValidationUtil.requirePositive(req.getTrialId() == null ? 0 : req.getTrialId(), "trialId");
        ValidationUtil.requireNotNullDate(req.getScheduledDate(), "scheduledDate");
        ValidationUtil.requirePositive(req.getVisitNumber() == null ? 0 : req.getVisitNumber(), "visitNumber");
        ValidationUtil.requireNonBlank(req.getVisitType(), "visitType");

        Trial trial = trialRepository.findById(req.getTrialId())
                .orElseThrow(() -> new ResourceNotFoundException("Trial not found: id=" + req.getTrialId()));
        if (trial.getStatus() != TrialStatus.ACTIVE) {
            throw new ValidationException(
                    "Cannot schedule visit: trial is not Active (status=" + trial.getStatus().dbValue() + ")");
        }
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: id=" + req.getPatientId()));
        if (!enrollmentRepository.existsByPatient_PatientIdAndTrial_TrialId(req.getPatientId(), req.getTrialId())) {
            throw new ValidationException("Cannot schedule visit: participant is not enrolled in this trial");
        }

        VisitSchedule v = new VisitSchedule();
        v.setTrial(trial);
        v.setPatient(patient);
        if (req.getDoctorId() != null) {
            if (!doctorRepository.existsById(req.getDoctorId())) {
                throw new ResourceNotFoundException("Doctor not found: id=" + req.getDoctorId());
            }
            v.setDoctor(doctorRepository.getReferenceById(req.getDoctorId()));
        }
        if (req.getManagerId() != null) {
            if (!managerRepository.existsById(req.getManagerId())) {
                throw new ResourceNotFoundException("Clinical manager not found: id=" + req.getManagerId());
            }
            v.setManager(managerRepository.getReferenceById(req.getManagerId()));
        }
        v.setVisitNumber(req.getVisitNumber());
        v.setVisitType(req.getVisitType());
        v.setScheduledDate(req.getScheduledDate());
        v.setWindowStart(req.getWindowStart());
        v.setWindowEnd(req.getWindowEnd());
        v.setVisitStatus(req.getVisitStatus() == null || req.getVisitStatus().isBlank()
                ? VisitStatus.SCHEDULED
                : EnumValidator.validate(req.getVisitStatus(), "visitStatus", VisitStatus::fromDb));
        v.setNotes(req.getNotes());

        VisitSchedule saved = visitRepository.save(v);
        audit.record(currentUser.currentUserId(), "SCHEDULE_VISIT", "Visit");
        notifyActor("Visit scheduled",
                "Visit #" + saved.getVisitNumber() + " scheduled for participant #" + saved.getPatient().getPatientId()
                        + " on " + saved.getScheduledDate() + ".");
        log.info("Visit scheduled id={}", saved.getVisitId());
        return visitMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void rescheduleVisit(Integer visitId, LocalDate newDate) throws CTMSException {
        log.info("Rescheduling visit id={} -> {}", visitId, newDate);
        VisitSchedule v = loadVisit(visitId);
        ValidationUtil.requireNotNullDate(newDate, "newDate");
        v.setScheduledDate(newDate);
        assertVisitTransition(v.getVisitStatus(), VisitStatus.RESCHEDULED);
        v.setVisitStatus(VisitStatus.RESCHEDULED);
        visitRepository.save(v);
        audit.record(currentUser.currentUserId(), "RESCHEDULE_VISIT", "Visit");
        log.info("Visit rescheduled id={}", visitId);
    }

    @Override
    @Transactional
    public void markCompleted(Integer visitId, LocalDate actualDate) throws CTMSException {
        log.info("Marking visit completed id={}", visitId);
        VisitSchedule v = loadVisit(visitId);
        assertVisitTransition(v.getVisitStatus(), VisitStatus.COMPLETED);
        v.setVisitStatus(VisitStatus.COMPLETED);
        v.setActualDate(actualDate == null ? LocalDate.now() : actualDate);
        visitRepository.save(v);
        audit.record(currentUser.currentUserId(), "COMPLETE_VISIT", "Visit");
        log.info("Visit completed id={}", visitId);
    }

    @Override
    @Transactional
    public void markMissed(Integer visitId) throws CTMSException {
        log.info("Marking visit missed id={}", visitId);
        VisitSchedule v = loadVisit(visitId);
        assertVisitTransition(v.getVisitStatus(), VisitStatus.MISSED);
        v.setVisitStatus(VisitStatus.MISSED);
        visitRepository.save(v);
        audit.record(currentUser.currentUserId(), "MISS_VISIT", "Visit");
        log.info("Visit marked missed id={}", visitId);
    }

    @Override
    @Transactional
    public void cancelVisit(Integer visitId) throws CTMSException {
        log.info("Cancelling visit id={}", visitId);
        VisitSchedule v = loadVisit(visitId);
        assertVisitTransition(v.getVisitStatus(), VisitStatus.CANCELLED);
        v.setVisitStatus(VisitStatus.CANCELLED);
        visitRepository.save(v);
        audit.record(currentUser.currentUserId(), "CANCEL_VISIT", "Visit");
        log.info("Visit cancelled id={}", visitId);
    }

    @Override
    @Transactional(readOnly = true)
    public VisitResponse getVisit(Integer visitId) throws CTMSException {
        return visitMapper.toResponse(loadVisit(visitId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VisitResponse> visitsForPatient(Integer patientId, Pageable pageable) throws CTMSException {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Participant not found: id=" + patientId);
        }
        return visitRepository.findByPatient_PatientId(patientId, pageable)
                .map(visitMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VisitResponse> visitsForTrial(Integer trialId, Pageable pageable) throws CTMSException {
        if (!trialRepository.existsById(trialId)) {
            throw new ResourceNotFoundException("Trial not found: id=" + trialId);
        }
        return visitRepository.findByTrial_TrialId(trialId, pageable)
                .map(visitMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> upcomingVisits(LocalDate from, LocalDate to) {
        LocalDate start = from == null ? LocalDate.now() : from;
        LocalDate end = to == null ? start.plusDays(30) : to;
        return visitRepository
                .findByScheduledDateBetweenAndVisitStatusOrderByScheduledDateAsc(start, end, VisitStatus.SCHEDULED)
                .stream().map(visitMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitResponse> visitsForDoctor(Integer doctorId) throws CTMSException {
        ValidationUtil.requirePositive(doctorId == null ? 0 : doctorId, "doctorId");
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found: id=" + doctorId);
        }
        return visitRepository
                .findByDoctor_DoctorIdOrderByScheduledDateAsc(doctorId)
                .stream().map(visitMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String status) throws CTMSException {
        VisitStatus resolved = EnumValidator.validate(status, "visitStatus", VisitStatus::fromDb);
        return visitRepository.countByVisitStatus(resolved);
    }

    /* ------------------------------------------------------------------ */

    private VisitSchedule loadVisit(Integer visitId) throws ResourceNotFoundException {
        return visitRepository.findById(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: id=" + visitId));
    }

    private void notifyActor(String title, String message) {
        try {
            notifier.notify(currentUser.currentUserId(), title, message);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
    }
    /**
     * Guards the visit lifecycle. COMPLETED and CANCELLED are terminal — no further
     * transitions are allowed from them. A visit that is already MISSED cannot be
     * marked MISSED again. Everything else (from SCHEDULED / RESCHEDULED / MISSED)
     * is permitted. Violations raise a 422.
     */
    private void assertVisitTransition(VisitStatus current, VisitStatus target) throws BusinessException {
        if (current == VisitStatus.COMPLETED || current == VisitStatus.CANCELLED) {
            throw new BusinessException("Visit is already " + current.dbValue()
                    + "; no further status changes are allowed");
        }
        if (target == VisitStatus.MISSED && current == VisitStatus.MISSED) {
            throw new BusinessException("Visit is already marked Missed");
        }
    }
}
