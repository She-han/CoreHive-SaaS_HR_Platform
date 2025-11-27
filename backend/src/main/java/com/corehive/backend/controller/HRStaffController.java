package com.corehive.backend.controller;

import com.corehive.backend.dto.request.CreateHRStaffRequest;
import com.corehive.backend.dto.request.UpdateHRStaffRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.CreateHRStaffResponse;
import com.corehive.backend.dto.response.HRStaffResponse;
import com.corehive.backend.service.HRStaffService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
 * REST controller for HR Staff management operations
 * Only accessible by ORG_ADMIN role users
 */
@RestController
@RequestMapping("/api/org-admin/hr-staff")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class HRStaffController {

    private final HRStaffService hrStaffService;

    /**
     * Get all HR staff members with pagination
     */
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Page<HRStaffResponse>>> getAllHRStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {
        
        try {
            log.info("GET /api/org-admin/hr-staff - page: {}, size: {}", page, size);

            String organizationUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            log.info("HR staff retrieval request from user: {} for organization: {}", userEmail, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            ApiResponse<Page<HRStaffResponse>> response = hrStaffService.getAllHRStaff(organizationUuid, pageable);
            
            log.info("HR staff retrieval completed for organization: {}", organizationUuid);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in getAllHRStaff", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get all HR staff members without pagination
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<HRStaffResponse>>> getAllHRStaffNoPagination(HttpServletRequest request) {
        try {
            log.info("GET /api/org-admin/hr-staff/all");

            String organizationUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            log.info("HR staff retrieval (all) request from user: {} for organization: {}", userEmail, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            ApiResponse<List<HRStaffResponse>> response = hrStaffService.getAllHRStaff(organizationUuid);
            
            log.info("HR staff retrieval (all) completed for organization: {}", organizationUuid);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in getAllHRStaffNoPagination", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get HR staff member by ID
     */
    @GetMapping("/{hrStaffId}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<HRStaffResponse>> getHRStaffById(
            @PathVariable Long hrStaffId, 
            HttpServletRequest request) {
        try {
            log.info("GET /api/org-admin/hr-staff/{}", hrStaffId);

            String organizationUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            log.info("HR staff detail request from user: {} for staff ID: {} in organization: {}", 
                    userEmail, hrStaffId, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            ApiResponse<HRStaffResponse> response = hrStaffService.getHRStaffById(organizationUuid, hrStaffId);
            
            if (response.isSuccess()) {
                log.info("HR staff retrieved successfully: {}", hrStaffId);
                return ResponseEntity.ok(response);
            } else {
                log.warn("HR staff not found: {}", hrStaffId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

        } catch (Exception e) {
            log.error("Error in getHRStaffById for ID: {}", hrStaffId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Create new HR staff member
     */
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<CreateHRStaffResponse>> createHRStaff(
            @Valid @RequestBody CreateHRStaffRequest request, 
            HttpServletRequest httpRequest) {
        try {
            log.info("POST /api/org-admin/hr-staff - Creating HR staff with email: {}", request.getEmail());

            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            
            log.info("HR staff creation request from user: {} for organization: {}", userEmail, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            ApiResponse<CreateHRStaffResponse> response = hrStaffService.createHRStaff(organizationUuid, request);
            
            if (response.isSuccess()) {
                log.info("HR staff created successfully for organization: {}", organizationUuid);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                log.warn("HR staff creation failed: {}", response.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (RuntimeException e) {
            log.error("Runtime error in createHRStaff: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create HR staff: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error in createHRStaff", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Update HR staff member
     */
    @PutMapping("/{hrStaffId}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<HRStaffResponse>> updateHRStaff(
            @PathVariable Long hrStaffId, 
            @Valid @RequestBody UpdateHRStaffRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            log.info("PUT /api/org-admin/hr-staff/{} - Updating HR staff", hrStaffId);

            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            
            log.info("HR staff update request from user: {} for staff ID: {} in organization: {}", 
                    userEmail, hrStaffId, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            // Ensure the path ID matches the request ID
            request.setId(hrStaffId);

            ApiResponse<HRStaffResponse> response = hrStaffService.updateHRStaff(organizationUuid, request);
            
            if (response.isSuccess()) {
                log.info("HR staff updated successfully: {}", hrStaffId);
                return ResponseEntity.ok(response);
            } else {
                log.warn("HR staff update failed for ID {}: {}", hrStaffId, response.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("Error in updateHRStaff for ID: {}", hrStaffId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Delete HR staff member
     */
    @DeleteMapping("/{hrStaffId}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteHRStaff(
            @PathVariable Long hrStaffId, 
            HttpServletRequest request) {
        try {
            log.info("DELETE /api/org-admin/hr-staff/{}", hrStaffId);

            String organizationUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            log.info("HR staff deletion request from user: {} for staff ID: {} in organization: {}", 
                    userEmail, hrStaffId, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            ApiResponse<String> response = hrStaffService.deleteHRStaff(organizationUuid, hrStaffId);
            
            if (response.isSuccess()) {
                log.info("HR staff deleted successfully: {}", hrStaffId);
                return ResponseEntity.ok(response);
            } else {
                log.warn("HR staff deletion failed for ID {}: {}", hrStaffId, response.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

        } catch (Exception e) {
            log.error("Error in deleteHRStaff for ID: {}", hrStaffId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Search HR staff members
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Page<HRStaffResponse>>> searchHRStaff(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            HttpServletRequest request) {
        
        try {
            log.info("GET /api/org-admin/hr-staff/search - searchTerm: {}", searchTerm);

            String organizationUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            log.info("HR staff search request from user: {} with term: {} for organization: {}", 
                    userEmail, searchTerm, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

            ApiResponse<Page<HRStaffResponse>> response = hrStaffService.searchHRStaff(organizationUuid, searchTerm, pageable);
            
            log.info("HR staff search completed for organization: {}", organizationUuid);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in searchHRStaff", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get HR staff count for the organization
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getHRStaffCount(HttpServletRequest request) {
        try {
            log.info("GET /api/org-admin/hr-staff/count");

            String organizationUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            log.info("HR staff count request from user: {} for organization: {}", userEmail, organizationUuid);

            if (organizationUuid == null) {
                log.warn("Organization UUID not found for user: {}", userEmail);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
            }

            ApiResponse<Long> response = hrStaffService.getHRStaffCount(organizationUuid);
            
            log.info("HR staff count retrieval completed for organization: {}", organizationUuid);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in getHRStaffCount", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }
}