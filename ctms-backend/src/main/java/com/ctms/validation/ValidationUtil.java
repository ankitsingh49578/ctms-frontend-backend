package com.ctms.validation;

import java.time.LocalDate;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ctms.constants.ErrorMessages;
import com.ctms.constants.LogMessages;
import com.ctms.exception.ValidationException;

/**
 * Reusable, stateless validation helpers. Each {@code require*} / {@code validate*}
 * method throws {@link ValidationException} on failure and logs the check.
 */
public final class ValidationUtil {

    private static final Logger log = LoggerFactory.getLogger(ValidationUtil.class);

    private static final Pattern EMAIL =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE = Pattern.compile("^[+]?[0-9]{7,15}$");
    private static final Pattern TRIAL_CODE = Pattern.compile("^[A-Z]{2,5}-[A-Z0-9]{2,6}-?[0-9]{0,3}$");
    // >=8 chars, at least one lower, upper, digit, special
    private static final Pattern STRONG_PWD =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");

    private ValidationUtil() {}

    public static void requireNonBlank(String value, String field) throws ValidationException {
        log.debug(LogMessages.VALIDATING, field);
        if (value == null || value.isBlank()) {
            throw new ValidationException(ErrorMessages.REQUIRED_FIELD + field);
        }
        log.debug(LogMessages.VALIDATION_OK, field);
    }

    public static void requirePositive(int value, String field) throws ValidationException {
        log.debug(LogMessages.VALIDATING, field);
        if (value <= 0) throw new ValidationException(field + " must be a positive id/number");
        log.debug(LogMessages.VALIDATION_OK, field);
    }

    public static void validateEmail(String email) throws ValidationException {
        log.debug(LogMessages.VALIDATING, "email");
        if (email == null || !EMAIL.matcher(email).matches()) {
            throw new ValidationException(ErrorMessages.INVALID_EMAIL);
        }
        log.debug(LogMessages.VALIDATION_OK, "email");
    }

    public static void validatePhone(String phone) throws ValidationException {
        if (phone == null || phone.isBlank()) return; // phone is optional/nullable
        log.debug(LogMessages.VALIDATING, "phone");
        if (!PHONE.matcher(phone).matches()) {
            throw new ValidationException(ErrorMessages.INVALID_PHONE);
        }
        log.debug(LogMessages.VALIDATION_OK, "phone");
    }

    public static void validateTrialCode(String code) throws ValidationException {
        log.debug(LogMessages.VALIDATING, "trial code");
        if (code == null || !TRIAL_CODE.matcher(code).matches()) {
            throw new ValidationException(ErrorMessages.INVALID_TRIAL_CODE + " : '" + code + "'");
        }
        log.debug(LogMessages.VALIDATION_OK, "trial code");
    }

    public static void validatePasswordStrength(String password) throws ValidationException {
        log.debug(LogMessages.VALIDATING, "password strength");
        if (password == null || !STRONG_PWD.matcher(password).matches()) {
            throw new ValidationException(ErrorMessages.WEAK_PASSWORD);
        }
        log.debug(LogMessages.VALIDATION_OK, "password");
    }

    /** Ensures start <= end (end may be null). */
    public static void validateDateRange(LocalDate start, LocalDate end, String field)
            throws ValidationException {
        log.debug(LogMessages.VALIDATING, field + " date range");
        if (start == null) throw new ValidationException(ErrorMessages.INVALID_DATE + field + " start");
        if (end != null && end.isBefore(start)) {
            throw new ValidationException(ErrorMessages.INVALID_DATE + field + " (end before start)");
        }
        log.debug(LogMessages.VALIDATION_OK, field + " date range");
    }

    public static void requireNotNullDate(LocalDate date, String field) throws ValidationException {
        if (date == null) throw new ValidationException(ErrorMessages.INVALID_DATE + field);
    }
}
