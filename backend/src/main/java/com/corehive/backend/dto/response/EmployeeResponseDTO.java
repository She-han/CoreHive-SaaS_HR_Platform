package com.corehive.backend.dto.response;

import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class EmployeeResponseDTO {

    private String employeeCode;

    private String firstName;


    private String lastName;


    private String email;


    private String phone;


    private String designation;


    private Department department;


    private Long departmentId;


    private BigDecimal basicSalary;


    private LocalDate dateOfJoining;


    private Boolean isActive = true;


    private Employee.SalaryType salaryType = Employee.SalaryType.MONTHLY;

    private Integer leaveCount = 0;

    // ===== Enum for Salary Type =====
    public enum SalaryType {
        MONTHLY,
        DAILY
    }

}
