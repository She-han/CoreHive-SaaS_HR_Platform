package com.corehive.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Extended Module Request DTO
 * For creating or updating extended modules
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtendedModuleRequest {

    @NotBlank(message = "Module name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price must be zero or positive")
    private BigDecimal price;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    @NotBlank(message = "Module key is required")
    private String moduleKey;

    private String icon;

    private String category;
}
