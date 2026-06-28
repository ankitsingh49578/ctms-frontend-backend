package com.ctms.util;

import java.security.SecureRandom;
import java.util.Base64;

/** Generates opaque, URL-safe session tokens. */
public final class TokenUtil {

    private static final SecureRandom RANDOM = new SecureRandom();
    private TokenUtil() {}

    public static String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
