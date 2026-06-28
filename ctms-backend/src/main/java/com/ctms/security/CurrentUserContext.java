package com.ctms.security;

import com.ctms.config.CtmsSecurityProperties;
import com.ctms.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Optional;

/**
 * Request-scoped holder for the authenticated {@link User}. This is the Spring
 * replacement for the legacy {@code SessionManager} ThreadLocal: it is populated
 * per-request by {@link SessionTokenAuthenticationFilter} from the bearer token and injected
 * (via a scoped proxy) into singleton services that need the acting user for
 * audit logging and {@code created_by}/{@code uploaded_by}/{@code reported_by} FKs.
 */
@Component
@RequestScope
public class CurrentUserContext {

    private final CtmsSecurityProperties properties;
    private User user;   // null until the interceptor resolves a valid session

    public CurrentUserContext(CtmsSecurityProperties properties) {
        this.properties = properties;
    }

    public void setUser(User user) { this.user = user; }

    public Optional<User> getUser() { return Optional.ofNullable(user); }

    public boolean isAuthenticated() { return user != null; }

    /**
     * The acting user id: the authenticated user when present, otherwise the
     * configured system user id so NOT NULL audit/owner columns never break.
     */
    public Integer currentUserId() {
        return user != null ? user.getUserId() : properties.getSystemUserId();
    }

    /** Checks if the user has the specified DB role name (case-insensitive). */
    public boolean hasRole(String roleName) {
        if (user == null || user.getRole() == null || user.getRole().getRoleName() == null) {
            return false;
        }
        return user.getRole().getRoleName().equalsIgnoreCase(roleName);
    }
}
