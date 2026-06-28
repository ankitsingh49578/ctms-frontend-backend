package com.ctms.validation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ctms.constants.ErrorMessages;
import com.ctms.exception.ValidationException;

/** Validates that a string maps to a known enum constant (via its db value). */
public final class EnumValidator {

    private static final Logger log = LoggerFactory.getLogger(EnumValidator.class);
    private EnumValidator() {}

    /**
     * Confirms {@code value} can be resolved by the supplied resolver
     * (typically {@code SomeEnum::fromDb}); rethrows as ValidationException.
     */
    public static <T> T validate(String value, String field, java.util.function.Function<String, T> resolver)
            throws ValidationException {
        log.debug("[VALIDATION] Validating enum field '{}' = '{}'", field, value);
        try {
            T result = resolver.apply(value);
            log.debug("[VALIDATION] {} is a valid {}", value, field);
            return result;
        } catch (IllegalArgumentException ex) {
            throw new ValidationException(ErrorMessages.INVALID_ENUM + field + ": '" + value + "'");
        }
    }
}
