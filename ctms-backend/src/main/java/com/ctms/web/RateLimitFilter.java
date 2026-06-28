package com.ctms.web;

import com.ctms.config.CtmsRateLimitProperties;
import com.ctms.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * A deliberately simple in-process fixed-window rate limiter, keyed by client IP.
 * It is disabled by default ({@code ctms.rate-limit.enabled=false}) and is meant
 * as a first line of defence for single-instance deployments — for a clustered
 * deployment use a shared store (e.g. Redis) or an API gateway instead.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final CtmsRateLimitProperties properties;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Only guard the API surface; leave docs/actuator alone.
        return !properties.isEnabled() || !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String clientKey = clientKey(request);
        long currentWindow = System.currentTimeMillis() / (properties.getWindowSeconds() * 1000L);

        Window window = windows.compute(clientKey, (k, existing) -> {
            if (existing == null || existing.windowId != currentWindow) {
                return new Window(currentWindow);
            }
            return existing;
        });
        int count = window.count.incrementAndGet();

        if (count > properties.getRequestsPerWindow()) {
            writeTooManyRequests(request, response);
            return;
        }
        chain.doFilter(request, response);
    }

    private void writeTooManyRequests(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(properties.getWindowSeconds()));
        ApiResponse<Void> body = ApiResponse.error(
                "Rate limit exceeded. Try again later.",
                List.of("Maximum " + properties.getRequestsPerWindow()
                        + " requests per " + properties.getWindowSeconds() + "s"),
                request.getRequestURI());
        objectMapper.writeValue(response.getWriter(), body);
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /** Per-client fixed window: an id (epoch / windowSeconds) and a request counter. */
    private static final class Window {
        private final long windowId;
        private final AtomicInteger count = new AtomicInteger(0);
        private Window(long windowId) { this.windowId = windowId; }
    }
}
