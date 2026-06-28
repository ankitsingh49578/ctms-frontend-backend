package com.ctms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * MVC-level configuration. Authentication moved into the Spring Security filter
 * chain ({@link SecurityConfig} + {@code SessionTokenAuthenticationFilter}); the
 * former {@code AuthTokenInterceptor} registration is gone. CORS also moved to
 * {@link SecurityConfig#corsConfigurationSource()} so pre-flight requests are
 * answered inside the security chain.
 *
 * <p>{@code @EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)} makes
 * {@code Page<T>} responses serialize through a stable DTO (a {@code content[]}
 * array plus a {@code page} metadata object) instead of the raw {@code PageImpl}.
 * This removes the Spring Boot 3.3 "serializing PageImpl as-is is not supported"
 * warning and gives clients a documented, version-safe pagination contract.</p>
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig implements WebMvcConfigurer {
}
