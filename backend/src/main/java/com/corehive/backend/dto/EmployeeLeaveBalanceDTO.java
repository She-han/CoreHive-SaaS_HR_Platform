package com.corehive.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeLeaveBalanceDTO {
    
    @NotNull(message = "Leave type ID is required")
    @JsonProperty("leaveTypeId")
    private Long leaveTypeId;
    
    @JsonProperty("leaveTypeName")
    private String leaveTypeName;
    
    @JsonProperty("leaveTypeCode")
    private String leaveTypeCode;
    
    @NotNull(message = "Balance is required")
    @Min(value = 0, message = "Balance cannot be negative")
    @JsonProperty("balance")
    private Integer balance;
}
