package com.corehive.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceEmployeeDTO {
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String todayStatus; // NOT_CHECKED_IN / CHECKED_IN / COMPLETED
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
}
