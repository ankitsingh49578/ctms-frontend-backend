package com.ctms.controller;

import com.ctms.config.WebConfig;
import com.ctms.dto.response.PatientResponse;
import com.ctms.security.SessionTokenAuthenticationFilter;
import com.ctms.service.ParticipantService;
import com.ctms.web.CorrelationIdFilter;
import com.ctms.web.RateLimitFilter;
import com.ctms.web.SecurityHeadersFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web-layer test for {@link PatientController} using the MVC slice. Spring
 * Security auto-config, the session-token filter, CORS config and hardening
 * filters are excluded so the slice only
 * wires the controller + Jackson + the (mocked) service — keeping the test fast
 * and independent of security/DB concerns. Confirms that pagination params bind
 * and the {@code ApiResponse<Page<...>>} envelope is produced.
 */
@WebMvcTest(controllers = PatientController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {WebConfig.class, SessionTokenAuthenticationFilter.class,
                        CorrelationIdFilter.class, SecurityHeadersFilter.class, RateLimitFilter.class}))
class PatientControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private ParticipantService participantService;

    @Test
    @DisplayName("GET /api/patients returns 200 with a paged ApiResponse envelope")
    void list_isPaged() throws Exception {
        PatientResponse p = PatientResponse.builder()
                .patientId(1)
                .patientCode("PAT-0001")
                .firstName("Ada")
                .lastName("Lovelace")
                .build();
        Page<PatientResponse> page = new PageImpl<>(List.of(p), PageRequest.of(0, 20), 1);
        when(participantService.listParticipants(any())).thenReturn(page);

        mockMvc.perform(get("/api/patients").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }
}
