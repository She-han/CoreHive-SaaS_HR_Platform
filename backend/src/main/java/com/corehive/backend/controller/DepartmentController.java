package com.corehive.backend.controller;

import com.corehive.backend.dto.request.CreateDepartmentRequest;
import com.corehive.backend.dto.request.UpdateDepartmentRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.DepartmentDTO;
import com.corehive.backend.dto.response.UpdateDepartmentResponse;
import com.corehive.backend.model.Department;
import com.corehive.backend.service.DepartmentService;
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
 * REST Controller for Department operations
 */
@RestController
@RequestMapping("/api/org-admin/departments")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * Get all departments for the organization
     */
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllDepartments(HttpServletRequest httpRequest) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            if (organizationUuid == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied: Organization not found"));
            }

            // Ensure default departments exist
            departmentService.ensureDefaultDepartments(organizationUuid);

            // Return DTOs
            List<DepartmentDTO> departmentsDTO = departmentService.getDepartmentsDTOByOrganization(organizationUuid);

            return ResponseEntity.ok(ApiResponse.success("Departments retrieved successfully", departmentsDTO));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }


    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Department>> createDepartment(
            HttpServletRequest httpRequest,
            @Valid @RequestBody CreateDepartmentRequest request) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            Department createdDept = departmentService.createDepartment(organizationUuid, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Department created successfully", createdDept)
            );

        } catch (Exception e) {
            log.error("Error creating department", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<UpdateDepartmentResponse>> updateDepartment(
            HttpServletRequest httpRequest,
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        try {
            String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");

            request.setId(id);
            ApiResponse<UpdateDepartmentResponse> response = departmentService.updateDepartment(organizationUuid,request);

            if(response.isSuccess()){
                return ResponseEntity.ok(response);
            }else{
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("Error updating department", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal server error: " + e.getMessage()));
        }
    }
}