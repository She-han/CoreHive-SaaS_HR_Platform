package com.corehive.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UpdateDepartmentResponse {
    private Long id;
    private String name;
    private String code;
    private Long managerId;
    private Boolean isActive;
}
