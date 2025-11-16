package com.corehive.backend.dto.request;


import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Module Configuration Request DTO
 * Configure modules for ORG_ADMIN during first-time login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleConfigurationRequest {

    @NotNull(message = "Performance tracking module selection is required")
    private Boolean modulePerformanceTracking;

    @NotNull(message = "Employee feedback module selection is required")
    private Boolean moduleEmployeeFeedback;

    @NotNull(message = "Hiring management module selection is required")
    private Boolean moduleHiringManagement;
}