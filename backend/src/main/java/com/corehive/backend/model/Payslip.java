package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payslip")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payslip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;
    
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;
    
    @Column(name = "employee_code", length = 50)
    private String employeeCode;
    
    @Column(name = "employee_name", length = 200)
    private String employeeName;
    
    @Column(name = "designation", length = 100)
    private String designation;
    
    @Column(name = "department_name", length = 200)
    private String departmentName;
    
    @Column(name = "bank_acc_no", length = 50)
    private String bankAccNo;
    
    // Salary Period
    @Column(name = "month", nullable = false)
    private Integer month; // 1-12
    
    @Column(name = "year", nullable = false)
    private Integer year;
    
    @Column(name = "working_days")
    private Integer workingDays;
    
    @Column(name = "present_days")
    private Integer presentDays;
    
    // Salary Components
    @Column(name = "basic_salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal basicSalary;
    
    @Column(name = "total_allowances", precision = 12, scale = 2)
    private BigDecimal totalAllowances = BigDecimal.ZERO;
    
    @Column(name = "allowance_details", columnDefinition = "TEXT")
    private String allowanceDetails; // JSON string of allowances
    
    @Column(name = "overtime_hours", precision = 10, scale = 2)
    private BigDecimal overtimeHours = BigDecimal.ZERO;
    
    @Column(name = "overtime_amount", precision = 12, scale = 2)
    private BigDecimal overtimeAmount = BigDecimal.ZERO;
    
    @Column(name = "gross_salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal grossSalary;
    
    // Deductions
    @Column(name = "epf_employee", precision = 12, scale = 2)
    private BigDecimal epfEmployee = BigDecimal.ZERO;
    
    @Column(name = "epf_employer", precision = 12, scale = 2)
    private BigDecimal epfEmployer = BigDecimal.ZERO;
    
    @Column(name = "etf", precision = 12, scale = 2)
    private BigDecimal etf = BigDecimal.ZERO;
    
    @Column(name = "tax", precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(name = "other_deductions", precision = 12, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;
    
    @Column(name = "deduction_details", columnDefinition = "TEXT")
    private String deductionDetails; // JSON string of deductions
    
    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;
    
    @Column(name = "net_salary", precision = 12, scale = 2, nullable = false)
    private BigDecimal netSalary;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PayslipStatus status = PayslipStatus.DRAFT;
    
    @Column(name = "generated_by")
    private Long generatedBy;
    
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum PayslipStatus {
        DRAFT,
        GENERATED,
        APPROVED,
        PAID
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
