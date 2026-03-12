package com.corehive.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Module Usage Report DTO
 * Response for extended module adoption analysis
 */
@Data
public class ModuleUsageReportDTO {

    private List<ModuleUsage> moduleUsages;
    private int totalOrganizations;
    private int totalActiveModuleSubscriptions;
    private String timePeriod;
    private LocalDateTime generatedAt;

    @Data
    public static class ModuleUsage {
        private String moduleName;
        private String moduleDescription;
        private int activeOrganizations;
        private double adoptionRate;
    }
}
