package com.ctms.enums;

/** adverse_events.status ENUM. */
public enum AdverseEventStatus {
    REPORTED("Reported"), IN_REVIEW("In Review"), INVESTIGATING("Investigating"), RESOLVED("Resolved"), CLOSED("Closed");

    private final String dbValue;
    AdverseEventStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static AdverseEventStatus fromDb(String v) {
        for (AdverseEventStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid adverse event status: " + v);
    }
}
