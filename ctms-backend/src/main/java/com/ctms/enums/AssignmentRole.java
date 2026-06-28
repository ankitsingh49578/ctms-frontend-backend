package com.ctms.enums;

/** trial_assignments.role ENUM. */
public enum AssignmentRole {
    MANAGER("Manager"), COORDINATOR("Coordinator"), MONITOR("Monitor");

    private final String dbValue;
    AssignmentRole(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static AssignmentRole fromDb(String v) {
        for (AssignmentRole r : values()) if (r.dbValue.equalsIgnoreCase(v)) return r;
        throw new IllegalArgumentException("Invalid assignment role: " + v);
    }
}
