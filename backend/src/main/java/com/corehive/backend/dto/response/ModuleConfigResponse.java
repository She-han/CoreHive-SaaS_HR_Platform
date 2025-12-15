package com.corehive.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModuleConfigResponse {
    private String organizationUuid;
    private String organizationName;
    
    // Current module status
    private Boolean moduleQrAttendanceMarking;
    private Boolean moduleFaceRecognitionAttendanceMarking;
    private Boolean moduleEmployeeFeedback;
    private Boolean moduleHiringManagement;
    private Boolean modulesConfigured;
}