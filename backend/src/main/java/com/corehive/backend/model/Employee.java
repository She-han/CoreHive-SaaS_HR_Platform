package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "organization_uuid", nullable = false, length = 36)
        private String organizationUuid;

        @Column(name = "app_user_id", unique = true)
        private Long appUserId;

        @Column(name = "employee_code", length = 50)
        private String employeeCode;

        @Column(name = "first_name", nullable = false, length = 100)
        private String firstName;

        @Column(name = "last_name", nullable = false, length = 100)
        private String lastName;

        @Column(name = "email", length = 200 , unique = true)
        private String email;

        @Column(name = "phone", length = 50)
        private String phone;

        // ADD THIS - National ID field
        @Column(name = "national_id", length = 50)
        private String nationalId;

        @Column(name = "designation", length = 100)
        private String designation;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "department_id", referencedColumnName = "id", insertable = false, updatable = false)
        private Department department;

        @Column(name = "department_id")
        private Long departmentId;

        @Column(name = "basic_salary", precision = 12, scale = 2)
        private BigDecimal basicSalary;

        @Column(name = "date_of_joining")
        private LocalDate dateOfJoining;

        @Column(name = "is_active")
        private Boolean isActive = true;

        @Column(name = "created_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
        private LocalDateTime createdAt;

        @Column(name = "updated_at", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
        private LocalDateTime updatedAt;

        @Enumerated(EnumType.STRING)
        @Column(name = "salary_type", columnDefinition = "ENUM('MONTHLY','DAILY') DEFAULT 'MONTHLY'")
        private SalaryType salaryType = SalaryType.MONTHLY;

        @Column(name = "leave_count")
        private Integer leaveCount = 0;

        @Column(name = "qr_token", length = 64, unique = true)
        private String qrToken;


    public enum SalaryType {
                MONTHLY,
                DAILY
        }
}