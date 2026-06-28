package com.ctms.controller;

import com.ctms.dto.ApiResponse;
import com.ctms.dto.request.LoginRequest;
import com.ctms.dto.response.AuthResponse;
import com.ctms.dto.response.UserResponse;
import com.ctms.exception.CTMSException;
import com.ctms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.ctms.dto.request.RegisterRequest;
import com.ctms.dto.response.PatientResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import com.ctms.dto.request.RegisterRequest;
import com.ctms.dto.response.PatientResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

/** Authentication endpoints: login (issues a session token), logout, and current user. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, logout and current-user endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    @Operation(summary = "Authenticate and obtain a session token",
            description = "Public endpoint - no token required. Returns a session token to use as 'Authorization: Bearer <token>' on all other endpoints.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest http) throws CTMSException {
        AuthResponse auth = authService.login(request.getUsername(), request.getPassword(), http.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.ok("Login successful", auth));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    @Operation(summary = "Invalidate the current session")
    public ResponseEntity<ApiResponse<Void>> logout() throws CTMSException {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.ok("Logout successful", null));
    }

    @PostMapping("/register")
    @io.swagger.v3.oas.annotations.security.SecurityRequirements
    @Operation(summary = "Register a new participant",
            description = "Public endpoint to self-register a new participant account with medical history document name.")
    public ResponseEntity<ApiResponse<PatientResponse>> register(
            @Valid @RequestBody RegisterRequest request) throws CTMSException {
        PatientResponse response = authService.registerParticipant(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    @Operation(summary = "Return the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> me() throws CTMSException {
        return ResponseEntity.ok(ApiResponse.ok(authService.me()));
    }
}
