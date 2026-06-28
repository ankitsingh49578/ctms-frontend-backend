package com.ctms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * springdoc-openapi configuration (Phase 10). Exposes API metadata and declares a
 * {@code bearerAuth} security scheme so the "Authorize" button in Swagger UI can
 * carry the token returned by {@code POST /api/auth/login}.
 */
@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI ctmsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CTMS REST API")
                        .version("2.0.0")
                        .description("""
                                Clinical Trial Management System — Spring Boot 3 + Hibernate/JPA + PostgreSQL.
                                Migrated from the original Java 17 / JDBC console application; all business
                                rules, validations and database relationships are preserved.""")
                        .contact(new Contact().name("CTMS Engineering"))
                        .license(new License().name("Proprietary")))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components().addSecuritySchemes(SCHEME_NAME,
                        new SecurityScheme()
                                .name(SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .description("Paste the token returned by POST /api/auth/login")));
    }
}
