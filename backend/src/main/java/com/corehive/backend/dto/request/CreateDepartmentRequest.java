package com.corehive.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(max = 100, message = "Department name must be at most 100 characters")
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(max = 50, message = "Department code must be at most 50 characters")
    private String code;

    private Long managerId; //optional
}
