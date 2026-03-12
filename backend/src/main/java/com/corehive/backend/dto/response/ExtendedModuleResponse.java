package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Extended Module Response DTO
 * For returning extended module data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtendedModuleResponse {

    private Long moduleId;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean isActive;
    private String moduleKey;
    private String icon;
    private String category;
    private String displayName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
