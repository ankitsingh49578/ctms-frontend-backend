package com.ctms.exception;

/** Thrown on failed login / invalid credentials / inactive account. */
public class AuthenticationException extends CTMSException {
    public AuthenticationException(String message) { super(message); }
    public AuthenticationException(String message, Throwable cause) { super(message, cause); }
}
