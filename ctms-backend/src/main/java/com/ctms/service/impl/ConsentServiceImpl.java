package com.ctms.service.impl;

import com.ctms.dto.request.CreateConsentRequest;
import com.ctms.dto.response.ConsentResponse;
import com.ctms.entity.ConsentForm;
import com.ctms.entity.Patient;
import com.ctms.entity.Trial;
import com.ctms.enums.ConsentStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.ConsentMapper;
import com.ctms.repository.ConsentFormRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.ConsentService;
import com.ctms.service.FileStorageService;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * {@link ConsentService} implementation migrated from the legacy
 * ConsentServiceImpl. The "participant must be enrolled" guard, version/status
 * defaults and the Pending -> Signed/Declined/Withdrawn transitions are preserved.
 */
@Service
@RequiredArgsConstructor
public class ConsentServiceImpl implements ConsentService {

    private static final Logger log = LoggerFactory.getLogger(ConsentServiceImpl.class);

    private final ConsentFormRepository consentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PatientRepository patientRepository;
    private final TrialRepository trialRepository;
    private final AuditService audit;
    private final CurrentUserContext currentUser;
    private final ConsentMapper consentMapper;
    private final FileStorageService fileStorage;

    @Override
    @Transactional
    public ConsentResponse createConsent(CreateConsentRequest req, MultipartFile document) throws CTMSException {
        log.info("Creating consent form for patient id={} trial id={}", req.getPatientId(), req.getTrialId());
        ValidationUtil.requirePositive(req.getPatientId() == null ? 0 : req.getPatientId(), "patientId");
        ValidationUtil.requirePositive(req.getTrialId() == null ? 0 : req.getTrialId(), "trialId");

        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: id=" + req.getPatientId()));
        Trial trial = trialRepository.findById(req.getTrialId())
                .orElseThrow(() -> new ResourceNotFoundException("Trial not found: id=" + req.getTrialId()));
        if (!enrollmentRepository.existsByPatient_PatientIdAndTrial_TrialId(req.getPatientId(), req.getTrialId())) {
            throw new ValidationException("Cannot create consent: participant is not enrolled in this trial");
        }

        ConsentForm form = new ConsentForm();
        form.setPatient(patient);
        form.setTrial(trial);
        form.setConsentVersion(req.getConsentVersion() == null || req.getConsentVersion().isBlank()
                ? "v1.0" : req.getConsentVersion());
        form.setConsentDate(req.getConsentDate() == null ? LocalDate.now() : req.getConsentDate());
        form.setConsentStatus(req.getConsentStatus() == null || req.getConsentStatus().isBlank()
                ? ConsentStatus.PENDING
                : EnumValidator.validate(req.getConsentStatus(), "consentStatus", ConsentStatus::fromDb));

        // Handle document upload
        if (document != null && !document.isEmpty()) {
            String storedPath = fileStorage.store(document);
            form.setDocumentPath(storedPath);
            form.setDocumentName(document.getOriginalFilename());
            form.setDocumentSize(document.getSize());
            form.setUploadedBy(currentUser.getUser().map(u -> u.getUsername()).orElse("system"));
            form.setUploadedDate(LocalDateTime.now());
            form.setFilePath(storedPath); // backward compat
        } else {
            form.setFilePath(req.getFilePath());
        }

        ConsentForm saved = consentRepository.save(form);
        audit.record(currentUser.currentUserId(), "CREATE_CONSENT", "Consent");
        log.info("Consent form created id={}", saved.getConsentId());
        return consentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void signConsent(Integer consentId) throws CTMSException {
        transition(consentId, ConsentStatus.SIGNED, "SIGN_CONSENT");
    }

    @Override
    @Transactional
    public void declineConsent(Integer consentId) throws CTMSException {
        transition(consentId, ConsentStatus.DECLINED, "DECLINE_CONSENT");
    }

    @Override
    @Transactional
    public void withdrawConsent(Integer consentId) throws CTMSException {
        transition(consentId, ConsentStatus.WITHDRAWN, "WITHDRAW_CONSENT");
    }

    @Override
    @Transactional(readOnly = true)
    public ConsentResponse getConsent(Integer consentId) throws CTMSException {
        return consentMapper.toResponse(loadConsent(consentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsentResponse> consentsForPatient(Integer patientId) throws CTMSException {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Participant not found: id=" + patientId);
        }
        return consentRepository.findByPatient_PatientIdOrderByConsentIdDesc(patientId)
                .stream().map(consentMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsentResponse> consentsForTrial(Integer trialId) throws CTMSException {
        if (!trialRepository.existsById(trialId)) {
            throw new ResourceNotFoundException("Trial not found: id=" + trialId);
        }
        return consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId)
                .stream().map(consentMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getConsentDocument(Integer consentId) throws CTMSException {
        ConsentForm form = loadConsent(consentId);
        String path = form.getDocumentPath();
        if (path == null || path.isBlank()) {
            throw new ResourceNotFoundException("No document attached to consent id=" + consentId);
        }
        return fileStorage.load(path);
    }

    @Override
    @Transactional(readOnly = true)
    public String getConsentDocumentName(Integer consentId) throws CTMSException {
        ConsentForm form = loadConsent(consentId);
        return form.getDocumentName() != null ? form.getDocumentName() : "consent-document.pdf";
    }

    /* ------------------------------------------------------------------ */

    private void transition(Integer consentId, ConsentStatus target, String action) throws CTMSException {
        log.info("Consent id={} -> {}", consentId, target.dbValue());
        ConsentForm form = loadConsent(consentId);
        assertTransitionAllowed(form.getConsentStatus(), target);
        form.setConsentStatus(target);
        if (target == ConsentStatus.SIGNED) {
            form.setSignedDate(LocalDateTime.now());
            action = "Accepted Consent - Trial: " + form.getTrial().getTrialName();
        }
        consentRepository.save(form);
        audit.record(currentUser.currentUserId(), action, "Consent");
        log.info("Consent status updated id={} -> {}", consentId, target.dbValue());
    }

    /**
     * Enforces the consent lifecycle. Allowed: PENDING→SIGNED, PENDING→DECLINED,
     * SIGNED→WITHDRAWN. DECLINED and WITHDRAWN are terminal. Anything else (e.g.
     * DECLINED→SIGNED, WITHDRAWN→SIGNED/DECLINED) is rejected with a 422.
     */
    private void assertTransitionAllowed(ConsentStatus current, ConsentStatus target) throws BusinessException {
        boolean allowed =
                (current == ConsentStatus.PENDING && (target == ConsentStatus.SIGNED || target == ConsentStatus.DECLINED))
             || (current == ConsentStatus.SIGNED && target == ConsentStatus.WITHDRAWN);
        if (!allowed) {
            throw new BusinessException("Illegal consent transition: "
                    + current.dbValue() + " -> " + target.dbValue());
        }
    }

    private ConsentForm loadConsent(Integer consentId) throws ResourceNotFoundException {
        return consentRepository.findById(consentId)
                .orElseThrow(() -> new ResourceNotFoundException("Consent form not found: id=" + consentId));
    }
}
