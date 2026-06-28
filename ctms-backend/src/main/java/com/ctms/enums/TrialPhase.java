package com.ctms.enums;

/** Trial phases. dbValue maps to the trials.phase ENUM('I','II','III','IV'). */
public enum TrialPhase {
    PHASE_I("I"), PHASE_II("II"), PHASE_III("III"), PHASE_IV("IV");

    private final String dbValue;
    TrialPhase(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static TrialPhase fromDb(String v) {
        for (TrialPhase p : values()) if (p.dbValue.equalsIgnoreCase(v)) return p;
        throw new IllegalArgumentException("Invalid trial phase: " + v);
    }
}
