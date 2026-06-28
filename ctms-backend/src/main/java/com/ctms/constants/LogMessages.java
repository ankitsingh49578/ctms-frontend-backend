package com.ctms.constants;

/** Reusable log message templates for consistent, structured logging. */
public final class LogMessages {
    private LogMessages() {}

    public static final String METHOD_ENTRY   = ">> Entering {}.{}({})";
    public static final String METHOD_EXIT     = "<< Exiting {}.{} -> {}";
    public static final String DAO_EXECUTE     = "[DAO] Executing SQL: {}";
    public static final String DAO_RESULT      = "[DAO] {} row(s) affected/returned for {}";
    public static final String VALIDATING      = "[VALIDATION] Validating {}...";
    public static final String VALIDATION_OK   = "[VALIDATION] {} is valid";
    public static final String LOGIN_ATTEMPT   = "[AUTH] Login attempt for user '{}'";
    public static final String LOGIN_SUCCESS   = "[SUCCESS] User '{}' logged in (role={})";
    public static final String LOGIN_FAILED    = "[ERROR] Login failed for '{}': {}";
    public static final String LOGOUT          = "[AUTH] User '{}' logged out";
    public static final String CREATED         = "[SUCCESS] {} created successfully (id={})";
    public static final String UPDATED         = "[SUCCESS] {} updated (id={})";
    public static final String DELETED         = "[SUCCESS] {} deleted (id={})";
    public static final String NOT_FOUND       = "[ERROR] {} not found: {}";
    public static final String DUPLICATE       = "[ERROR] {} already exists: {}";
}
