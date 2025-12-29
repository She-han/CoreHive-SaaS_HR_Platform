package com.corehive.backend.controller;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Employee;
import com.corehive.backend.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('HR_STAFF', 'ORG_ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * Get all employees for organization
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> getAllEmployees(HttpServletRequest request) {
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        ApiResponse<List<Employee>> response = employeeService.getAllEmployees(organizationUuid);
        return ResponseEntity.ok(response);
    }

    /**
     * Get employee by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> getEmployeeById(
            HttpServletRequest request,
            @PathVariable Long id) {

        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        ApiResponse<Employee> response = employeeService.getEmployeeById(organizationUuid, id);
        return ResponseEntity.ok(response);
    }

    /**
     * Create new employee
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> createEmployee(
            HttpServletRequest request,
            @Valid @RequestBody EmployeeRequestDTO employeeRequest) {

        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Creating employee for organization: {}", organizationUuid);
        ApiResponse<Employee> response = employeeService.createEmployee(organizationUuid, employeeRequest);

        return ResponseEntity.ok(response);
    }

    /**
     * Update employee
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> updateEmployee(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequestDTO employeeRequest) {

        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Updating employee {} for organization: {}", id, organizationUuid);
        ApiResponse<Employee> response = employeeService.updateEmployee(organizationUuid, id, employeeRequest);

        return ResponseEntity.ok(response);
    }

    /**
     * Delete employee
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEmployee(
            HttpServletRequest request,
            @PathVariable Long id) {

        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (organizationUuid == null || organizationUuid.isEmpty()) {
            log.warn("Organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Organization not found in request"));
        }

        log.info("Deleting employee {} for organization: {}", id, organizationUuid);
        ApiResponse<String> response = employeeService.deleteEmployee(organizationUuid, id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<Employee>> getCurrentEmployeeProfile(HttpServletRequest request) {
        String userEmail = (String) request.getAttribute("userEmail");
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (userEmail == null || organizationUuid == null) {
            log.warn("User email or organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication information not found"));
        }

        log.info("Fetching profile for employee: {}", userEmail);
        ApiResponse<Employee> response = employeeService.getEmployeeByEmail(organizationUuid, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Update current logged-in employee's profile
     */
    @PutMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<Employee>> updateCurrentEmployeeProfile(
            HttpServletRequest request,
            @Valid @RequestBody EmployeeRequestDTO employeeRequest) {

        String userEmail = (String) request.getAttribute("userEmail");
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (userEmail == null || organizationUuid == null) {
            log.warn("User email or organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication information not found"));
        }

        log.info("Updating profile for employee: {}", userEmail);
        ApiResponse<Employee> response = employeeService.updateEmployeeByEmail(organizationUuid, userEmail, employeeRequest);
        return ResponseEntity.ok(response);
    }
}