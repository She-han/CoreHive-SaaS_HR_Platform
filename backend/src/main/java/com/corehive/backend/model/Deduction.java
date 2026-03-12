package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "deduction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deduction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name; // e.g., "Loan Deduction", "Insurance Premium"
    
    @Column(name = "amount", precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "deduction_type", nullable = false)
    private DeductionType deductionType;
    
    // For targeting specific groups
    @Column(name = "department_id")
    private Long departmentId; // null = applies to all
    
    @Column(name = "designation", length = 100)
    private String designation; // null = applies to all
    
    @Column(name = "employee_id")
    private Long employeeId; // null = applies to group
    
    @Column(name = "is_percentage")
    private Boolean isPercentage = false; // true = percentage of basic salary
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum DeductionType {
        ALL_EMPLOYEES,
        DEPARTMENT_WISE,
        DESIGNATION_WISE,
        EMPLOYEE_SPECIFIC
    }
    
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
