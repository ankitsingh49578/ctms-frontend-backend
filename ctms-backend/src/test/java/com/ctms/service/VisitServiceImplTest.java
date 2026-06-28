package com.ctms.service;

import com.ctms.entity.VisitSchedule;
import com.ctms.enums.VisitStatus;
import com.ctms.exception.BusinessException;
import com.ctms.mapper.VisitMapper;
import com.ctms.repository.ClinicalManagerRepository;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.VisitScheduleRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.impl.VisitServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Verifies the visit lifecycle guard added in PHASE 6. COMPLETED and CANCELLED
 * are terminal; a MISSED visit cannot be marked MISSED again. Illegal
 * transitions raise a {@link BusinessException} (HTTP 422) and are not persisted.
 */
@ExtendWith(MockitoExtension.class)
class VisitServiceImplTest {

    @Mock private VisitScheduleRepository visitRepository;
    @Mock private TrialRepository trialRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private ClinicalManagerRepository managerRepository;
    @Mock private AuditService audit;
    @Mock private NotificationService notifier;
    @Mock private CurrentUserContext currentUser;
    @Mock private VisitMapper visitMapper;

    @InjectMocks private VisitServiceImpl visitService;

    private VisitSchedule visitWith(VisitStatus status) {
        VisitSchedule v = new VisitSchedule();
        v.setVisitId(55);
        v.setVisitStatus(status);
        return v;
    }

    @Test
    @DisplayName("SCHEDULED -> COMPLETED is allowed")
    void complete_fromScheduled_ok() throws Exception {
        VisitSchedule v = visitWith(VisitStatus.SCHEDULED);
        when(visitRepository.findById(55)).thenReturn(Optional.of(v));

        visitService.markCompleted(55, LocalDate.now());

        assertEquals(VisitStatus.COMPLETED, v.getVisitStatus());
        assertNotNull(v.getActualDate());
        verify(visitRepository).save(v);
    }

    @Test
    @DisplayName("COMPLETED -> COMPLETED is rejected (terminal)")
    void complete_fromCompleted_rejected() {
        VisitSchedule v = visitWith(VisitStatus.COMPLETED);
        when(visitRepository.findById(55)).thenReturn(Optional.of(v));

        assertThrows(BusinessException.class, () -> visitService.markCompleted(55, LocalDate.now()));
        verify(visitRepository, never()).save(any());
    }

    @Test
    @DisplayName("CANCELLED -> COMPLETED is rejected (terminal)")
    void complete_fromCancelled_rejected() {
        VisitSchedule v = visitWith(VisitStatus.CANCELLED);
        when(visitRepository.findById(55)).thenReturn(Optional.of(v));

        assertThrows(BusinessException.class, () -> visitService.markCompleted(55, null));
        verify(visitRepository, never()).save(any());
    }

    @Test
    @DisplayName("SCHEDULED -> MISSED is allowed")
    void miss_fromScheduled_ok() throws Exception {
        VisitSchedule v = visitWith(VisitStatus.SCHEDULED);
        when(visitRepository.findById(55)).thenReturn(Optional.of(v));

        visitService.markMissed(55);

        assertEquals(VisitStatus.MISSED, v.getVisitStatus());
        verify(visitRepository).save(v);
    }

    @Test
    @DisplayName("MISSED -> MISSED is rejected")
    void miss_fromMissed_rejected() {
        VisitSchedule v = visitWith(VisitStatus.MISSED);
        when(visitRepository.findById(55)).thenReturn(Optional.of(v));

        assertThrows(BusinessException.class, () -> visitService.markMissed(55));
        verify(visitRepository, never()).save(any());
    }

    @Test
    @DisplayName("CANCELLED -> CANCEL is rejected (terminal)")
    void cancel_fromCancelled_rejected() {
        VisitSchedule v = visitWith(VisitStatus.CANCELLED);
        when(visitRepository.findById(55)).thenReturn(Optional.of(v));

        assertThrows(BusinessException.class, () -> visitService.cancelVisit(55));
        verify(visitRepository, never()).save(any());
    }
}
