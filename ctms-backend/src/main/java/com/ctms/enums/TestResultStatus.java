package com.ctms.enums;

/** test_results.result_status ENUM. */
public enum TestResultStatus {
    NORMAL("Normal"), ABNORMAL("Abnormal"), CRITICAL("Critical"), INCONCLUSIVE("Inconclusive");

    private final String dbValue;
    TestResultStatus(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static TestResultStatus fromDb(String v) {
        for (TestResultStatus s : values()) if (s.dbValue.equalsIgnoreCase(v)) return s;
        throw new IllegalArgumentException("Invalid test result status: " + v);
    }
}
