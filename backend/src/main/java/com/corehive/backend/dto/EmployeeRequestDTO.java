package com.corehive.backend.dto;

import lombok.Data;

@Data
public class EmployeeRequestDTO {

    private String employeeCode;
    private Long department;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private String designation;
    private String salaryType;   // Monthly or Daily
    private String basicSalary;
    private Integer leaveCount;
    private String dateJoined;   // YYYY-MM-DD
    private String status;       // Active / NonActive
}
