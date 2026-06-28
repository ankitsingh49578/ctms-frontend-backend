package com.ctms.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds {@code ctms.rate-limit.*}. Drives the simple in-memory fixed-window
 * limiter in {@code com.ctms.web.RateLimitFilter}. Disabled by default so it
 * never surprises local testing; enable per environment.
 */
@Component
@ConfigurationProperties(prefix = "ctms.rate-limit")
@Getter
@Setter
public class CtmsRateLimitProperties {

    /** Master switch (default off). */
    private boolean enabled = false;

    /** Max requests allowed per client within {@link #windowSeconds}. */
    private int requestsPerWindow = 100;

    /** Length of the fixed window in seconds. */
    private int windowSeconds = 60;
}
