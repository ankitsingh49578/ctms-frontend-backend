package com.ctms.enums;

/** consent_forms.consent_status ENUM. */
public enum ConsentStatus {
    PENDING("Pending"), SIGNED("Signed"), DECLINED("Declined"), WITHDRAWN("Withdrawn");

    private final String dbValue;
    ConsentStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static ConsentStatus fromDb(String v) {
        for (ConsentStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid consent status: " + v);
    }
}
