package com.ctms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot entry point for the Clinical Trial Management System REST API.
 *
 * <p>Component scanning starts from {@code com.ctms}, picking up controllers,
 * services, repositories, entities, converters, the security interceptor and
 * configuration in the sub-packages.</p>
 */
@SpringBootApplication
public class CtmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(CtmsApplication.class, args);
    }
}
