package com.ctms.enums;

/** patients.gender ENUM. */
public enum Gender {
    MALE("Male"), FEMALE("Female"), OTHER("Other");

    private final String dbValue;
    Gender(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static Gender fromDb(String v) {
        for (Gender g : values()) if (g.dbValue.equalsIgnoreCase(v)) return g;
        throw new IllegalArgumentException("Invalid gender: " + v);
    }
}
