package com.corehive.backend.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodayAttendanceDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String status;
    private boolean isComplete;
}