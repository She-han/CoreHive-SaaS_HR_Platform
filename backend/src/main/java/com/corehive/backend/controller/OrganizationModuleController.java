package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.OrganizationModule;
import com.corehive.backend.service.OrganizationModuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Organization Module Controller
 * REST API endpoints for managing organization-module subscriptions
 */
@RestController
@RequestMapping("/api/organization-modules")
@RequiredArgsConstructor
@Slf4j
public class OrganizationModuleController {

    private final OrganizationModuleService organizationModuleService;

    /**
     * Get all modules for an organization
     * Accessible by org admins for their organization
     */
    @GetMapping("/{organizationUuid}")
    @PreAuthorize("hasAuthority('ORG_ADMIN') or hasAuthority('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<List<OrganizationModule>>> getOrganizationModules(
            @PathVariable String organizationUuid) {
        
        log.info("GET /api/organization-modules/{} - Fetching organization modules", organizationUuid);
        ApiResponse<List<OrganizationModule>> response = organizationModuleService.getOrganizationModules(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Get enabled modules for an organization
     * Accessible by org admins for their organization
     */
    @GetMapping("/{organizationUuid}/enabled")
    @PreAuthorize("hasAuthority('ORG_ADMIN') or hasAuthority('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<List<OrganizationModule>>> getEnabledModules(
            @PathVariable String organizationUuid) {
        
        log.info("GET /api/organization-modules/{}/enabled - Fetching enabled modules", organizationUuid);
        ApiResponse<List<OrganizationModule>> response = organizationModuleService.getEnabledModules(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Subscribe organization to a module
     * Only system admins can manage subscriptions
     */
    @PostMapping("/{organizationUuid}/subscribe/{moduleId}")
    @PreAuthorize("hasAuthority('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationModule>> subscribeToModule(
            @PathVariable String organizationUuid,
            @PathVariable Long moduleId) {
        
        log.info("POST /api/organization-modules/{}/subscribe/{} - Subscribing to module", organizationUuid, moduleId);
        ApiResponse<OrganizationModule> response = organizationModuleService.subscribeToModule(organizationUuid, moduleId);
        return ResponseEntity.ok(response);
    }

    /**
     * Unsubscribe organization from a module
     * Only system admins can manage subscriptions
     */
    @PostMapping("/{organizationUuid}/unsubscribe/{moduleId}")
    @PreAuthorize("hasAuthority('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> unsubscribeFromModule(
            @PathVariable String organizationUuid,
            @PathVariable Long moduleId) {
        
        log.info("POST /api/organization-modules/{}/unsubscribe/{} - Unsubscribing from module", organizationUuid, moduleId);
        ApiResponse<String> response = organizationModuleService.unsubscribeFromModule(organizationUuid, moduleId);
        return ResponseEntity.ok(response);
    }

    /**
     * Sync organization modules with organization boolean flags
     * Accessible by org admins for their organization
     */
    @PostMapping("/{organizationUuid}/sync")
    @PreAuthorize("hasAuthority('ORG_ADMIN') or hasAuthority('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> syncOrganizationModules(
            @PathVariable String organizationUuid) {
        
        log.info("POST /api/organization-modules/{}/sync - Syncing organization modules", organizationUuid);
        ApiResponse<String> response = organizationModuleService.syncOrganizationModules(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Get subscription count for a specific module
     * Only system admins can view subscription statistics
     */
    @GetMapping("/module/{moduleId}/subscription-count")
    @PreAuthorize("hasAuthority('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getModuleSubscriptionCount(
            @PathVariable Long moduleId) {
        
        log.info("GET /api/organization-modules/module/{}/subscription-count - Fetching subscription count", moduleId);
        ApiResponse<Long> response = organizationModuleService.getModuleSubscriptionCount(moduleId);
        return ResponseEntity.ok(response);
    }
}
