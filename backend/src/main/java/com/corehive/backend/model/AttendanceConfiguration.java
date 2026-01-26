package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "attendance_configuration")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "work_start_time", nullable = false)
    private LocalTime workStartTime;

    @Column(name = "work_end_time", nullable = false)
    private LocalTime workEndTime;

    @Column(name = "late_threshold", nullable = false)
    private LocalTime lateThreshold;

    @Column(name = "evening_half_day_threshold", nullable = false)
    private LocalTime eveningHalfDayThreshold;

    @Column(name = "absent_threshold", nullable = false)
    private LocalTime absentThreshold;

    @Column(name = "morning_half_day_threshold", nullable = false)
    private LocalTime morningHalfDayThreshold;

    @Column(name = "ot_start_time", nullable = false)
    private LocalTime otStartTime;

    @Column(name = "leave_deduction_amount", precision = 10, scale = 2)
    private BigDecimal leaveDeductionAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false, length = 30)
    private ApplicationType applicationType;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"employees", "jobPostings", "hibernateLazyInitializer", "handler"})
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Employee employee;

    public enum ApplicationType {
        ALL_EMPLOYEES,
        DEPARTMENT_WISE,
        DESIGNATION_WISE,
        EMPLOYEE_SPECIFIC
    }
}
