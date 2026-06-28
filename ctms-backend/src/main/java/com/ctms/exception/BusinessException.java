package com.ctms.exception;

/**
 * Thrown when a business rule / workflow constraint is violated
 * (e.g. enrolling into a non-active trial, duplicate enrollment,
 * an illegal status transition). Maps to HTTP 422 Unprocessable Entity.
 */
public class BusinessException extends CTMSException {
    public BusinessException(String message) { super(message); }
    public BusinessException(String message, Throwable cause) { super(message, cause); }
}
