package com.corehive.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Organizations Report DTO
 * Response for organization listing reports with filters
 */
@Data
public class OrganizationsReportDTO {

    private List<OrganizationData> organizations;
    private int totalOrganizations;
    private BigDecimal totalMonthlyRevenue;
    private Map<String, Long> planDistribution;
    private Map<String, Long> statusDistribution;
    private LocalDateTime generatedAt;

    @Data
    public static class OrganizationData {
        private String organizationName;
        private String email;
        private String billingPlan;
        private String status;
        private LocalDateTime createdAt;
        private int activeUsers;
        private BigDecimal planPrice;
        private String billingCycle;
        private BigDecimal monthlyRevenue;
        private List<String> extendedModules;
    }
}
