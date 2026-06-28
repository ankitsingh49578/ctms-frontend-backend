package com.ctms.exception;

import com.ctms.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

/**
 * Centralised translation of exceptions into the standardized {@link ApiResponse}
 * envelope (Phase 9). Each CTMS exception type is mapped to the most appropriate
 * HTTP status; Bean-Validation failures are flattened into a list of
 * "field: message" strings.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /* ---------------------- 400 Bad Request ---------------------- */

    /** Bean Validation on @Valid @RequestBody DTOs. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleBeanValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::formatFieldError)
                .toList();
        log.warn("Validation failed for {} : {}", req.getRequestURI(), errors);
        return build(HttpStatus.BAD_REQUEST, "Validation failed", errors, req);
    }

    /** Domain-level validation from ValidationUtil / EnumValidator. */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            ValidationException ex, HttpServletRequest req) {
        log.warn("Validation error at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null, req);
    }

    @ExceptionHandler({MissingServletRequestParameterException.class,
                       MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(
            Exception ex, HttpServletRequest req) {
        log.warn("Bad request at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null, req);
    }

    /** Malformed or missing JSON request body -> consistent 400 (not a bare Spring error). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadable(
            HttpMessageNotReadableException ex, HttpServletRequest req) {
        log.warn("Unreadable request body at {} : {}", req.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.BAD_REQUEST, "Malformed or missing JSON request body", null, req);
    }

    /** Wrong HTTP method for an existing route (e.g. GET on a POST-only endpoint). */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        log.warn("Method not allowed at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage(), null, req);
    }

    /** Unknown route -> enveloped 404 instead of a bare error page. */
    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiResponse<Void>> handleNoHandler(
            Exception ex, HttpServletRequest req) {
        log.warn("No handler for {} {}", req.getMethod(), req.getRequestURI());
        return build(HttpStatus.NOT_FOUND,
                "No endpoint for " + req.getMethod() + " " + req.getRequestURI(), null, req);
    }

    /* ---------------------- 401 / 403 ---------------------- */

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuth(
            AuthenticationException ex, HttpServletRequest req) {
        log.warn("Authentication failure at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), null, req);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleForbidden(
            UnauthorizedAccessException ex, HttpServletRequest req) {
        log.warn("Authorization failure at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), null, req);
    }

    /**
     * Raised by Spring Security method security ({@code @PreAuthorize}) when an
     * authenticated user lacks the required role or ownership. Handled here (rather
     * than only by the {@code AccessDeniedHandler}) because denials thrown inside the
     * MVC dispatch are routed to {@code @ExceptionHandler}s first.
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleSpringAccessDenied(
            org.springframework.security.access.AccessDeniedException ex, HttpServletRequest req) {
        log.warn("Access denied at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.FORBIDDEN,
                "Access denied: you do not have permission to perform this action", null, req);
    }

    /* ---------------------- 404 ---------------------- */

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest req) {
        log.warn("Resource not found at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), null, req);
    }

    /* ---------------------- 422 ---------------------- */

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(
            BusinessException ex, HttpServletRequest req) {
        log.warn("Business rule violation at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), null, req);
    }

    /* ---------------------- 409 ---------------------- */

    /** Concurrent modification detected by @Version optimistic locking. */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLock(
            ObjectOptimisticLockingFailureException ex, HttpServletRequest req) {
        log.warn("Optimistic lock conflict at {} : {}", req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.CONFLICT,
                "The record was modified by another request. Reload the latest version and try again.",
                null, req);
    }

    /** Uncaught DB constraint violation (unique / foreign key) surfaced as a clean 409. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Data integrity violation at {} : {}", req.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT,
                "Request conflicts with existing data (constraint violation).", null, req);
    }

    /* ---------------------- 500 ---------------------- */

    @ExceptionHandler(DatabaseException.class)
    public ResponseEntity<ApiResponse<Void>> handleDatabase(
            DatabaseException ex, HttpServletRequest req) {
        log.error("Database error at {} : {}", req.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "A database error occurred", null, req);
    }

    /** Catch-all for the root CTMS exception not handled above. */
    @ExceptionHandler(CTMSException.class)
    public ResponseEntity<ApiResponse<Void>> handleCtms(
            CTMSException ex, HttpServletRequest req) {
        log.error("Application error at {} : {}", req.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), null, req);
    }

    /** Absolute last resort. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(
            Exception ex, HttpServletRequest req) {
        log.error("Unexpected error at {} : {}", req.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred", null, req);
    }

    /* ---------------------- helpers ---------------------- */

    private static ResponseEntity<ApiResponse<Void>> build(
            HttpStatus status, String message, List<String> errors, HttpServletRequest req) {
        return ResponseEntity.status(status)
                .body(ApiResponse.error(message, errors, req.getRequestURI()));
    }

    private static String formatFieldError(FieldError fe) {
        return fe.getField() + ": " + fe.getDefaultMessage();
    }
}
