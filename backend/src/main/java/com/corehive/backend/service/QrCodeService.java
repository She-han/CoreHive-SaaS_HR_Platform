package com.corehive.backend.service;

import com.corehive.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Generates short-lived QR JWT tokens
 */
@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final JwtUtil jwtUtil;

    /**
     * Generate attendance QR token
     */
    public String generateAttendanceQrToken(
            Long employeeId,
            String orgUuid,
            String purpose // CHECK_IN / CHECK_OUT
    ) {
        // Token valid for 2 minutes
        long ttlMillis = 10 * 60 * 1000; // 10 minutes

        return jwtUtil.generateQrToken(
                employeeId,
                orgUuid
        );
    }
}
