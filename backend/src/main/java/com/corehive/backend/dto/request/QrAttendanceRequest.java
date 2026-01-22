package com.corehive.backend.dto.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request sent after QR scan
 */
@Data
public class QrAttendanceRequest {

    @NotBlank
    private String qrToken; // JWT inside QR
}
