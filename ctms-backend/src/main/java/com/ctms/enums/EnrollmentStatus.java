package com.ctms.enums;

/** enrollments.status ENUM. */
public enum EnrollmentStatus {
    SCREENING("Screening"), ENROLLED("Enrolled"), COMPLETED("Completed"),
    WITHDRAWN("Withdrawn"), TERMINATED("Terminated");

    private final String dbValue;
    EnrollmentStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static EnrollmentStatus fromDb(String v) {
        for (EnrollmentStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid enrollment status: " + v);
    }
}
