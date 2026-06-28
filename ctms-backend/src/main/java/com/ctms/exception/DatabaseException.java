package com.ctms.exception;

/** Wraps SQLExceptions and other persistence failures. */
public class DatabaseException extends CTMSException {
    public DatabaseException(String message) { super(message); }
    public DatabaseException(String message, Throwable cause) { super(message, cause); }
}
