package com.ctms.config;

import com.ctms.security.RestAccessDeniedHandler;
import com.ctms.security.RestAuthenticationEntryPoint;
import com.ctms.security.SessionTokenAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Spring Security configuration (RBAC fix). Replaces the unenforced
 * interceptor-only model with the standard two-layer design:
 *
 * <ol>
 *   <li><b>Authentication (this filter chain)</b> — every request passes through
 *       {@link SessionTokenAuthenticationFilter}, which resolves the opaque
 *       session token from {@code user_sessions} into an
 *       {@code Authentication} carrying exactly one {@code ROLE_*} authority.
 *       Anything under {@code /api/**} other than {@code /api/auth/login}
 *       requires an authenticated caller; Swagger, the OpenAPI document and the
 *       health/info actuator probes stay public.</li>
 *   <li><b>Authorization (method security)</b> — {@code @PreAuthorize} on every
 *       controller method enforces the role matrix documented in
 *       {@code docs/SECURITY_AUDIT_RBAC.md}, with record-level ownership checks
 *       delegated to {@code @accessGuard} (see
 *       {@link com.ctms.security.AccessGuard}).</li>
 * </ol>
 *
 * <p><b>Role hierarchy</b> — {@code SUPER_ADMIN > ADMIN > each functional role}.
 * Because of the hierarchy, controller annotations only list the <i>minimum</i>
 * functional role; Admin (and the reserved, currently unseeded Super Admin)
 * inherit access everywhere without being repeated in every expression. Since
 * Spring Security 6.3 (Boot 3.3.x) the {@link RoleHierarchy} bean is picked up
 * by method security automatically — no custom expression handler needed.</p>
 *
 * <p>CSRF is disabled deliberately: the API is stateless and authenticates via
 * an Authorization header, never via cookies, so cross-site request forgery has
 * no vector. CORS moved here from {@code WebConfig} so pre-flight requests are
 * answered by the security chain itself.</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final SessionTokenAuthenticationFilter sessionTokenAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final CtmsSecurityProperties securityProperties;
    private final CtmsCorsProperties corsProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        if (!securityProperties.isEnabled()) {
            log.warn("==================================================================");
            log.warn("ctms.security.enabled=false  ->  DEV MODE");
            log.warn("Unauthenticated requests act as system user id={} (seeded Admin).",
                    securityProperties.getSystemUserId());
            log.warn("NEVER run production with this flag off.");
            log.warn("==================================================================");
        }

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
            .authorizeHttpRequests(auth -> auth
                    // -------- public --------
                    .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                    .requestMatchers("/error").permitAll()
                    // -------- everything else: authenticated; roles enforced by
                    //          @PreAuthorize on each controller method --------
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().authenticated())
            .addFilterBefore(sessionTokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * SUPER_ADMIN inherits ADMIN; ADMIN inherits every functional role. The
     * functional roles (Manager, Clinical Manager, Doctor, Participant) are
     * deliberate peers — none inherits another.
     */
    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.withDefaultRolePrefix()
                .role("SUPER_ADMIN").implies("ADMIN")
                .role("ADMIN").implies("TRIAL_MANAGER", "CLINICAL_MANAGER", "DOCTOR", "PARTICIPANT")
                .build();
    }

    /** CORS source built from the existing {@code ctms.cors.*} properties. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsProperties.getAllowedOrigins());
        config.setAllowedMethods(corsProperties.getAllowedMethods());
        config.setAllowedHeaders(corsProperties.getAllowedHeaders());
        config.setExposedHeaders(corsProperties.getExposedHeaders());
        config.setAllowCredentials(corsProperties.isAllowCredentials());
        config.setMaxAge(corsProperties.getMaxAge());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
