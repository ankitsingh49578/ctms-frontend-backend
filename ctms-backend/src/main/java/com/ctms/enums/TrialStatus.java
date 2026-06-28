package com.ctms.enums;

/** trials.status ENUM('Planned','Active','Completed','On Hold','Terminated'). */
public enum TrialStatus {
    PENDING("Planned"), ACTIVE("Active"), COMPLETED("Completed"),
    ON_HOLD("On Hold"), TERMINATED("Terminated");

    private final String dbValue;
    TrialStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static TrialStatus fromDb(String v) {
        for (TrialStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid trial status: " + v);
    }
}
