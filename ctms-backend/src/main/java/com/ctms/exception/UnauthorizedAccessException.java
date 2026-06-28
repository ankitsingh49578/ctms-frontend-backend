package com.ctms.exception;

/** Thrown when the current user's role lacks permission for an action. */
public class UnauthorizedAccessException extends CTMSException {
    public UnauthorizedAccessException(String message) { super(message); }
    public UnauthorizedAccessException(String message, Throwable cause) { super(message, cause); }
}
