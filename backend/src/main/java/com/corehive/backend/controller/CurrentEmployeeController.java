package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Employee;
import com.corehive.backend.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Separate controller for current logged-in employee operations
 * This eliminates any route conflicts with /api/employees/{id}
 */
// Allow frontend from multiple origins (local and deployed)
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://corehive-frontend-app-cmbucjbga2e6amey.southeastasia-01.azurewebsites.net"})
@RestController
@Slf4j
@RequestMapping("/api/current-employee")
@PreAuthorize("hasRole('EMPLOYEE')")
public class CurrentEmployeeController {

    private final EmployeeService employeeService;

    public CurrentEmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Get current logged-in employee's profile
     */
    @GetMapping("/profile")
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
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Employee>> updateCurrentEmployeeProfile(
            HttpServletRequest request,
            @RequestParam(value = "firstName") String firstName,
            @RequestParam(value = "lastName") String lastName,
            @RequestParam(required = false, value = "phone") String phone,
            @RequestParam(required = false, value = "profileImage") MultipartFile profileImage) {

        String userEmail = (String) request.getAttribute("userEmail");
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (userEmail == null || organizationUuid == null) {
            log.warn("User email or organization UUID not found in request");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication information not found"));
        }

        log.info("Updating profile for employee: {} - firstName: {}, lastName: {}, phone: {}, hasImage: {}", 
                 userEmail, firstName, lastName, phone, (profileImage != null && !profileImage.isEmpty()));
        
        ApiResponse<Employee> response = employeeService.updateEmployeeByEmail(
                organizationUuid, userEmail, firstName, lastName, phone, profileImage);
        return ResponseEntity.ok(response);
    }

    /**
     * Get leave balances for logged-in employee
     */
    @GetMapping("/leave-balances")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyLeaveBalances(
            HttpServletRequest request) {
        
        String userEmail = (String) request.getAttribute("userEmail");
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        if (userEmail == null || organizationUuid == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication information not found"));
        }

        ApiResponse<List<Map<String, Object>>> response = employeeService.getEmployeeLeaveBalances(organizationUuid, userEmail);
        return ResponseEntity.ok(response);
    }
}
