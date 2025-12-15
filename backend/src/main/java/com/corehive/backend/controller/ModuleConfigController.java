package com.corehive.backend.controller;

import com.corehive.backend.dto.request.UpdateModuleConfigRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.ModuleConfigResponse;
import com.corehive.backend.service.OrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequiredArgsConstructor
@Slf4j
public class ModuleConfigController {

    private final OrganizationService organizationService;

    /**
     * Get current module configuration - ORG_ADMIN only
     * Endpoint: GET /api/org-admin/modules
     */

    @GetMapping("/api/org-admin/modules")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ModuleConfigResponse>> getModuleConfig(
            HttpServletRequest httpRequest) {

        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Getting module configuration for organization: {}", organizationUuid);
        ApiResponse<ModuleConfigResponse> response = organizationService.getModuleConfiguration(organizationUuid);

        return ResponseEntity.ok(response);
    }

    /**
     * Get organization module status - HR_STAFF and ORG_ADMIN
     * Endpoint: GET /api/hr-staff/modules/status
     */
    @GetMapping("/api/hr-staff/modules/status")
    @PreAuthorize("hasAnyRole('HR_STAFF', 'ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ModuleConfigResponse>> getModuleStatusForHRStaff(
            HttpServletRequest request) {

        try {
            String organizationUuid = (String) request.getAttribute("organizationUuid");

            log.info("HR Staff requesting module status for organization: {}", organizationUuid);

            if (organizationUuid == null || organizationUuid.isEmpty()) {
                log.warn("Organization UUID not found in request");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Organization UUID not found in request"));
            }

            ApiResponse<ModuleConfigResponse> response = organizationService.getModuleConfiguration(organizationUuid);
            log.info("Successfully retrieved module configuration for HR Staff");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching module status for HR staff", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch module status: " + e.getMessage()));
        }
    }

    /**
     * Update module configuration - ORG_ADMIN only
     * Endpoint: PUT /api/org-admin/modules
     */
    @PutMapping("/api/org-admin/modules")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<ModuleConfigResponse>> updateModuleConfig(
            HttpServletRequest httpRequest,
            @RequestBody UpdateModuleConfigRequest request) {

        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Updating module configuration for organization: {}", organizationUuid);
        ApiResponse<ModuleConfigResponse> response = organizationService.updateModuleConfiguration(
                organizationUuid, request);

        return ResponseEntity.ok(response);
    }
}