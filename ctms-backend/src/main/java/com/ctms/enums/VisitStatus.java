package com.ctms.enums;

/** visit_schedule.visit_status ENUM. */
public enum VisitStatus {
    SCHEDULED("Scheduled"), COMPLETED("Completed"), MISSED("Missed"),
    CANCELLED("Cancelled"), RESCHEDULED("Rescheduled");

    private final String dbValue;
    VisitStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static VisitStatus fromDb(String v) {
        for (VisitStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid visit status: " + v);
    }
}
