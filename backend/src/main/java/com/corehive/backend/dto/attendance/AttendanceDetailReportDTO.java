package com.corehive.backend.dto.attendance;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceDetailReportDTO {

    private LocalDate date;
    private String day;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;

    private String workingHours;
    private String status;
    private String remarks;
}

