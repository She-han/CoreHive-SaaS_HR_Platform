package com.corehive.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * HR generates QR for employee
 */
@Data
public class QrGenerateRequest {

    @NotNull
    private Long employeeId;

    @NotNull
    private Purpose purpose; // CHECK_IN / CHECK_OUT

    public enum Purpose {
        CHECK_IN,
        CHECK_OUT
    }
}