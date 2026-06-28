package com.ctms.service;

import com.ctms.dto.request.CreateEnrollmentRequest;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.entity.Enrollment;
import com.ctms.entity.Patient;
import com.ctms.entity.Trial;
import com.ctms.enums.EnrollmentStatus;
import com.ctms.enums.TrialStatus;
import com.ctms.exception.ValidationException;
import com.ctms.mapper.EnrollmentMapper;
import com.ctms.mapper.PatientMapper;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.repository.UserRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.impl.ParticipantServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito tests for the enrollment business rules preserved in
 * {@link ParticipantServiceImpl}: a participant can only enroll into an ACTIVE
 * trial and cannot be enrolled into the same trial twice.
 */
@ExtendWith(MockitoExtension.class)
class ParticipantServiceImplTest {

    @Mock private PatientRepository patientRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private TrialRepository trialRepository;
    @Mock private UserRepository userRepository;
    @Mock private AuditService audit;
    @Mock private NotificationService notifier;
    @Mock private CurrentUserContext currentUser;
    @Mock private PatientMapper patientMapper;
    @Mock private EnrollmentMapper enrollmentMapper;

    @InjectMocks private ParticipantServiceImpl participantService;

    private CreateEnrollmentRequest request(int patientId, int trialId) {
        CreateEnrollmentRequest r = new CreateEnrollmentRequest();
        r.setPatientId(patientId);
        r.setTrialId(trialId);
        return r;
    }

    private Trial trialWith(TrialStatus status) {
        Trial t = new Trial();
        t.setTrialId(3);
        t.setStatus(status);
        return t;
    }

    @Test
    @DisplayName("enroll: unverified (Pending) participant -> ValidationException, nothing persisted")
    void enroll_unverifiedPatient() {
        Patient pending = new Patient();
        pending.setStatus("Pending");
        when(patientRepository.findById(1)).thenReturn(Optional.of(pending));

        assertThrows(ValidationException.class, () -> participantService.enroll(request(1, 3)));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("enroll: trial not ACTIVE -> ValidationException, nothing persisted")
    void enroll_trialNotActive() {
        when(patientRepository.findById(1)).thenReturn(Optional.of(new Patient()));
        when(trialRepository.findById(3)).thenReturn(Optional.of(trialWith(TrialStatus.PENDING)));

        assertThrows(ValidationException.class, () -> participantService.enroll(request(1, 3)));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("enroll: duplicate enrollment -> ValidationException")
    void enroll_duplicate() {
        when(patientRepository.findById(1)).thenReturn(Optional.of(new Patient()));
        when(trialRepository.findById(3)).thenReturn(Optional.of(trialWith(TrialStatus.ACTIVE)));
        when(enrollmentRepository.existsByPatient_PatientIdAndTrial_TrialId(1, 3)).thenReturn(true);

        assertThrows(ValidationException.class, () -> participantService.enroll(request(1, 3)));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("enroll: happy path persists a SCREENING enrollment")
    void enroll_happyPath() throws Exception {
        when(patientRepository.findById(1)).thenReturn(Optional.of(new Patient()));
        when(trialRepository.findById(3)).thenReturn(Optional.of(trialWith(TrialStatus.ACTIVE)));
        when(enrollmentRepository.existsByPatient_PatientIdAndTrial_TrialId(1, 3)).thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(inv -> {
            Enrollment e = inv.getArgument(0);
            e.setEnrollmentId(900);
            return e;
        });
        when(enrollmentMapper.toResponse(any(Enrollment.class))).thenReturn(mock(EnrollmentResponse.class));

        participantService.enroll(request(1, 3));

        ArgumentCaptor<Enrollment> captor = ArgumentCaptor.forClass(Enrollment.class);
        verify(enrollmentRepository).save(captor.capture());
        assertEquals(EnrollmentStatus.SCREENING, captor.getValue().getStatus());
        assertNotNull(captor.getValue().getEnrollmentDate());
    }
}
