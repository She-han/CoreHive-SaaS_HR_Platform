package com.corehive.backend.dto;

import lombok.Data;

@Data
public class LeaveTypeDTO {
    private Long id;
    private String name;
    private String code;
    private Integer defaultDaysPerYear;
    private Boolean requiresApproval;
    private Boolean isActive;
}
