package com.corehive.backend.controller;

import com.corehive.backend.dto.DepartmentDTO;
import com.corehive.backend.dto.request.CreateDepartmentRequest;
import com.corehive.backend.dto.response.ApiResponse;
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

@RestController
@RequestMapping("/api/org-admin/departments")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {

    private final DepartmentService departmentService;

    // ✅ Get all departments
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllDepartments(HttpServletRequest httpRequest) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        if (organizationUuid == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Organization not found"));
        }

        departmentService.ensureDefaultDepartments(organizationUuid);
        List<DepartmentDTO> departments = departmentService.getDepartmentsByOrganizationDto(organizationUuid);

        return ResponseEntity.ok(ApiResponse.success("Departments retrieved successfully", departments));
    }

    // ✅ Create department
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(
            HttpServletRequest httpRequest,
            @Valid @RequestBody CreateDepartmentRequest request) {

        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        DepartmentDTO createdDept = departmentService.createDepartmentDto(organizationUuid, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", createdDept));
    }

    // ✅ Update department
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(
            HttpServletRequest httpRequest,
            @PathVariable("id") Long departmentId,
            @Valid @RequestBody CreateDepartmentRequest request) {

        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        DepartmentDTO updatedDept = departmentService.updateDepartmentDto(departmentId, request, organizationUuid);

        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", updatedDept));
    }
}
