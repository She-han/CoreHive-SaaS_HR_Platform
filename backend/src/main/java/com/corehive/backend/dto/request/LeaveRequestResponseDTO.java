package com.corehive.backend.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveRequestResponseDTO {
    private Long requestId;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private String status;
}
