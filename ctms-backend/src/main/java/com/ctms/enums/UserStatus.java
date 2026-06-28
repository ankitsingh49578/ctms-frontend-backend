package com.ctms.enums;

/** Shared Active/Inactive status used by users, roles, patients. */
public enum UserStatus {
    ACTIVE("Active"), INACTIVE("Inactive");

    private final String dbValue;
    UserStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static UserStatus fromDb(String v) {
        for (UserStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid status: " + v);
    }
}
