package com.ctms.constants;

/** Centralized error message strings. */
public final class ErrorMessages {
    private ErrorMessages() {}

    public static final String INVALID_CREDENTIALS = "Invalid username or password";
    public static final String INACTIVE_USER       = "User account is inactive";
    public static final String UNAUTHORIZED         = "You are not authorized to perform this action";
    public static final String NOT_LOGGED_IN        = "No active session. Please log in first.";

    public static final String INVALID_EMAIL    = "Invalid email format";
    public static final String INVALID_PHONE     = "Invalid phone number (expected 7-15 digits)";
    public static final String INVALID_TRIAL_CODE= "Invalid trial code (expected e.g. TRL-XXXX-NN)";
    public static final String WEAK_PASSWORD     = "Password must be >= 8 chars with upper, lower, digit and special char";
    public static final String REQUIRED_FIELD    = "Required field is missing or empty: ";
    public static final String INVALID_DATE      = "Invalid or illogical date value: ";
    public static final String INVALID_ENUM      = "Invalid value for ";
}
