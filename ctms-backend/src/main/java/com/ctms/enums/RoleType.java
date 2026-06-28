package com.ctms.enums;

/** System roles. Names mirror the seeded role_name values in the DB. */
public enum RoleType {
    SUPER_ADMIN("Super Admin"),
    ADMIN("Admin"),
    DOCTOR("Doctor"),
    PARTICIPANT("Participant"),
    CLINICAL_MANAGER("Clinical Manager"),
    TRIAL_MANAGER("Manager"),
    STUDY_COORDINATOR("Study Coordinator");

    private final String dbName;
    RoleType(String dbName) { this.dbName = dbName; }
    public String dbName() { return dbName; }

    public static RoleType fromDbName(String name) {
        for (RoleType r : values()) if (r.dbName.equalsIgnoreCase(name)) return r;
        throw new IllegalArgumentException("Unknown role: " + name);
    }
}
