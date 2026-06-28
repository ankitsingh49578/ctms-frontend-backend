package com.ctms.enums;

/** adverse_events.severity ENUM. */
public enum Severity {
    MILD("Mild"), MODERATE("Moderate"), SEVERE("Severe"), LIFE_THREATENING("Life Threatening");

    private final String dbValue;
    Severity(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static Severity fromDb(String v) {
        for (Severity s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid severity: " + v);
    }
}
