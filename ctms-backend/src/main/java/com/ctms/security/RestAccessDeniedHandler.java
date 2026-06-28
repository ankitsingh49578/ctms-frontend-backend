package com.ctms.security;

import com.ctms.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Returns the standard {@link ApiResponse} envelope with HTTP 403 when an
 * authenticated caller lacks the required role/ownership and the denial happens
 * inside the security filter chain (method-security denials thrown from MVC
 * handlers are converted by {@code GlobalExceptionHandler} instead, producing
 * the identical envelope).
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private static final Logger log = LoggerFactory.getLogger(RestAccessDeniedHandler.class);

    private final ObjectMapper objectMapper;

    public RestAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        log.warn("Access denied for {} {}", request.getMethod(), request.getRequestURI());
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> body = ApiResponse.error(
                "Access denied: your role does not permit this operation",
                null, request.getRequestURI());
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
