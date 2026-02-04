package com.corehive.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Revenue Report DTO
 * Response for revenue analysis with actual PaymentTransaction data
 */
@Data
public class RevenueReportDTO {

    private BigDecimal totalRevenue;
    private int totalTransactions;
    private String timePeriod;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<OrganizationRevenue> organizationRevenues;
    private Map<String, BigDecimal> revenueByPlan;
    private LocalDateTime generatedAt;

    @Data
    public static class OrganizationRevenue {
        private String organizationUuid;
        private String organizationName;
        private BigDecimal revenue;
        private int transactionCount;
        private String billingPlan;
        private int activeUsers;
        private String billingCycle;
    }
}
