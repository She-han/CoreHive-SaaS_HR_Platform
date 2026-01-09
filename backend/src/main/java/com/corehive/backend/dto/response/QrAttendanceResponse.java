package com.corehive.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class QrAttendanceResponse {
    private Long employeeId;
    private LocalDate attendanceDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private boolean completed;

    // CHECK_IN / CHECK_OUT / ALREADY_COMPLETED
    private String action;

    // Message to show in UI
    private String message;
}
