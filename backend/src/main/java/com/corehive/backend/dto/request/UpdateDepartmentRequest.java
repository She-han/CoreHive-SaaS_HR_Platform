package com.corehive.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateDepartmentRequest {


    private Long id;

    @Size(max=100)
    private String name;

    @Size(max=50)
    private String code;

    private Long managerId; // optional

    private Boolean isActive;
}
