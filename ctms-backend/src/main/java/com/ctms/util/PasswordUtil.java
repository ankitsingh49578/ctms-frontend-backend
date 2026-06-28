package com.ctms.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * Salted SHA-256 password hashing. Stored format: {@code salt$hexHash}.
 * (A demonstration scheme appropriate for a console project; in production
 * prefer an adaptive KDF such as bcrypt/PBKDF2/Argon2.)
 */
public final class PasswordUtil {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String DELIM = "$";

    private PasswordUtil() {}

    /** Hash a raw password with a freshly generated random salt. */
    public static String hash(String rawPassword) {
        String salt = newSalt();
        return salt + DELIM + sha256(salt + rawPassword);
    }

    /** Verify a raw password against a stored {@code salt$hash} value. */
    public static boolean verify(String rawPassword, String stored) {
        if (stored == null || !stored.contains(DELIM)) return false;
        String[] parts = stored.split("\\" + DELIM, 2);
        String salt = parts[0];
        String expected = parts[1];
        String actual = sha256(salt + rawPassword);
        return constantTimeEquals(expected, actual);
    }

    private static String newSalt() {
        byte[] bytes = new byte[6];
        RANDOM.nextBytes(bytes);
        return toHex(bytes);
    }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return toHex(md.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int diff = 0;
        for (int i = 0; i < a.length(); i++) diff |= a.charAt(i) ^ b.charAt(i);
        return diff == 0;
    }
}
