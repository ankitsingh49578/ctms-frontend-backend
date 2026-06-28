package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.CreateEnrollmentRequest;
import com.ctms.dto.request.CreatePatientRequest;
import com.ctms.dto.request.UpdatePatientRequest;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.dto.response.ParticipantVisitSummaryResponse;
import com.ctms.dto.response.PatientResponse;
import com.ctms.entity.Enrollment;
import com.ctms.entity.Patient;
import com.ctms.entity.Trial;
import com.ctms.entity.User;
import com.ctms.entity.VisitSchedule;
import com.ctms.enums.EnrollmentStatus;
import com.ctms.enums.Gender;
import com.ctms.enums.VisitStatus;
import com.ctms.enums.TrialStatus;
import com.ctms.enums.UserStatus;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.EnrollmentMapper;
import com.ctms.mapper.PatientMapper;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.UserRepository;
import com.ctms.repository.RoleRepository;
import com.ctms.repository.VisitScheduleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.NotificationService;
import com.ctms.service.ParticipantService;
import com.ctms.util.PasswordUtil;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * {@link ParticipantService} implementation migrated from the legacy
 * ParticipantServiceImpl. Validation (required fields, gender enum, email/phone),
 * auto patient-code generation, trial existence/Active checks on enroll and the
 * duplicate-enrollment guard are all preserved; the int FKs are now real
 * {@link Patient}/{@link Trial}/{@link User} associations.
 */
@Service
@RequiredArgsConstructor
public class ParticipantServiceImpl implements ParticipantService {

    private static final Logger log = LoggerFactory.getLogger(ParticipantServiceImpl.class);

    private final PatientRepository patientRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TrialRepository trialRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VisitScheduleRepository visitScheduleRepository;
    private final AuditService audit;
    private final NotificationService notifier;
    private final CurrentUserContext currentUser;
    private final PatientMapper patientMapper;
    private final EnrollmentMapper enrollmentMapper;

    @Override
    @Transactional
    public PatientResponse createPatient(CreatePatientRequest req) throws CTMSException {
        log.info("Adding participant '{} {}'", req.getFirstName(), req.getLastName());
        ValidationUtil.requireNonBlank(req.getFirstName(), "firstName");
        ValidationUtil.requireNonBlank(req.getLastName(), "lastName");
        ValidationUtil.requireNotNullDate(req.getDob(), "dob");
        ValidationUtil.requireNonBlank(req.getGender(), "gender");
        Gender gender = EnumValidator.validate(req.getGender(), "gender", Gender::fromDb);
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            ValidationUtil.validateEmail(req.getEmail());
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            ValidationUtil.validatePhone(req.getPhone());
        }

        Patient patient = new Patient();
        
        String patientCode;
        long seq = patientRepository.nextPatientCodeSeq();
        while (true) {
            patientCode = String.format("PAT-%04d", seq);
            if (!patientRepository.existsByPatientCode(patientCode)) {
                break;
            }
            seq = patientRepository.nextPatientCodeSeq();
        }
        patient.setPatientCode(patientCode);

