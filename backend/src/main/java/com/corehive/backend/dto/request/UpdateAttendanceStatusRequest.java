package com.corehive.backend.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateAttendanceStatusRequest {
    private String status;

    // OPTIONAL: allow HR to set check-in time manually
    private LocalDateTime checkInTime;
}
