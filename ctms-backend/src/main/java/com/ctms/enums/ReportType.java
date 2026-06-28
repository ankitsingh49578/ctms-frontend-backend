package com.ctms.enums;

/** reports.report_type ENUM. */
public enum ReportType {
    RECRUITMENT("Recruitment"), SAFETY("Safety"), PERFORMANCE("Performance"),
    COMPLIANCE("Compliance"), OTHER("Other");

    private final String dbValue;
    ReportType(String dbValue) { this.dbValue = dbValue; }
    public String dbValue() { return dbValue; }

    public static ReportType fromDb(String v) {
        for (ReportType r : values()) if (r.dbValue.equalsIgnoreCase(v)) return r;
        throw new IllegalArgumentException("Invalid report type: " + v);
    }
}
