package com.corehive.backend.util;

import java.security.SecureRandom;

public class RandomTokenUtil {
    private static final String CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateEmployeeQrToken() {
        StringBuilder sb = new StringBuilder("EMP-");
        for (int i = 0; i < 12; i++) {
            sb.append(CHARSET.charAt(RANDOM.nextInt(CHARSET.length())));
        }
        return sb.toString();
    }
}
