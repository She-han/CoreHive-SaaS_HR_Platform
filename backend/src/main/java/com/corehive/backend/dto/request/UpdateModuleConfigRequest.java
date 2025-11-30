package com.corehive.backend.dto.request;

import lombok.Data;

@Data
public class UpdateModuleConfigRequest {
    private Boolean moduleQrAttendanceMarking;
    private Boolean moduleFaceRecognitionAttendanceMarking;
    private Boolean moduleEmployeeFeedback;
    private Boolean moduleHiringManagement;
}