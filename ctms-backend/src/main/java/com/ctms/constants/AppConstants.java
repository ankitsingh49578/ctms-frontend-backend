package com.ctms.constants;

/** Application-wide constants (no magic numbers/strings scattered in code). */
public final class AppConstants {
    private AppConstants() {}

    public static final String APP_NAME = "Clinical Trial Management System";
    public static final String APP_VERSION = "1.0.0";

    // Password policy
    public static final int PASSWORD_MIN_LENGTH = 8;

    // Session
    public static final int DEFAULT_SESSION_TIMEOUT_MINUTES = 30;
    public static final int DEFAULT_MAX_LOGIN_ATTEMPTS = 5;

    // Misc
    public static final String DEFAULT_IP = "127.0.0.1";
    public static final int DEFAULT_PAGE_SIZE = 50;
}
