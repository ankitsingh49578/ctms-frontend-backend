package com.ctms.exception;

/** Thrown when an entity lookup yields no result. */
public class ResourceNotFoundException extends CTMSException {
    public ResourceNotFoundException(String message) { super(message); }
    public ResourceNotFoundException(String message, Throwable cause) { super(message, cause); }
}
