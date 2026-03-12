package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_configuration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;
    
    // OT (Overtime) Configuration
    @Column(name = "ot_rate_per_hour", precision = 10, scale = 2)
    private BigDecimal otRatePerHour;
    
    @Column(name = "ot_multiplier", precision = 5, scale = 2)
    private BigDecimal otMultiplier = BigDecimal.valueOf(1.5); // Default 1.5x
    
    // ETF/EPF Configuration (percentages)
    @Column(name = "epf_employer_percentage", precision = 5, scale = 2)
    private BigDecimal epfEmployerPercentage = BigDecimal.valueOf(12.0);
    
    @Column(name = "epf_employee_percentage", precision = 5, scale = 2)
    private BigDecimal epfEmployeePercentage = BigDecimal.valueOf(8.0);
    
    @Column(name = "etf_percentage", precision = 5, scale = 2)
    private BigDecimal etfPercentage = BigDecimal.valueOf(3.0);
    
    // Tax deduction percentage
    @Column(name = "tax_percentage", precision = 5, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
