package com.ctms.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Binds {@code ctms.cors.*}. Lets the allowed origins/methods/headers be configured
 * per environment (e.g. a React app on :3000 or an Angular app on :4200) without
 * code changes. Applied by {@link WebConfig#addCorsMappings}.
 */
@Component
@ConfigurationProperties(prefix = "ctms.cors")
@Getter
@Setter
public class CtmsCorsProperties {

    /** Origins allowed to call the API. Defaults cover common local frontends. */
    private List<String> allowedOrigins = List.of("http://localhost:3000", "http://localhost:4200");

    private List<String> allowedMethods = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");

    private List<String> allowedHeaders = List.of("*");

    /** Headers exposed to the browser (so the frontend can read the correlation id). */
    private List<String> exposedHeaders = List.of("X-Correlation-Id");

    private boolean allowCredentials = true;

    /** Pre-flight cache duration in seconds. */
    private long maxAge = 3600;
}
