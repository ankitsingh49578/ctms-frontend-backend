package com.ctms.config;

import jakarta.persistence.EntityManager;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabasePatcher {

    private final EntityManager entityManager;

    public DatabasePatcher(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void patch() {
        try {
            entityManager.createNativeQuery("ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history_document_name VARCHAR(255)").executeUpdate();
            System.out.println("Applied DB patch: medical_history_document_name added");
        } catch (Exception e) {
            System.out.println("Patch already applied or error: " + e.getMessage());
        }
    }
}
