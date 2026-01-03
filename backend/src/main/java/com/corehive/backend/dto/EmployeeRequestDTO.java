package com.corehive.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating and updating employee
 */
@Data
public class EmployeeRequestDTO {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    @JsonProperty("firstName")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    @JsonProperty("lastName")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Size(max = 200, message = "Email must not exceed 200 characters")
    @JsonProperty("email")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    @JsonProperty("phone")
    private String phone;


    @NotBlank(message = "National ID is required")
    @Size(max = 50, message = "National ID must not exceed 50 characters")
    @JsonProperty("nationalId")
    private String nationalId;

    @NotBlank(message = "Designation is required")
    @Size(max = 100, message = "Designation must not exceed 100 characters")
    @JsonProperty("designation")
    private String designation;

    @NotNull(message = "Department ID is required")
    @JsonProperty("department")
    private Long department;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Basic salary must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Basic salary format is invalid")
    @JsonProperty("basicSalary")
    private BigDecimal basicSalary;

    @NotBlank(message = "Salary type is required")
    @Pattern(regexp = "MONTHLY|DAILY", message = "Salary type must be MONTHLY or DAILY")
    @JsonProperty("salaryType")
    private String salaryType;

    @NotNull(message = "Leave count is required")
    @Min(value = 0, message = "Leave count must be at least 0")
    @JsonProperty("leaveCount")
    private Integer leaveCount;

    @NotNull(message = "Date of joining is required")
    @JsonProperty("dateOfJoining")
    private LocalDate dateOfJoining;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "Active|NonActive", message = "Status must be Active or NonActive")
    @JsonProperty("status")
    private String status;
}