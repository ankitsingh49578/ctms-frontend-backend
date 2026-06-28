package com.ctms.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.ctms.dto.request.GenerateReportRequest;
import com.ctms.dto.response.AnalyticsResponse;
import com.ctms.dto.response.DashboardResponse;
import com.ctms.dto.response.ReportResponse;
import com.ctms.entity.Analytics;
import com.ctms.entity.Report;
import com.ctms.enums.ReportType;
import com.ctms.enums.TrialStatus;
import com.ctms.enums.VisitStatus;
import com.ctms.exception.CTMSException;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.mapper.AnalyticsMapper;
import com.ctms.mapper.ReportMapper;
import com.ctms.repository.AnalyticsRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.ReportRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.UserRepository;
import com.ctms.repository.VisitScheduleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.AuditService;
import com.ctms.service.NotificationService;
import com.ctms.service.ReportService;
import com.ctms.validation.EnumValidator;
import com.ctms.validation.ValidationUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * {@link ReportService} implementation migrated from the legacy
 * ReportServiceImpl. Report name/type validation, the generated-file path
 * convention and the analytics KPI formulas (completion = completed/total
 * trials, compliance = completed/(completed+missed) visits, both 2dp HALF_UP)
 * are preserved. Creation timestamps are managed by Hibernate, not set here.
 */
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportServiceImpl.class);

    private final ReportRepository reportRepository;
    private final AnalyticsRepository analyticsRepository;
    private final TrialRepository trialRepository;
    private final PatientRepository patientRepository;
    private final VisitScheduleRepository visitRepository;
    private final UserRepository userRepository;
    private final AuditService audit;
    private final NotificationService notifier;
    private final CurrentUserContext currentUser;
    private final ReportMapper reportMapper;
    private final AnalyticsMapper analyticsMapper;

    @Override
    @Transactional
    public ReportResponse generateReport(GenerateReportRequest req) throws CTMSException {
        log.info("Generating report '{}' type={}", req.getReportName(), req.getReportType());
        ValidationUtil.requireNonBlank(req.getReportName(), "reportName");
        ReportType type = EnumValidator.validate(req.getReportType(), "reportType", ReportType::fromDb);

        Report report = new Report();
        report.setReportName(req.getReportName());
        report.setReportType(type);
        if (req.getTrialId() != null) {
            if (!trialRepository.existsById(req.getTrialId())) {
                throw new ResourceNotFoundException("Trial not found: id=" + req.getTrialId());
            }
            report.setTrial(trialRepository.getReferenceById(req.getTrialId()));
        }
        report.setGeneratedBy(userRepository.findById(currentUser.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Acting user not found: id=" + currentUser.currentUserId())));
        report.setFilePath("reports/" + req.getReportName().replaceAll("\\s+", "_") + "_"
                + System.currentTimeMillis() + ".txt");

        Report saved = reportRepository.save(report);
        audit.record(currentUser.currentUserId(), "GENERATE_REPORT", "Report");
        notifyActor("Report generated",
                "Report '" + saved.getReportName() + "' (" + saved.getReportType().dbValue() + ") was generated.");
        log.info("Report generated id={} path={}", saved.getReportId(), saved.getFilePath());
        return reportMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> listReports(Pageable pageable) {
        return reportRepository.findAll(pageable).map(reportMapper::toResponse);
    }

    @Override
    @Transactional
    public AnalyticsResponse generateAnalyticsSnapshot() throws CTMSException {
        log.info("Generating analytics snapshot...");
        long totalTrials = trialRepository.count();
        long activeTrials = trialRepository.countByStatus(TrialStatus.ACTIVE);
        long completedTrials = trialRepository.countByStatus(TrialStatus.COMPLETED);
        long totalPatients = patientRepository.count();

        long completedVisits = visitRepository.countByVisitStatus(VisitStatus.COMPLETED);
        long missedVisits = visitRepository.countByVisitStatus(VisitStatus.MISSED);
        long scheduledVisits = visitRepository.countByVisitStatus(VisitStatus.SCHEDULED);

        BigDecimal completionRate = ratio(completedTrials, totalTrials);
        BigDecimal complianceRate = ratio(completedVisits, completedVisits + missedVisits);

        Analytics a = new Analytics();
        a.setMetricDate(LocalDate.now());
        a.setActiveTrials((int) activeTrials);
        a.setTotalPatients((int) totalPatients);
        a.setEnrolledPatients((int) totalPatients);
        a.setCompletionRate(completionRate);
        a.setComplianceRate(complianceRate);
        a.setPendingVisits((int) scheduledVisits);
        a.setOverdueVisits((int) missedVisits);

        Analytics saved = analyticsRepository.save(a);
        audit.record(currentUser.currentUserId(), "GENERATE_ANALYTICS", "Analytics");
        log.info("Analytics snapshot id={} completion={}% compliance={}%",
                saved.getAnalyticsId(), completionRate, complianceRate);
        return analyticsMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse latestAnalytics() {
        return analyticsRepository.findTopByOrderByGeneratedAtDesc()
                .map(analyticsMapper::toResponse).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        return DashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalPatients(patientRepository.count())
                .totalTrials(trialRepository.count())
                .activeTrials(trialRepository.countByStatus(TrialStatus.ACTIVE))
                .totalReports(reportRepository.count())
                .latestSnapshot(latestAnalytics())
                .build();
    }

    /* ------------------------------------------------------------------ */

    /** value*100/denominator rounded to 2dp (HALF_UP); 0 when denominator <= 0. */
    private BigDecimal ratio(long numerator, long denominator) {
        if (denominator <= 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(denominator), 2, RoundingMode.HALF_UP);
    }

    private void notifyActor(String title, String message) {
        try {
            notifier.notify(currentUser.currentUserId(), title, message);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
    }
}
