package com.ctms.service;

import com.ctms.entity.ConsentForm;
import com.ctms.enums.ConsentStatus;
import com.ctms.exception.BusinessException;
import com.ctms.mapper.ConsentMapper;
import com.ctms.repository.ConsentFormRepository;
import com.ctms.repository.EnrollmentRepository;
import com.ctms.repository.PatientRepository;
import com.ctms.repository.TrialRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.impl.ConsentServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Verifies the consent lifecycle guard added in PHASE 5. Allowed:
 * PENDING→SIGNED, PENDING→DECLINED, SIGNED→WITHDRAWN. Everything else is
 * rejected with a {@link BusinessException} (mapped to HTTP 422).
 */
@ExtendWith(MockitoExtension.class)
class ConsentServiceImplTest {

    @Mock private ConsentFormRepository consentRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private TrialRepository trialRepository;
    @Mock private AuditService audit;
    @Mock private CurrentUserContext currentUser;
    @Mock private ConsentMapper consentMapper;

    @InjectMocks private ConsentServiceImpl consentService;

    private ConsentForm formWith(ConsentStatus status) {
        ConsentForm f = new ConsentForm();
        f.setConsentId(100);
        f.setConsentStatus(status);
        return f;
    }

    @Test
    @DisplayName("PENDING -> SIGNED is allowed and persisted")
    void sign_fromPending_ok() throws Exception {
        ConsentForm f = formWith(ConsentStatus.PENDING);
        when(consentRepository.findById(100)).thenReturn(Optional.of(f));

        consentService.signConsent(100);

        assertEquals(ConsentStatus.SIGNED, f.getConsentStatus());
        verify(consentRepository).save(f);
    }

    @Test
    @DisplayName("PENDING -> DECLINED is allowed")
    void decline_fromPending_ok() throws Exception {
        ConsentForm f = formWith(ConsentStatus.PENDING);
        when(consentRepository.findById(100)).thenReturn(Optional.of(f));

        consentService.declineConsent(100);

        assertEquals(ConsentStatus.DECLINED, f.getConsentStatus());
        verify(consentRepository).save(f);
    }

    @Test
    @DisplayName("SIGNED -> WITHDRAWN is allowed")
    void withdraw_fromSigned_ok() throws Exception {
        ConsentForm f = formWith(ConsentStatus.SIGNED);
        when(consentRepository.findById(100)).thenReturn(Optional.of(f));

        consentService.withdrawConsent(100);

        assertEquals(ConsentStatus.WITHDRAWN, f.getConsentStatus());
        verify(consentRepository).save(f);
    }

    @Test
    @DisplayName("DECLINED -> SIGNED is rejected (422) and not persisted")
    void sign_fromDeclined_rejected() {
        ConsentForm f = formWith(ConsentStatus.DECLINED);
        when(consentRepository.findById(100)).thenReturn(Optional.of(f));

        assertThrows(BusinessException.class, () -> consentService.signConsent(100));
        assertEquals(ConsentStatus.DECLINED, f.getConsentStatus());
        verify(consentRepository, never()).save(any());
    }

    @Test
    @DisplayName("WITHDRAWN -> SIGNED is rejected (terminal state)")
    void sign_fromWithdrawn_rejected() {
        ConsentForm f = formWith(ConsentStatus.WITHDRAWN);
        when(consentRepository.findById(100)).thenReturn(Optional.of(f));

        assertThrows(BusinessException.class, () -> consentService.signConsent(100));
        verify(consentRepository, never()).save(any());
    }

    @Test
    @DisplayName("WITHDRAWN -> DECLINED is rejected (terminal state)")
    void decline_fromWithdrawn_rejected() {
        ConsentForm f = formWith(ConsentStatus.WITHDRAWN);
        when(consentRepository.findById(100)).thenReturn(Optional.of(f));

        assertThrows(BusinessException.class, () -> consentService.declineConsent(100));
        verify(consentRepository, never()).save(any());
    }
}
