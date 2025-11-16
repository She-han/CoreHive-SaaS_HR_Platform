package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.OrganizationSummaryResponse;
import com.corehive.backend.service.OrganizationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Controller
 * System Admin operations (Platform level)
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final OrganizationService organizationService;

    /**
     * Get Pending Organization Approvals
     * GET /api/admin/organizations/pending
     *
     * Show approval queue in system admin dashboard
     */
    @GetMapping("/organizations/pending")
    @PreAuthorize("hasRole('SYS_ADMIN')") // Extra security check
    public ResponseEntity<ApiResponse<List<OrganizationSummaryResponse>>> getPendingApprovals(
            HttpServletRequest request) {

        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Pending approvals request from admin: {}", adminEmail);

        try {
            ApiResponse<List<OrganizationSummaryResponse>> response =
                    organizationService.getPendingApprovals();

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;

            log.info("Pending approvals retrieved by {}: {} organizations",
                    adminEmail, response.getData() != null ? response.getData().size() : 0);

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving pending approvals for admin: {}", adminEmail, e);
            ApiResponse<List<OrganizationSummaryResponse>> errorResponse =
                    ApiResponse.error("Failed to retrieve pending approvals");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Approve Organization Registration
     * PUT /api/admin/organizations/{organizationUuid}/approve
     *
     * Approve organization registration
     */
    @PutMapping("/organizations/{organizationUuid}/approve")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> approveOrganization(
            @PathVariable String organizationUuid,
            HttpServletRequest request) {

        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Organization approval request from admin: {} for org: {}", adminEmail, organizationUuid);

        try {
            ApiResponse<String> response = organizationService.approveOrganization(organizationUuid);

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;

            log.info("Organization {} approval by {}: {} - Message: {}",
                    organizationUuid, adminEmail, response.isSuccess() ? "SUCCESS" : "FAILED", response.getMessage());

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error approving organization {} by admin: {}", organizationUuid, adminEmail, e);
            ApiResponse<String> errorResponse = ApiResponse.error("Failed to approve organization: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Reject Organization Registration
     * PUT /api/admin/organizations/{organizationUuid}/reject
     *
     * Reject organization registration
     */
    @PutMapping("/organizations/{organizationUuid}/reject")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> rejectOrganization(
            @PathVariable String organizationUuid,
            HttpServletRequest request) {

        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Organization rejection request from admin: {} for org: {}", adminEmail, organizationUuid);

        try {
            ApiResponse<String> response = organizationService.rejectOrganization(organizationUuid);

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;

            log.info("Organization {} rejection by {}: {}",
                    organizationUuid, adminEmail, response.isSuccess() ? "SUCCESS" : "FAILED");

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error rejecting organization {} by admin: {}", organizationUuid, adminEmail, e);
            ApiResponse<String> errorResponse = ApiResponse.error("Failed to reject organization");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get All Organizations (with pagination)
     * GET /api/admin/organizations?page=0&size=10&sort=createdAt,desc
     *
     * List all organizations for system admin dashboard
     */
    @GetMapping("/organizations")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrganizationSummaryResponse>>> getAllOrganizations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {

        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("All organizations request from admin: {} (page: {}, size: {})", adminEmail, page, size);

        try {
            // Determine sort direction
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC;

            // Create Pageable object
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            ApiResponse<Page<OrganizationSummaryResponse>> response =
                    organizationService.getAllOrganizations(pageable);

            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;

            if (response.isSuccess()) {
                Page<OrganizationSummaryResponse> pageData = response.getData();
                log.info("Organizations retrieved by {}: {} of {} total",
                        adminEmail, pageData.getNumberOfElements(), pageData.getTotalElements());
            }

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving organizations for admin: {}", adminEmail, e);
            ApiResponse<Page<OrganizationSummaryResponse>> errorResponse =
                    ApiResponse.error("Failed to retrieve organizations");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Change Organization Status
     * PUT /api/admin/organizations/{organizationUuid}/status
     *
     * Change organization status (ACTIVE, DORMANT, SUSPENDED)
     */
    @PutMapping("/organizations/{organizationUuid}/status")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<String>> changeOrganizationStatus(
            @PathVariable String organizationUuid,
            @RequestParam String status,
            HttpServletRequest request) {

        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Organization status change request from admin: {} for org: {} to status: {}",
                adminEmail, organizationUuid, status);

        try {
            // Check valid status values
            if (!isValidStatus(status)) {
                ApiResponse<String> errorResponse =
                        ApiResponse.error("Invalid status. Allowed: ACTIVE, DORMANT, SUSPENDED");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            ApiResponse<String> response =
                    organizationService.changeOrganizationStatus(organizationUuid, status);

            HttpStatus httpStatus = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;

            log.info("Organization {} status change by {} to {}: {}",
                    organizationUuid, adminEmail, status, response.isSuccess() ? "SUCCESS" : "FAILED");

            return ResponseEntity.status(httpStatus).body(response);

        } catch (Exception e) {
            log.error("Error changing organization status for {} by admin: {}", organizationUuid, adminEmail, e);
            ApiResponse<String> errorResponse = ApiResponse.error("Failed to change organization status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get Platform Statistics
     * GET /api/admin/statistics
     *
     * Platform level statistics (for dashboard charts)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<PlatformStatistics>> getPlatformStatistics(HttpServletRequest request) {

        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Platform statistics request from admin: {}", adminEmail);

        try {
            // TODO: Implement PlatformStatistics service
            // Currently returning basic response
            PlatformStatistics stats = PlatformStatistics.builder()
                    .totalOrganizations(10L)
                    .activeOrganizations(8L)
                    .pendingOrganizations(2L)
                    .totalEmployees(150L)
                    .build();

            ApiResponse<PlatformStatistics> response =
                    ApiResponse.success("Platform statistics retrieved successfully", stats);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving platform statistics for admin: {}", adminEmail, e);
            ApiResponse<PlatformStatistics> errorResponse =
                    ApiResponse.error("Failed to retrieve platform statistics");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get Organization Details by UUID
     * GET /api/admin/organizations/{organizationUuid}
     *
     * Get detailed organization information for review
     */
    @GetMapping("/organizations/{organizationUuid}")
    @PreAuthorize("hasRole('SYS_ADMIN')")
    public ResponseEntity<ApiResponse<OrganizationSummaryResponse>> getOrganizationDetails(
            @PathVariable String organizationUuid,
            HttpServletRequest request) {
        
        String adminEmail = (String) request.getAttribute("userEmail");
        log.info("Organization details request from admin: {} for org: {}", adminEmail, organizationUuid);

        try {
            ApiResponse<OrganizationSummaryResponse> response = 
                    organizationService.getOrganizationDetails(organizationUuid);
            
            HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
            
            if (response.isSuccess()) {
                log.info("Organization details retrieved by {}: {}", adminEmail, organizationUuid);
            }
            
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error retrieving organization details for admin: {} and org: {}", 
                    adminEmail, organizationUuid, e);
            ApiResponse<OrganizationSummaryResponse> errorResponse =
                    ApiResponse.error("Failed to retrieve organization details");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Helper method - Check valid organization status
     */
    private boolean isValidStatus(String status) {
        return status != null && (
                status.equalsIgnoreCase("ACTIVE") ||
                        status.equalsIgnoreCase("DORMANT") ||
                        status.equalsIgnoreCase("SUSPENDED")
        );
    }
}

/**
 * Platform Statistics DTO (Future implementation)
 */
@lombok.Data
@lombok.Builder
class PlatformStatistics {
    private Long totalOrganizations;
    private Long activeOrganizations;
    private Long pendingOrganizations;
    private Long dormantOrganizations;
    private Long suspendedOrganizations;
    private Long totalEmployees;
    private Long totalSystemUsers;
}