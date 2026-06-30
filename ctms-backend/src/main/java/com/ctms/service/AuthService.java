package com.ctms.service;

import com.ctms.dto.response.AuthResponse;
import com.ctms.dto.response.UserResponse;
import com.ctms.exception.CTMSException;

/**
 * Authentication and session management. Preserves the legacy opaque
 * session-token model: {@link #login} verifies credentials and issues a token
 * backed by a {@code user_sessions} row; the token is later presented on each
 * request and resolved by the auth interceptor.
 */
public interface AuthService {

    /** Authenticate by username + raw password; opens a session and returns the token + identity. */
    AuthResponse login(String username, String rawPassword, String ipAddress) throws CTMSException;

    /** Close the current user's active session(s). */
    void logout() throws CTMSException;

    /** @return the currently authenticated user. */
    UserResponse me() throws CTMSException;

    /** Register a new participant. */
    com.ctms.dto.response.PatientResponse registerParticipant(com.ctms.dto.request.RegisterRequest request, org.springframework.web.multipart.MultipartFile medicalDocument) throws CTMSException;
}
