package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.RecordTestResultRequest;
import com.ctms.dto.response.TestResultResponse;
import com.ctms.entity.TestResult;
import com.ctms.enums.TestResultStatus;
import com.ctms.exception.BusinessException;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.mapper.TestResultMapper;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TestResultRepository;
import com.ctms.repository.VisitScheduleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.NotificationService;
import com.ctms.service.TestResultService;
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
 * {@link TestResultService} implementation migrated from the legacy
 * TestResultServiceImpl. Required-field validation, visit/patient/doctor
 * existence checks, default Normal status and the collected-date default are
 * preserved.
 */
@Service
@RequiredArgsConstructor
public class TestResultServiceImpl implements TestResultService {

    private static final Logger log = LoggerFactory.getLogger(TestResultServiceImpl.class);

    private final TestResultRepository resultRepository;
    private final VisitScheduleRepository visitRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuditService audit;
    private final NotificationService notifier;
    private final CurrentUserContext currentUser;
    private final TestResultMapper resultMapper;

    @Override
    @Transactional
    public TestResultResponse recordResult(RecordTestResultRequest req) throws CTMSException {
        log.info("Recording test result test='{}' visit={}", req.getTestName(), req.getVisitId());
        ValidationUtil.requireNonBlank(req.getTestName(), "testName");
        ValidationUtil.requirePositive(req.getVisitId() == null ? 0 : req.getVisitId(), "visitId");
        ValidationUtil.requirePositive(req.getPatientId() == null ? 0 : req.getPatientId(), "patientId");
        ValidationUtil.requirePositive(req.getDoctorId() == null ? 0 : req.getDoctorId(), "doctorId");

        if (!visitRepository.existsById(req.getVisitId())) {
            throw new ResourceNotFoundException("Visit not found: id=" + req.getVisitId());
        }
        if (!patientRepository.existsById(req.getPatientId())) {
            throw new ResourceNotFoundException("Patient not found: id=" + req.getPatientId());
        }
        if (!doctorRepository.existsById(req.getDoctorId())) {
            throw new ResourceNotFoundException("Doctor not found: id=" + req.getDoctorId());
        }

        TestResult r = new TestResult();
        r.setVisit(visitRepository.getReferenceById(req.getVisitId()));
        r.setPatient(patientRepository.getReferenceById(req.getPatientId()));
        r.setDoctor(doctorRepository.getReferenceById(req.getDoctorId()));
        r.setTestName(req.getTestName());
        r.setResultValue(req.getResultValue());
        r.setUnit(req.getUnit());
        r.setResultStatus(req.getResultStatus() == null || req.getResultStatus().isBlank()
                ? TestResultStatus.NORMAL
                : EnumValidator.validate(req.getResultStatus(), "resultStatus", TestResultStatus::fromDb));
        r.setCollectedDate(req.getCollectedDate() == null ? LocalDate.now() : req.getCollectedDate());

        TestResult saved = resultRepository.save(r);
        audit.record(currentUser.currentUserId(), "RECORD_TEST_RESULT", "TestResult");
        notifyActor("Test result recorded",
                "Test '" + saved.getTestName() + "' recorded (status: " + saved.getResultStatus().dbValue() + ").");
        log.info("Test result recorded id={}", saved.getResultId());
        return resultMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void updateStatus(Integer resultId, String status) throws CTMSException {
        log.info("Updating test result status id={} -> {}", resultId, status);
        TestResultStatus resolved = EnumValidator.validate(status, "resultStatus", TestResultStatus::fromDb);
        TestResult r = loadResult(resultId);
        r.setResultStatus(resolved);
        resultRepository.save(r);
        audit.record(currentUser.currentUserId(), "UPDATE_TEST_RESULT_STATUS", "TestResult");
        log.info("Test result status updated id={}", resultId);
    }

    @Override
    @Transactional
    public void deleteResult(Integer resultId) throws CTMSException {
        log.info("Deleting test result id={}", resultId);
        TestResult r = loadResult(resultId);
        try {
            resultRepository.delete(r);
            resultRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessException(
                    "Cannot delete test result id=" + resultId + ": it is referenced by other records");
        }
        audit.record(currentUser.currentUserId(), "DELETE_TEST_RESULT", "TestResult");
        log.info("Test result deleted id={}", resultId);
    }

    @Override
    @Transactional(readOnly = true)
    public TestResultResponse getResult(Integer resultId) throws CTMSException {
        return resultMapper.toResponse(loadResult(resultId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultResponse> resultsForPatient(Integer patientId) throws CTMSException {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found: id=" + patientId);
        }
        return resultRepository.findByPatient_PatientIdOrderByCollectedDateDesc(patientId)
                .stream().map(resultMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultResponse> resultsForVisit(Integer visitId) throws CTMSException {
        if (!visitRepository.existsById(visitId)) {
            throw new ResourceNotFoundException("Visit not found: id=" + visitId);
        }
        return resultRepository.findByVisit_VisitIdOrderByCollectedDateDesc(visitId)
                .stream().map(resultMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TestResultResponse> searchResults(String keyword, Pageable pageable) {
        Integer doctorId = getCurrentDoctorId();
        if (doctorId != null) {
            return resultRepository.searchByDoctorId(keyword == null ? "" : keyword, doctorId, pageable)
                    .map(resultMapper::toResponse);
        }
        return resultRepository.search(keyword == null ? "" : keyword, pageable)
                .map(resultMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TestResultResponse> listResults(Pageable pageable) {
        Integer doctorId = getCurrentDoctorId();
        if (doctorId != null) {
            return resultRepository.findByDoctor_DoctorId(doctorId, pageable).map(resultMapper::toResponse);
        }
        return resultRepository.findAll(pageable).map(resultMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<com.ctms.dto.response.PatientTestResultSummaryResponse> getPatientSummaries(String keyword, Pageable pageable) {
        Integer doctorId = getCurrentDoctorId();
        Page<Object[]> rows;
        if (doctorId != null) {
            rows = resultRepository.searchPatientSummariesRawByDoctor(keyword == null ? "" : keyword, doctorId, pageable);
        } else {
            rows = resultRepository.searchPatientSummariesRaw(keyword == null ? "" : keyword, pageable);
        }
        return rows.map(row -> com.ctms.dto.response.PatientTestResultSummaryResponse.builder()
                        .patientId((Integer) row[0])
                        .patientName((String) row[1])
                        .trialName((String) row[2])
                        .latestResultDate((LocalDate) row[3])
                        .totalResults(((Number) row[4]).longValue())
                        .status("Available") // Hardcoded to "Available" since getting latest status via JPQL grouping is complex
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public long countResults() {
        Integer doctorId = getCurrentDoctorId();
        if (doctorId != null) {
            return resultRepository.countByDoctor_DoctorId(doctorId);
        }
        return resultRepository.count();
    }

    /* ------------------------------------------------------------------ */

    private Integer getCurrentDoctorId() {
        if (!currentUser.hasRole("DOCTOR")) {
            return null;
        }
        return doctorRepository.findByUser_UserId(currentUser.currentUserId())
                .map(com.ctms.entity.Doctor::getDoctorId)
                .orElse(null);
    }

    private TestResult loadResult(Integer resultId) throws ResourceNotFoundException {
        return resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Test result not found: id=" + resultId));
    }

    private void notifyActor(String title, String message) {
        try {
            notifier.notify(currentUser.currentUserId(), title, message);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
    }
}
