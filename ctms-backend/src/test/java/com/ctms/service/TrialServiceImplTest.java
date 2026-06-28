package com.ctms.service;

import com.ctms.entity.Trial;
import com.ctms.entity.Enrollment;
import com.ctms.entity.AdverseEvent;
import com.ctms.entity.Patient;
import com.ctms.enums.EnrollmentStatus;
import com.ctms.enums.Severity;
import com.ctms.enums.AdverseEventStatus;
import com.ctms.dto.response.TrialDetailsResponse;
import com.ctms.dto.response.TrialResponse;
import com.ctms.exception.ResourceNotFoundException;
import com.ctms.mapper.TrialMapper;
import com.ctms.repository.*;
import com.ctms.service.impl.TrialServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrialServiceImplTest {

    @Mock private TrialRepository trialRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private VisitScheduleRepository visitRepository;
    @Mock private ConsentFormRepository consentRepository;
    @Mock private AdverseEventRepository adverseEventRepository;
    @Mock private TestResultRepository testResultRepository;

    private TrialServiceImpl trialService;

    @BeforeEach
    void setUp() {
        trialService = new TrialServiceImpl(
            trialRepository,
            null,
            null,
            null,
            null,
            null,
            null,
            new TrialMapper(),
            null,
            enrollmentRepository,
            visitRepository,
            consentRepository,
            adverseEventRepository,
            testResultRepository
        );
    }

    @Test
    @DisplayName("getTrialDetails calculations when enrolled is 0")
    void getTrialDetails_zeroEnrolled_handlesDivisionByZero() throws Exception {
        int trialId = 1;
        Trial trial = new Trial();
        trial.setTrialId(trialId);

        when(trialRepository.findById(trialId)).thenReturn(Optional.of(trial));
        when(enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId)).thenReturn(Collections.emptyList());
        when(visitRepository.findByTrial_TrialIdOrderByScheduledDateAsc(trialId)).thenReturn(Collections.emptyList());
        when(consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId)).thenReturn(Collections.emptyList());
        when(adverseEventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId)).thenReturn(Collections.emptyList());
        when(testResultRepository.findByVisit_Trial_TrialIdOrderByCollectedDateDesc(trialId)).thenReturn(Collections.emptyList());

        TrialDetailsResponse details = trialService.getTrialDetails(trialId);

        assertEquals(0, details.getTotalEnrolled());
        assertEquals(0, details.getTotalAdverseEvents());
        assertEquals(0.0, details.getSuccessRate());
    }

    @Test
    @DisplayName("getTrialDetails normal calculation (95% success rate)")
    void getTrialDetails_normalRate_calculatesCorrectly() throws Exception {
        int trialId = 1;
        Trial trial = new Trial();
        trial.setTrialId(trialId);

        // 100 enrolled participants
        List<Enrollment> enrollments = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            Enrollment e = new Enrollment();
            e.setStatus(EnrollmentStatus.ENROLLED);
            enrollments.add(e);
        }

        // 5 adverse events from 5 unique patients
        List<AdverseEvent> aes = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            AdverseEvent ae = new AdverseEvent();
            ae.setSeverity(Severity.MILD);
            ae.setStatus(AdverseEventStatus.REPORTED);
            Patient p = new Patient();
            p.setPatientId(i + 1);
            ae.setPatient(p);
            aes.add(ae);
        }

        when(trialRepository.findById(trialId)).thenReturn(Optional.of(trial));
        when(enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId)).thenReturn(enrollments);
        when(visitRepository.findByTrial_TrialIdOrderByScheduledDateAsc(trialId)).thenReturn(Collections.emptyList());
        when(consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId)).thenReturn(Collections.emptyList());
        when(adverseEventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId)).thenReturn(aes);
        when(testResultRepository.findByVisit_Trial_TrialIdOrderByCollectedDateDesc(trialId)).thenReturn(Collections.emptyList());

        TrialDetailsResponse details = trialService.getTrialDetails(trialId);

        assertEquals(100, details.getTotalEnrolled());
        assertEquals(5, details.getTotalAdverseEvents());
        assertEquals(95.0, details.getSuccessRate());
    }

    @Test
    @DisplayName("getTrialDetails handles rounding and bounds (no negative success rate)")
    void getTrialDetails_excessiveAdverseEvents_capsSuccessRateAtZero() throws Exception {
        int trialId = 1;
        Trial trial = new Trial();
        trial.setTrialId(trialId);

        // 10 enrolled participants
        List<Enrollment> enrollments = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Enrollment e = new Enrollment();
            e.setStatus(EnrollmentStatus.ENROLLED);
            enrollments.add(e);
        }

        // 15 adverse events (from 15 unique patients)
        List<AdverseEvent> aes = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            AdverseEvent ae = new AdverseEvent();
            ae.setSeverity(Severity.MILD);
            ae.setStatus(AdverseEventStatus.REPORTED);
            Patient p = new Patient();
            p.setPatientId(i + 1);
            ae.setPatient(p);
            aes.add(ae);
        }

        when(trialRepository.findById(trialId)).thenReturn(Optional.of(trial));
        when(enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId)).thenReturn(enrollments);
        when(visitRepository.findByTrial_TrialIdOrderByScheduledDateAsc(trialId)).thenReturn(Collections.emptyList());
        when(consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId)).thenReturn(Collections.emptyList());
        when(adverseEventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId)).thenReturn(aes);
        when(testResultRepository.findByVisit_Trial_TrialIdOrderByCollectedDateDesc(trialId)).thenReturn(Collections.emptyList());

        TrialDetailsResponse details = trialService.getTrialDetails(trialId);

        assertEquals(10, details.getTotalEnrolled());
        assertEquals(15, details.getTotalAdverseEvents());
        assertEquals(0.0, details.getSuccessRate()); // capped at 0%, no negative
    }

    @Test
    @DisplayName("getTrialDetails rounds to 2 decimal places")
    void getTrialDetails_fractionalRate_roundsCorrectly() throws Exception {
        int trialId = 1;
        Trial trial = new Trial();
        trial.setTrialId(trialId);

        // 3 enrolled participants
        List<Enrollment> enrollments = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            Enrollment e = new Enrollment();
            e.setStatus(EnrollmentStatus.ENROLLED);
            enrollments.add(e);
        }

        // 1 adverse event
        List<AdverseEvent> aes = new ArrayList<>();
        AdverseEvent ae = new AdverseEvent();
        ae.setSeverity(Severity.MILD);
        ae.setStatus(AdverseEventStatus.REPORTED);
        Patient p = new Patient();
        p.setPatientId(1);
        ae.setPatient(p);
        aes.add(ae);

        // Success rate: (3 - 1) / 3 * 100 = 66.66666... % -> should round to 66.67%

        when(trialRepository.findById(trialId)).thenReturn(Optional.of(trial));
        when(enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId)).thenReturn(enrollments);
        when(visitRepository.findByTrial_TrialIdOrderByScheduledDateAsc(trialId)).thenReturn(Collections.emptyList());
        when(consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId)).thenReturn(Collections.emptyList());
        when(adverseEventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId)).thenReturn(aes);
        when(testResultRepository.findByVisit_Trial_TrialIdOrderByCollectedDateDesc(trialId)).thenReturn(Collections.emptyList());

        TrialDetailsResponse details = trialService.getTrialDetails(trialId);

        assertEquals(3, details.getTotalEnrolled());
        assertEquals(1, details.getTotalAdverseEvents());
        assertEquals(66.67, details.getSuccessRate());
    }

    @Test
    @DisplayName("getTrialDetails counts multiple adverse events for the same patient only once")
    void getTrialDetails_multipleAesForSamePatient_countsOnce() throws Exception {
        int trialId = 1;
        Trial trial = new Trial();
        trial.setTrialId(trialId);

        // 10 enrolled participants
        List<Enrollment> enrollments = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Enrollment e = new Enrollment();
            e.setStatus(EnrollmentStatus.ENROLLED);
            enrollments.add(e);
        }

        // 5 adverse events but only for 2 unique patients (patient 1 and patient 2)
        List<AdverseEvent> aes = new ArrayList<>();
        int[] patientIds = {1, 1, 2, 2, 2};
        for (int pid : patientIds) {
            AdverseEvent ae = new AdverseEvent();
            ae.setSeverity(Severity.MILD);
            ae.setStatus(AdverseEventStatus.REPORTED);
            Patient p = new Patient();
            p.setPatientId(pid);
            ae.setPatient(p);
            aes.add(ae);
        }

        // Expected unique patients with AE: 2.
        // Success rate: (10 - 2) / 10 * 100 = 80.0%

        when(trialRepository.findById(trialId)).thenReturn(Optional.of(trial));
        when(enrollmentRepository.findByTrial_TrialIdOrderByEnrollmentIdDesc(trialId)).thenReturn(enrollments);
        when(visitRepository.findByTrial_TrialIdOrderByScheduledDateAsc(trialId)).thenReturn(Collections.emptyList());
        when(consentRepository.findByTrial_TrialIdOrderByConsentIdDesc(trialId)).thenReturn(Collections.emptyList());
        when(adverseEventRepository.findByTrial_TrialIdOrderByEventDateDesc(trialId)).thenReturn(aes);
        when(testResultRepository.findByVisit_Trial_TrialIdOrderByCollectedDateDesc(trialId)).thenReturn(Collections.emptyList());

        TrialDetailsResponse details = trialService.getTrialDetails(trialId);

        assertEquals(10, details.getTotalEnrolled());
        assertEquals(5, details.getTotalAdverseEvents()); // total events count is still 5
        assertEquals(80.0, details.getSuccessRate()); // based on 2 unique patients
    }
}
