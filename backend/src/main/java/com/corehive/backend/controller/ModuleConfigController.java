package com.corehive.backend.controller;

import com.corehive.backend.dto.request.UpdateModuleConfigRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.ModuleConfigResponse;
import com.corehive.backend.service.OrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/org-admin/modules")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ORG_ADMIN')")
public class ModuleConfigController {

    private final OrganizationService organizationService;

    /**
     * Get current module configuration
     */
    @GetMapping
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
     * Update module configuration
     */
    @PutMapping
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