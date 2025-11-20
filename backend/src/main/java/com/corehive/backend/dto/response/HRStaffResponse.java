package com.corehive.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for HR staff response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HRStaffResponse {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("appUserId")
    private Long appUserId;

    @JsonProperty("employeeCode")
    private String employeeCode;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("designation")
    private String designation;

    @JsonProperty("departmentId")
    private Long departmentId;

    @JsonProperty("departmentName")
    private String departmentName;

    @JsonProperty("basicSalary")
    private BigDecimal basicSalary;

    @JsonProperty("dateOfJoining")
    private LocalDate dateOfJoining;

    @JsonProperty("salaryType")
    private String salaryType;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // Helper methods for UI
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getFormattedSalary() {
        return String.format("$%,.2f", basicSalary);
    }

    public String getStatusDisplay() {
        return isActive ? "Active" : "Inactive";
    }
}