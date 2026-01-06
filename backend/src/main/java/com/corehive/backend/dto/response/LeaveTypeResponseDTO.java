package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeResponseDTO {
    private Long id;
    private String name;
    private String code;
    private Integer defaultDaysPerYear;
    private Boolean requiresApproval;
    private Boolean isActive;
}
