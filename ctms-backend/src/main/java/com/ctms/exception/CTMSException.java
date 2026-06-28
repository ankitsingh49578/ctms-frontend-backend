package com.ctms.exception;

/** Root checked exception for all CTMS application errors. */
public class CTMSException extends Exception {
    public CTMSException(String message) { super(message); }
    public CTMSException(String message, Throwable cause) { super(message, cause); }
}
