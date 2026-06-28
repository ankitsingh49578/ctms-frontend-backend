package com.ctms.util;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/** Null-safe conversions between JDBC and java.time types + parsing helpers. */
public final class DateUtil {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private DateUtil() {}

    public static Date toSqlDate(LocalDate d)        { return d == null ? null : Date.valueOf(d); }
    public static LocalDate toLocalDate(Date d)      { return d == null ? null : d.toLocalDate(); }
    public static Timestamp toTimestamp(LocalDateTime t) { return t == null ? null : Timestamp.valueOf(t); }
    public static LocalDateTime toLocalDateTime(Timestamp t) { return t == null ? null : t.toLocalDateTime(); }

    /** Parse yyyy-MM-dd, returning null on blank/invalid input. */
    public static LocalDate parse(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s.trim(), DATE_FMT); }
        catch (DateTimeParseException e) { return null; }
    }
}