        if (req.getUserId() != null) {
            User user = userRepository.findById(req.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: id=" + req.getUserId()));
            patient.setUser(user);
        } else {
            // Auto-generate User for Admin-created patient
            com.ctms.entity.Role role = roleRepository.findByRoleName("Participant")
                    .orElseThrow(() -> new ResourceNotFoundException("Role Participant not found"));
            String username = patient.getPatientCode();
            User user = new User();
            user.setRole(role);
            user.setUsername(username);
            user.setEmail(req.getEmail() != null ? req.getEmail() : username + "@example.com");
            user.setPhone(req.getPhone());
            user.setPassword(PasswordUtil.hash("Password@123")); // Default password
            user.setStatus(UserStatus.ACTIVE);
            userRepository.save(user);
            patient.setUser(user);
        }
        patient.setFirstName(req.getFirstName());
        patient.setLastName(req.getLastName());
        patient.setDob(req.getDob());
        patient.setGender(gender);
        patient.setPhone(req.getPhone());
        patient.setEmail(req.getEmail());
        patient.setAddress(req.getAddress());
        patient.setBloodGroup(req.getBloodGroup());
        patient.setStatus(req.getStatus() == null || req.getStatus().isBlank() ? "Pending" : req.getStatus());

        Patient saved = patientRepository.save(patient);
        audit.record(currentUser.currentUserId(), "ADD_PARTICIPANT", "Participant");
        log.info("Participant added id={}", saved.getPatientId());
        return patientMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PatientResponse updatePatient(Integer patientId, UpdatePatientRequest req) throws CTMSException {
        log.info("Updating participant id={}", patientId);
        Patient patient = loadPatient(patientId);

        if (req.getFirstName() != null && !req.getFirstName().isBlank()) patient.setFirstName(req.getFirstName());
        if (req.getLastName() != null && !req.getLastName().isBlank()) patient.setLastName(req.getLastName());
        if (req.getDob() != null) patient.setDob(req.getDob());
        if (req.getGender() != null && !req.getGender().isBlank()) {
            patient.setGender(EnumValidator.validate(req.getGender(), "gender", Gender::fromDb));
        }
        if (req.getPhone() != null) {
            if (!req.getPhone().isBlank()) ValidationUtil.validatePhone(req.getPhone());
            patient.setPhone(req.getPhone());
        }
        if (req.getEmail() != null) {
            if (!req.getEmail().isBlank()) ValidationUtil.validateEmail(req.getEmail());
            patient.setEmail(req.getEmail());
        }
        if (req.getAddress() != null) patient.setAddress(req.getAddress());
        if (req.getBloodGroup() != null) patient.setBloodGroup(req.getBloodGroup());
        if (req.getStatus() != null && !req.getStatus().isBlank()) patient.setStatus(req.getStatus());

        Patient saved = patientRepository.save(patient);
        audit.record(currentUser.currentUserId(), "UPDATE_PARTICIPANT", "Participant");
        log.info("Participant updated id={}", patientId);
        return patientMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void verifyParticipant(Integer patientId) throws CTMSException {
        log.info("Verifying participant id={}", patientId);
        Patient patient = loadPatient(patientId);
        patient.setStatus("Verified");
        patientRepository.save(patient);
        audit.record(currentUser.currentUserId(), "VERIFY_PARTICIPANT", "Participant");
        log.info("Participant verified id={}", patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getParticipant(Integer patientId) throws CTMSException {
        return patientMapper.toResponse(loadPatient(patientId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> listParticipants(Pageable pageable) {
        return patientRepository.findAll(pageable).map(patientMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> searchParticipants(String keyword, Pageable pageable) {
        return patientRepository.search(keyword == null ? "" : keyword, pageable)
                .map(patientMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countParticipants() {
        return patientRepository.count();
    }

    @Override
    @Transactional
    public EnrollmentResponse enroll(CreateEnrollmentRequest req) throws CTMSException {
        log.info("Enrolling participant id={} into trial id={}", req.getPatientId(), req.getTrialId());
        ValidationUtil.requirePositive(req.getPatientId() == null ? 0 : req.getPatientId(), "patientId");
        ValidationUtil.requirePositive(req.getTrialId() == null ? 0 : req.getTrialId(), "trialId");

        Patient patient = loadPatient(req.getPatientId());
        // Business rule (Phase 8): a participant must be VERIFIED before enrollment.
        // New registrations start as "Pending"; verifyParticipant(...) promotes them to
        // "Verified". Seeded/active participants are already past this gate, so we only
        // block the explicitly-unverified ("Pending") case to avoid breaking existing data.
        if (patient.getStatus() != null && "Pending".equalsIgnoreCase(patient.getStatus())) {
            throw new ValidationException(
                    "Cannot enroll: participant must be verified first (current status="
                            + patient.getStatus() + ")");
        }
        Trial trial = trialRepository.findById(req.getTrialId())
                .orElseThrow(() -> new ResourceNotFoundException("Trial not found: id=" + req.getTrialId()));
        if (trial.getStatus() != TrialStatus.ACTIVE) {
            throw new ValidationException(
                    "Cannot enroll: trial is not Active (status=" + trial.getStatus().dbValue() + ")");
        }
        if (enrollmentRepository.existsByPatient_PatientIdAndTrial_TrialId(req.getPatientId(), req.getTrialId())) {
            throw new ValidationException("Participant already enrolled in this trial");
        }

        Enrollment e = new Enrollment();
        e.setPatient(patient);
        e.setTrial(trial);
        e.setEnrollmentDate(LocalDate.now());
        e.setStatus(EnrollmentStatus.SCREENING);
        Enrollment saved = enrollmentRepository.save(e);

        audit.record(currentUser.currentUserId(), "ENROLL_PARTICIPANT", "Enrollment");
        notifyActor("Participant enrolled",
                "Participant #" + req.getPatientId() + " enrolled into trial #" + req.getTrialId() + ".");
        log.info("Enrollment created id={}", saved.getEnrollmentId());
        return enrollmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void updateEnrollmentStatus(Integer enrollmentId, String status) throws CTMSException {
        log.info("Updating enrollment id={} -> {}", enrollmentId, status);
        EnrollmentStatus resolved = EnumValidator.validate(status, "enrollmentStatus", EnrollmentStatus::fromDb);
        Enrollment e = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: id=" + enrollmentId));
        e.setStatus(resolved);
        enrollmentRepository.save(e);
        audit.record(currentUser.currentUserId(), "UPDATE_ENROLLMENT", "Enrollment");
        log.info("Enrollment status updated id={}", enrollmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollment(Integer enrollmentId) throws CTMSException {
        Enrollment e = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: id=" + enrollmentId));
        return enrollmentMapper.toResponse(e);
    }
    
    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<EnrollmentResponse> getEnrollmentsByTrial(Integer trialId, org.springframework.data.domain.Pageable pageable) throws CTMSException {
        // Fetch paginated using the list method and creating a page wrapper, or implement proper pagination in repository.
        // For MVP we just use the list and return as a page wrapper.
        var list = enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId)
            .stream().map(enrollmentMapper::toResponse).toList();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        if (start > list.size()) {
            return new org.springframework.data.domain.PageImpl<>(java.util.Collections.emptyList(), pageable, list.size());
        }
        return new org.springframework.data.domain.PageImpl<>(list.subList(start, end), pageable, list.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> enrollmentsForPatient(Integer patientId) throws CTMSException {
        loadPatient(patientId);
        return enrollmentRepository.findByPatient_PatientIdOrderByEnrollmentIdDesc(patientId)
                .stream().map(enrollmentMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ParticipantVisitSummaryResponse getVisitSummary(Integer patientId) throws CTMSException {
        Patient patient = loadPatient(patientId);
        List<Enrollment> enrollments = enrollmentRepository.findByPatient_PatientIdOrderByEnrollmentIdDesc(patientId);
        if (enrollments.isEmpty()) {
            throw new ValidationException("Participant is not enrolled in any trial");
        }
        Enrollment latest = enrollments.get(0);
        Trial trial = latest.getTrial();

        List<VisitSchedule> visits = visitScheduleRepository.findByPatient_PatientIdOrderByScheduledDateAsc(patientId);
        
        int completedVisits = (int) visits.stream().filter(v -> v.getVisitStatus() == VisitStatus.COMPLETED).count();
        int totalVisits = visits.size();
        
        VisitSchedule nextExpected = visits.stream()
            .filter(v -> v.getVisitStatus() == VisitStatus.SCHEDULED || v.getVisitStatus() == VisitStatus.RESCHEDULED)
            .min(Comparator.comparing(VisitSchedule::getScheduledDate))
            .orElse(null);

        return ParticipantVisitSummaryResponse.builder()
                .patientId(patient.getPatientId())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .trialId(trial.getTrialId())
                .trialName(trial.getTrialName())
                .trialCode(trial.getTrialCode())
                .enrollmentStatus(latest.getStatus().dbValue())
                .totalTrialVisits(totalVisits)
                .completedVisits(completedVisits)
                .remainingVisits(totalVisits - completedVisits)
                .nextExpectedVisitNumber(nextExpected != null ? nextExpected.getVisitNumber() : null)
                .nextExpectedVisitDate(nextExpected != null ? nextExpected.getScheduledDate() : null)
                .build();
    }

    /* ------------------------------------------------------------------ */

    private Patient loadPatient(Integer patientId) throws ResourceNotFoundException {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: id=" + patientId));
    }

    private void notifyActor(String title, String message) {
        try {
            notifier.notify(currentUser.currentUserId(), title, message);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
    }
}
