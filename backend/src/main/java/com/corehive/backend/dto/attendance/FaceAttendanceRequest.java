package com.corehive.backend.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceAttendanceRequest {

    // For Kiosk mode - HR marking for specific employee
    private Long employeeId;
    private String organizationUuid;

    // Verification details from AI service
    private String verificationConfidence;

    // Device info
    private String deviceInfo;
    private String ipAddress;

    // Optional notes
    private String notes;
}