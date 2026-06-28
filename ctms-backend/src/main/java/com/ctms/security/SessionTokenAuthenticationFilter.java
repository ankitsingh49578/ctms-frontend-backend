package com.ctms.security;

import com.ctms.config.CtmsSecurityProperties;
import com.ctms.entity.User;
import com.ctms.entity.UserSession;
import com.ctms.enums.RoleType;
import com.ctms.repository.UserRepository;
import com.ctms.repository.UserSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Replaces the former {@code AuthTokenInterceptor}. Runs inside the Spring
 * Security filter chain and translates the project's opaque session token
 * (kept from the legacy auth model, stored in {@code user_sessions}) into a
 * fully populated {@link org.springframework.security.core.Authentication}:
 *
 * <ol>
 *   <li>Reads {@code Authorization: Bearer <token>} (or {@code X-Auth-Token}).</li>
 *   <li>Looks the token up against active, unexpired {@code user_sessions} rows
 *       (expired sessions are auto-invalidated, preserving legacy behaviour).</li>
 *   <li>Maps the user's DB role name to a {@link RoleType} and grants the single
 *       authority {@code ROLE_<ENUM_NAME>} (e.g. role_name "Clinical Manager"
 *       → {@code ROLE_CLINICAL_MANAGER}). Unknown role names <b>fail closed</b>:
 *       the request stays anonymous and is rejected by the authorization layer.</li>
 *   <li>Populates the request-scoped {@link CurrentUserContext} so services keep
 *       resolving {@code created_by}/{@code uploaded_by}/{@code reported_by} and
 *       audit-log FKs exactly as before.</li>
 * </ol>
 *
 * <p><b>Never rejects a request itself.</b> Authentication failures simply leave
 * the SecurityContext empty; whether that results in 401 is decided by the
 * authorization rules in {@link com.ctms.config.SecurityConfig} (so the
 * permit-all {@code /api/auth/login} endpoint works even with a stale token).</p>
 *
 * <p><b>Dev fallback</b> — when {@code ctms.security.enabled=false}, requests
 * without a valid token are authenticated as the configured system user
 * (default id 1, the seeded Admin) so Swagger UI keeps working without a login.
 * This replicates the legacy "system user" behaviour but is now explicit,
 * logged, and OFF in the production default.</p>
 */
@Component
public class SessionTokenAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SessionTokenAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    private final CurrentUserContext currentUserContext;
    private final CtmsSecurityProperties properties;

    public SessionTokenAuthenticationFilter(UserSessionRepository userSessionRepository,
                                            UserRepository userRepository,
                                            CurrentUserContext currentUserContext,
                                            CtmsSecurityProperties properties) {
        this.userSessionRepository = userSessionRepository;
        this.userRepository = userRepository;
        this.currentUserContext = currentUserContext;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String token = extractToken(request);
        User resolved = null;

        if (token != null) {
            Optional<UserSession> session = userSessionRepository.findActiveWithUserByToken(token);
            if (session.isPresent()) {
                if (!session.get().isExpired()) {
                    resolved = session.get().getUser();
                } else {
                    invalidate(session.get());
                    log.debug("Rejected expired session token");
                }
            } else {
                log.debug("Bearer token did not match any active session");
            }
        }

        if (resolved == null && !properties.isEnabled()) {
            // Dev-only convenience: act as the configured system user.
            resolved = userRepository.findById(properties.getSystemUserId()).orElse(null);
            if (resolved != null) {
                log.debug("Security disabled - request authenticated as system user id={}",
                        resolved.getUserId());
            }
        }

        if (resolved != null) {
            authenticate(resolved);
        }

        chain.doFilter(request, response);
    }

    /** Builds the SecurityContext Authentication + legacy CurrentUserContext. */
    private void authenticate(User user) {
        String dbRoleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        RoleType roleType;
        try {
            roleType = RoleType.fromDbName(dbRoleName);
        } catch (IllegalArgumentException ex) {
            // Fail closed: a user with an unmapped role gets NO authorities and is
            // therefore rejected by every @PreAuthorize rule.
            log.error("User id={} has unmapped role '{}' - request remains unauthenticated",
                    user.getUserId(), dbRoleName);
            return;
        }

        AuthenticatedUser principal =
                new AuthenticatedUser(user.getUserId(), user.getUsername(), roleType);
        var authority = new SimpleGrantedAuthority("ROLE_" + roleType.name());
        var authentication =
                new UsernamePasswordAuthenticationToken(principal, null, List.of(authority));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Keep the request-scoped context in sync for audit / owner-FK resolution
        // in the service layer (DocumentServiceImpl, TrialServiceImpl, ...).
        currentUserContext.setUser(user);
        log.debug("Authenticated request for user id={} as {}", user.getUserId(), authority);
    }

    /** Best-effort auto-invalidation of an expired session (legacy behaviour kept). */
    private void invalidate(UserSession session) {
        try {
            session.setActive(false);
            session.setLogoutTime(java.time.LocalDateTime.now());
            userSessionRepository.save(session);
        } catch (RuntimeException ex) {
            log.warn("Failed to auto-invalidate expired session id={}: {}",
                    session.getSessionId(), ex.getMessage());
        }
    }

    private String extractToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith(BEARER_PREFIX)) {
            return auth.substring(BEARER_PREFIX.length()).trim();
        }
        String custom = request.getHeader("X-Auth-Token");
        if (custom != null && !custom.isBlank()) {
            return custom.trim();
        }
        return null;
    }
}
