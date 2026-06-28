package com.ctms.repository;

import com.ctms.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Integer> {

    // Used by the auth interceptor to resolve the bearer token to a live session.
    // Expiry is then checked in code (UserSession#isExpired) so that legacy
    // non-expiring tokens (null expires_at) continue to resolve.
    Optional<UserSession> findByTokenAndActiveTrue(String token);

    List<UserSession> findByUser_UserIdAndActiveTrue(Integer userId);

    /**
     * Token resolution for {@code SessionTokenAuthenticationFilter}: fetch-joins
     * the user and the user's role in one query so the authorities can be built
     * outside a Hibernate session (open-in-view is off and UserSession.user is
     * LAZY). Expiry is still checked in code (UserSession#isExpired) so legacy
     * non-expiring tokens (null expires_at) continue to resolve.
     */
    @Query("""
           SELECT s FROM UserSession s
           JOIN FETCH s.user u
           JOIN FETCH u.role
           WHERE s.token = :token AND s.active = true""")
    Optional<UserSession> findActiveWithUserByToken(@Param("token") String token);
}
