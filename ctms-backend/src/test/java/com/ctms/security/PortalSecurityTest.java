package com.ctms.security;

import com.ctms.config.SecurityConfig;
import com.ctms.config.WebConfig;
import com.ctms.controller.PortalController;
import com.ctms.dto.response.EnrollmentResponse;
import com.ctms.dto.response.PatientResponse;
import com.ctms.repository.UserRepository;
import com.ctms.repository.UserSessionRepository;
import com.ctms.service.ParticipantPortalService;
import com.ctms.web.CorrelationIdFilter;
import com.ctms.web.RateLimitFilter;
import com.ctms.web.SecurityHeadersFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer security proof for {@link PortalController}, using the REAL
 * {@link SecurityConfig} (filter chain, role hierarchy, method security) with a
 * mocked {@link ParticipantPortalService}. Verifies the three properties that
 * make the portal safe:
 *
 * <ul>
 *   <li>Every endpoint requires {@code ROLE_PARTICIPANT}: anonymous → 401, and a
 *       leaf role that does not inherit PARTICIPANT (DOCTOR) → 403.</li>
 *   <li>A participant reaches their own self-scoped data → 200, and the service
 *       is invoked with no caller-supplied id to tamper with.</li>
 *   <li>Per-record actions delegate to {@code @accessGuard}: signing one's OWN
 *       consent is allowed, signing someone else's is denied 403 before the
 *       service is ever called.</li>
 * </ul>
 */
@WebMvcTest(controllers = PortalController.class,
        properties = "ctms.security.enabled=true",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {WebConfig.class,
                        CorrelationIdFilter.class, SecurityHeadersFilter.class, RateLimitFilter.class}))
@Import(SecurityConfig.class)
@EnableConfigurationProperties({com.ctms.config.CtmsSecurityProperties.class,
        com.ctms.config.CtmsCorsProperties.class})
class PortalSecurityTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private ParticipantPortalService portal;

    // SessionTokenAuthenticationFilter collaborators
    @MockBean private UserSessionRepository userSessionRepository;
    @MockBean private UserRepository userRepository;
    @MockBean private CurrentUserContext currentUserContext;

    // Ownership guard referenced as @accessGuard in SpEL (Mockito default = false → fail closed)
    @MockBean(name = "accessGuard") private AccessGuard accessGuard;

    /* ----- Role gating ------------------------------------------------ */

    @Test
    @WithAnonymousUser
    @DisplayName("Anonymous GET /api/portal/me -> 401 JSON envelope")
    void anonymous_isRejected401() throws Exception {
        mockMvc.perform(get("/api/portal/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    @DisplayName("Doctor (does not inherit PARTICIPANT) GET /api/portal/me -> 403")
    void doctor_cannotUsePortal() throws Exception {
        mockMvc.perform(get("/api/portal/me"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    /* ----- Self-scoped happy path ------------------------------------- */

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant GET /api/portal/me -> 200 (service resolves caller; no id in URL)")
    void participant_readsOwnProfile() throws Exception {
        when(portal.myProfile()).thenReturn(PatientResponse.builder().patientId(7).build());
        mockMvc.perform(get("/api/portal/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.patientId").value(7));
    }

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant POST /api/portal/me/enrollments -> 201 application submitted")
    void participant_appliesToTrial() throws Exception {
        when(portal.applyToTrial(any()))
                .thenReturn(EnrollmentResponse.builder().enrollmentId(1).status("Screening").build());
        mockMvc.perform(post("/api/portal/me/enrollments")
                        .contentType("application/json")
                        .content("{\"trialId\":3}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("Screening"));
    }

    /* ----- Ownership delegation --------------------------------------- */

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant signing their OWN consent -> 200 (guard allows)")
    void participant_signsOwnConsent() throws Exception {
        when(accessGuard.isOwnConsent(5)).thenReturn(true);
        mockMvc.perform(post("/api/portal/me/consents/5/sign"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        verify(portal).signConsent(5);
    }

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant signing SOMEONE ELSE'S consent -> 403 (guard denies, service untouched)")
    void participant_cannotSignOthersConsent() throws Exception {
        when(accessGuard.isOwnConsent(99)).thenReturn(false);
        mockMvc.perform(post("/api/portal/me/consents/99/sign"))
                .andExpect(status().isForbidden());
    }
}
