package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.Payslip;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.service.PayslipService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://corehive-frontend-app-cmbucjbga2e6amey.southeastasia-01.azurewebsites.net"})
@RestController
@RequestMapping("/api/employee/payslips")
@RequiredArgsConstructor
@Slf4j
public class EmployeePayslipController {
    
    private final PayslipService payslipService;
    private final EmployeeRepository employeeRepository;
    
    /**
     * Get approved payslips for the logged-in employee
     */
    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<Payslip>>> getEmployeePayslips(HttpServletRequest request) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            // Get employee by email
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, orgUuid)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            List<Payslip> payslips = payslipService.getApprovedPayslipsForEmployee(orgUuid, employee.getId());
            return ResponseEntity.ok(ApiResponse.success(payslips, "Payslips retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching employee payslips", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch payslips: " + e.getMessage()));
        }
    }
    
    /**
     * Get specific payslip for the logged-in employee
     */
    @GetMapping("/{payslipId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<Payslip>> getEmployeePayslip(
            HttpServletRequest request,
            @PathVariable Long payslipId) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            // Get employee by email
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, orgUuid)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            // Get the payslip and verify it belongs to this employee
            Payslip payslip = payslipService.getApprovedPayslipsForEmployee(orgUuid, employee.getId())
                .stream()
                .filter(p -> p.getId().equals(payslipId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payslip not found or access denied"));
            
            return ResponseEntity.ok(ApiResponse.success(payslip, "Payslip retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching employee payslip", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch payslip: " + e.getMessage()));
        }
    }
}
