package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Platform Statistics DTO
 * Contains all platform-level statistics for System Admin dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatistics {
    private Long totalOrganizations;
    private Long activeOrganizations;
    private Long pendingOrganizations;
    private Long dormantOrganizations;
    private Long suspendedOrganizations;
    private Long totalEmployees;
    private Long totalSystemUsers;
}
