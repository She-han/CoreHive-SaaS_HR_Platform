package com.corehive.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRowDto {
    private Long employeeId;
    private String name;
    private String dept;
    private String checkIn;
    private String checkOut;
    private Integer workingMinutes;
    private String status;
}
