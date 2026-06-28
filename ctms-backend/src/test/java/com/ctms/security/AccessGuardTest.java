package com.ctms.security;

import com.ctms.enums.RoleType;
import com.ctms.repository.AdverseEventRepository;
import com.ctms.repository.ConsentFormRepository;
import com.ctms.repository.DoctorRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.NotificationRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TestResultRepository;
import com.ctms.repository.TrialAssignmentRepository;
import com.ctms.repository.VisitScheduleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link AccessGuard}: the SpEL-referenced ownership bean must be
 * strictly FAIL-CLOSED — any missing principal, null id, wrong principal type or
 * absent DB link returns {@code false} (which surfaces as 403, never as a leak).
 */
@ExtendWith(MockitoExtension.class)
class AccessGuardTest {

    @Mock private PatientRepository patientRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private VisitScheduleRepository visitScheduleRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private ConsentFormRepository consentFormRepository;
    @Mock private TestResultRepository testResultRepository;
    @Mock private AdverseEventRepository adverseEventRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private TrialAssignmentRepository trialAssignmentRepository;

    @InjectMocks private AccessGuard guard;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void loginAs(int userId, RoleType role) {
        AuthenticatedUser principal = new AuthenticatedUser(userId, "u" + userId, role);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))));
    }

    /* ---------------- fail-closed basics ---------------- */

    @Test
    @DisplayName("No authentication at all -> every check is false and no repository is touched")
    void anonymous_failsClosed() {
        assertFalse(guard.isSelf(1));
        assertFalse(guard.isOwnPatient(1));
        assertFalse(guard.canViewPatient(1));
        assertFalse(guard.managesTrial(1));
        verifyNoInteractions(patientRepository, visitScheduleRepository, trialAssignmentRepository);
    }

    @Test
    @DisplayName("Principal that is not an AuthenticatedUser (e.g. plain String) -> false")
    void foreignPrincipal_failsClosed() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("someStringPrincipal", null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        assertFalse(guard.isSelf(1));
    }

    @Test
    @DisplayName("Null target id -> false")
    void nullId_failsClosed() {
        loginAs(5, RoleType.PARTICIPANT);
        assertFalse(guard.isSelf(null));
        assertFalse(guard.isOwnPatient(null));
    }

    /* ---------------- identity ---------------- */

    @Test
    @DisplayName("isSelf is true only for the caller's own userId")
    void isSelf() {
        loginAs(7, RoleType.PARTICIPANT);
        assertTrue(guard.isSelf(7));
        assertFalse(guard.isSelf(8));
    }

    /* ---------------- participant ownership ---------------- */

    @Test
    @DisplayName("isOwnPatient delegates to patients.user_id link")
    void isOwnPatient() {
        loginAs(7, RoleType.PARTICIPANT);
        when(patientRepository.existsByPatientIdAndUser_UserId(3, 7)).thenReturn(true);
        assertTrue(guard.isOwnPatient(3));
        assertFalse(guard.isOwnPatient(4));
    }

    /* ---------------- doctor assignment ---------------- */

    @Test
    @DisplayName("isAssignedDoctor requires DOCTOR role AND a visit_schedule link")
    void isAssignedDoctor_requiresRoleAndLink() {
        loginAs(9, RoleType.DOCTOR);
        when(visitScheduleRepository.existsByDoctor_User_UserIdAndPatient_PatientId(9, 3))
                .thenReturn(true);
        assertTrue(guard.isAssignedDoctor(3));

        // Same DB link but the caller is NOT a doctor -> false without a query.
        loginAs(9, RoleType.CLINICAL_MANAGER);
        assertFalse(guard.isAssignedDoctor(3));
    }

    @Test
    @DisplayName("canViewPatient = own record OR assigned doctor")
    void canViewPatient() {
        loginAs(9, RoleType.DOCTOR);
        when(patientRepository.existsByPatientIdAndUser_UserId(3, 9)).thenReturn(false);
        when(visitScheduleRepository.existsByDoctor_User_UserIdAndPatient_PatientId(9, 3))
                .thenReturn(true);
        assertTrue(guard.canViewPatient(3));
    }

    /* ---------------- trial scoping ---------------- */

    @Test
    @DisplayName("managesTrial is true only when a trial_assignments row links the caller")
    void managesTrial() {
        loginAs(4, RoleType.CLINICAL_MANAGER);
        when(trialAssignmentRepository.existsByTrial_TrialIdAndManager_User_UserId(11, 4))
                .thenReturn(true);
        assertTrue(guard.managesTrial(11));
        assertFalse(guard.managesTrial(12));
    }
}
