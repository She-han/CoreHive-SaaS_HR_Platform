package com.corehive.backend.dto.attendance;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceSummaryReportDTO {

    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String department;
    private String designation;

    private long totalWorkingDays;
    private long present;
    private long absent;
    private long late;
    private long halfDay;
    private long leave;

    private double attendancePercentage;
}

