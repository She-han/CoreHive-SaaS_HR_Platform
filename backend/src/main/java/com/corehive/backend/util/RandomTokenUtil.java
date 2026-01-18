package com.corehive.backend.util;

import java.security.SecureRandom;

public class RandomTokenUtil {
    private static final String CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom(); //Utility class that generates Secure, random, short QR token generate

    public static String generateEmployeeQrToken() {
        StringBuilder sb = new StringBuilder("EMP-"); //Prefix helps identify employee QR
        for (int i = 0; i < 12; i++) { //12 characters → enough entropy, fast scanning
            sb.append(CHARSET.charAt(RANDOM.nextInt(CHARSET.length())));
        }
        return sb.toString();
    }
}
