package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDTO {
    private Long id;
    private String organizationUuid;
    private String name;
    private String code;
    private Long managerId;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
