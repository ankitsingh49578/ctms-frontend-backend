package com.ctms.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds the {@code ctms.security.*} properties.
 *
 * <ul>
 *   <li>{@code enabled} (default {@code true}) – production default. Every
 *       {@code /api/**} call except {@code /api/auth/login} requires a valid,
 *       unexpired session token; role rules are then enforced per endpoint via
 *       {@code @PreAuthorize}. Set to {@code false} ONLY for local development:
 *       in that mode unauthenticated requests are authenticated as the
 *       configured system user (the seeded Admin) so Swagger UI works without
 *       logging in, and a prominent warning is logged at startup.</li>
 *   <li>{@code system-user-id} (default {@code 1}) – the dev-mode acting user,
 *       and the fallback for audit / created_by FKs. Points at the seeded Admin.</li>
 *   <li>{@code token-validity-minutes} (default 12 hours) – session-token
 *       lifetime. 0 or negative = never expires (not recommended).</li>
 * </ul>
 */
@Component
@ConfigurationProperties(prefix = "ctms.security")
@Getter
@Setter
public class CtmsSecurityProperties {
    private boolean enabled = true;
    private int systemUserId = 1;
    /** Session-token lifetime in minutes (default 12 hours). 0 or negative = never expires. */
    private long tokenValidityMinutes = 720;
}
