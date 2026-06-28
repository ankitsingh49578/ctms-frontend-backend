package com.ctms.exception;

/** Thrown when input data fails validation rules. */
public class ValidationException extends CTMSException {
    public ValidationException(String message) { super(message); }
    public ValidationException(String message, Throwable cause) { super(message, cause); }
}
