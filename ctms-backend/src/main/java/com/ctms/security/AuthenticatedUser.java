package com.ctms.security;

import com.ctms.enums.RoleType;

/**
 * Immutable, detached principal placed in the Spring Security context by
 * {@link SessionTokenAuthenticationFilter}. Holding a small record instead of
 * the JPA {@code User} entity keeps the SecurityContext free of lazy proxies
 * and accidental entity mutation.
 *
 * @param userId   PK of the authenticated {@code users} row
 * @param username login name (used as the {@code Authentication#getName()})
 * @param role     resolved {@link RoleType}; never {@code null} for an
 *                 authenticated principal (unknown DB role names fail closed
 *                 in the filter and never reach this record)
 */
public record AuthenticatedUser(Integer userId, String username, RoleType role) {

    @Override
    public String toString() {
        // Never leak more than id/role into logs.
        return "AuthenticatedUser{id=" + userId + ", role=" + role + "}";
    }
}
