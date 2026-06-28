package com.ctms.security;

import com.ctms.config.SecurityConfig;
import com.ctms.config.WebConfig;
import com.ctms.controller.AuthController;
import com.ctms.controller.TrialController;
import com.ctms.controller.UserController;
import com.ctms.dto.response.AuthResponse;
import com.ctms.dto.response.UserResponse;
import com.ctms.repository.UserRepository;
import com.ctms.repository.UserSessionRepository;
import com.ctms.service.AuthService;
import com.ctms.service.TrialService;
import com.ctms.service.UserService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves the RBAC fix end-to-end at the web layer, using the REAL
 * {@link SecurityConfig} (filter chain, role hierarchy, method security) with
 * mocked services and repositories:
 *
 * <ul>
 *   <li>Anonymous requests to protected endpoints are rejected 401 with the
 *       JSON {@code ApiResponse} envelope (the original vulnerability allowed
 *       them through as the system Admin).</li>
 *   <li>An authenticated user with the WRONG role receives 403 — a Doctor or
 *       Participant can no longer call Admin APIs.</li>
 *   <li>The RIGHT role receives 200, and ADMIN inherits functional-role access
 *       through the {@code RoleHierarchy} bean.</li>
 *   <li>Ownership expressions delegate to {@code @accessGuard}: a Participant
 *       may read their own user record but nobody else's.</li>
 *   <li>{@code /api/auth/login} stays public.</li>
 * </ul>
 *
 * <p>{@code ctms.security.enabled=true} so the dev fallback never engages. The
 * hardening filters are excluded exactly as in {@code PatientControllerTest};
 * {@link SessionTokenAuthenticationFilter} itself is left in the chain (its
 * repositories are mocked, and with no token it simply leaves the
 * {@code @WithMockUser} authentication untouched).</p>
 */
@WebMvcTest(controllers = {UserController.class, TrialController.class, AuthController.class},
        properties = "ctms.security.enabled=true",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {WebConfig.class,
                        CorrelationIdFilter.class, SecurityHeadersFilter.class, RateLimitFilter.class}))
@Import(SecurityConfig.class)
@EnableConfigurationProperties({com.ctms.config.CtmsSecurityProperties.class,
        com.ctms.config.CtmsCorsProperties.class})
class RbacSecurityTest {

    @Autowired private MockMvc mockMvc;

    // Controller collaborators
    @MockBean private UserService userService;
    @MockBean private TrialService trialService;
    @MockBean private AuthService authService;

    // SessionTokenAuthenticationFilter collaborators
    @MockBean private UserSessionRepository userSessionRepository;
    @MockBean private UserRepository userRepository;
    @MockBean private CurrentUserContext currentUserContext;

    // Ownership guard referenced as @accessGuard in SpEL (Mockito default = false → fail closed)
    @MockBean(name = "accessGuard") private AccessGuard accessGuard;

    /* ------------------------------------------------------------------ */
    /* 401 — anonymous                                                     */
    /* ------------------------------------------------------------------ */

    @Test
    @WithAnonymousUser
    @DisplayName("Anonymous request to a protected endpoint -> 401 JSON envelope (was: acted as Admin)")
    void anonymous_isRejected401() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    /* ------------------------------------------------------------------ */
    /* 403 — wrong role (the reported bug)                                 */
    /* ------------------------------------------------------------------ */

    @Test
    @WithMockUser(roles = "DOCTOR")
    @DisplayName("Doctor calling Admin API GET /api/users -> 403")
    void doctor_cannotListUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant calling staff API GET /api/trials -> 403")
    void participant_cannotListTrials() throws Exception {
        mockMvc.perform(get("/api/trials"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant reading ANOTHER user's record -> 403 (guard denies)")
    void participant_cannotReadOtherUser() throws Exception {
        when(accessGuard.isSelf(99)).thenReturn(false);
        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isForbidden());
    }

    /* ------------------------------------------------------------------ */
    /* 200 — right role / ownership / hierarchy                            */
    /* ------------------------------------------------------------------ */

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin GET /api/users -> 200")
    void admin_listsUsers() throws Exception {
        Page<UserResponse> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(userService.listUsers(any())).thenReturn(page);
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("Admin GET /api/trials -> 200 via RoleHierarchy (ADMIN implies functional roles)")
    void admin_inheritsFunctionalAccess() throws Exception {
        when(trialService.listTrials(any()))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        mockMvc.perform(get("/api/trials"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PARTICIPANT")
    @DisplayName("Participant reading their OWN user record -> 200 (guard allows)")
    void participant_readsOwnUser() throws Exception {
        when(accessGuard.isSelf(7)).thenReturn(true);
        when(userService.getUser(eq(7))).thenReturn(UserResponse.builder().userId(7).build());
        mockMvc.perform(get("/api/users/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(7));
    }

    /* ------------------------------------------------------------------ */
    /* Public endpoint                                                     */
    /* ------------------------------------------------------------------ */

    @Test
    @WithAnonymousUser
    @DisplayName("POST /api/auth/login stays public -> 200 without any token")
    void login_isPublic() throws Exception {
        when(authService.login(anyString(), anyString(), anyString()))
                .thenReturn(AuthResponse.builder().token("t").userId(1).username("admin").build());
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"admin\",\"password\":\"Admin@123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").value("t"));
    }
}
