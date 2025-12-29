package com.corehive.backend.controller;

import com.corehive.backend.dto.request.CreateDesignationRequest;
import com.corehive.backend.dto.request.UpdateDesignationRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Designation;
import com.corehive.backend.service.DesignationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Designation operations
 */
@RestController
@RequestMapping("/api/org-admin/designations")
@RequiredArgsConstructor
@Slf4j
public class DesignationController {

    private final DesignationService designationService;

    /**
     * Get all designations for the organization
     */
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<ApiResponse<List<Designation>>> getAllDesignations(HttpServletRequest httpRequest) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            if (organizationUuid == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied: Organization not found"));
            }

            List<Designation> designations = designationService.getDesignationsByOrganization(organizationUuid);

            return ResponseEntity.ok(ApiResponse.success("Designations retrieved successfully", designations));

        } catch (Exception e) {
            log.error("Error getting designations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Designation>> createDesignation(
            HttpServletRequest httpRequest,
            @Valid @RequestBody CreateDesignationRequest request) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            Designation createdDesignation = designationService.createDesignation(organizationUuid, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Designation created successfully", createdDesignation)
                    );

        } catch (Exception e) {
            log.error("Error creating designation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Designation>> updateDesignation(
            HttpServletRequest httpRequest,
            @PathVariable Long id,
            @Valid @RequestBody UpdateDesignationRequest request) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            request.setId(id);
            ApiResponse<Designation> response = designationService.updateDesignation(organizationUuid, request);

            if(response.isSuccess()){
                return ResponseEntity.ok(response);
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("Error updating designation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDesignation(
            HttpServletRequest httpRequest,
            @PathVariable Long id) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            ApiResponse<Void> response = designationService.deleteDesignation(organizationUuid, id);

            if(response.isSuccess()){
                return ResponseEntity.ok(response);
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("Error deleting designation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }
}