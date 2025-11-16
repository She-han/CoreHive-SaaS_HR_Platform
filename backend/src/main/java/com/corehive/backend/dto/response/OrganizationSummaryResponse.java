package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Organization Summary Response DTO
 * For organization list (System Admin dashboard)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationSummaryResponse {
    private Long id;
    private String organizationUuid;
    private String name;
    private String email;
    private String status;
    private String employeeCountRange;
    private LocalDateTime createdAt;
    private Boolean modulePerformanceTracking;
    private Boolean moduleEmployeeFeedback;
    private Boolean moduleHiringManagement;
    private Boolean modulesConfigured;
}