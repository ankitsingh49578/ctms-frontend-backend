package com.ctms.service;

import com.ctms.config.CtmsSecurityProperties;
import com.ctms.dto.response.AuthResponse;
import com.ctms.entity.User;
import com.ctms.entity.UserSession;
import com.ctms.enums.UserStatus;
import com.ctms.exception.AuthenticationException;
import com.ctms.mapper.UserMapper;
import com.ctms.repository.UserRepository;
import com.ctms.repository.UserSessionRepository;
import com.ctms.security.CurrentUserContext;
import com.ctms.service.impl.AuthServiceImpl;
import com.ctms.util.PasswordUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pure Mockito tests for {@link AuthServiceImpl}. Verifies credential handling
 * and the new token-expiry behaviour (PHASE 3) without a Spring context or DB.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSessionRepository userSessionRepository;
    @Mock private AuditService auditService;
    @Mock private CurrentUserContext currentUserContext;
    @Mock private UserMapper userMapper;
    @Mock private CtmsSecurityProperties securityProperties;

    @InjectMocks private AuthServiceImpl authService;

    private User activeUser(String username, String rawPassword) {
        User u = new User();
        u.setUserId(7);
        u.setUsername(username);
        u.setEmail(username + "@ctms.test");
        u.setPassword(PasswordUtil.hash(rawPassword)); // real salted hash -> verify() returns true
        u.setStatus(UserStatus.ACTIVE);
        return u;
    }

    @Test
    @DisplayName("login: unknown username -> AuthenticationException")
    void login_unknownUser() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class,
                () -> authService.login("ghost", "whatever", "127.0.0.1"));
        verify(userSessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("login: inactive account -> AuthenticationException (before password check)")
    void login_inactiveAccount() {
        User u = activeUser("alice", "secret");
        u.setStatus(UserStatus.INACTIVE);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(u));
        assertThrows(AuthenticationException.class,
                () -> authService.login("alice", "secret", "127.0.0.1"));
    }

    @Test
    @DisplayName("login: wrong password -> AuthenticationException")
    void login_wrongPassword() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(activeUser("alice", "secret")));
        assertThrows(AuthenticationException.class,
                () -> authService.login("alice", "WRONG", "127.0.0.1"));
    }

    @Test
    @DisplayName("login: success issues a session with an expiry set from token-validity-minutes")
    void login_success_setsExpiry() throws Exception {
        User u = activeUser("alice", "secret");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(u));
        when(userSessionRepository.findByUser_UserIdAndActiveTrue(7)).thenReturn(List.of());
        when(securityProperties.getTokenValidityMinutes()).thenReturn(720L);
        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse resp = authService.login("alice", "secret", "10.0.0.5");

        assertNotNull(resp.getToken());
        assertEquals("alice", resp.getUsername());

        ArgumentCaptor<UserSession> captor = ArgumentCaptor.forClass(UserSession.class);
        verify(userSessionRepository).save(captor.capture());
        UserSession persisted = captor.getValue();
        assertTrue(persisted.isActive());
        assertNotNull(persisted.getExpiresAt(), "expiresAt must be populated when validity > 0");
        assertFalse(persisted.isExpired(), "a freshly issued token must not be expired");
    }

    @Test
    @DisplayName("login: validity <= 0 means no expiry (legacy non-expiring token)")
    void login_noExpiryWhenValidityZero() throws Exception {
        User u = activeUser("alice", "secret");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(u));
        when(userSessionRepository.findByUser_UserIdAndActiveTrue(7)).thenReturn(List.of());
        when(securityProperties.getTokenValidityMinutes()).thenReturn(0L);
        when(userSessionRepository.save(any(UserSession.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.login("alice", "secret", "10.0.0.5");

        ArgumentCaptor<UserSession> captor = ArgumentCaptor.forClass(UserSession.class);
        verify(userSessionRepository).save(captor.capture());
        assertNull(captor.getValue().getExpiresAt());
        assertFalse(captor.getValue().isExpired());
    }
}
