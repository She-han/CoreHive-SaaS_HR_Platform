package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Allowance;
import com.corehive.backend.model.Deduction;
import com.corehive.backend.model.PayrollConfiguration;
import com.corehive.backend.service.PayrollConfigurationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org-admin/payroll-config")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class PayrollConfigurationController {
    
    private final PayrollConfigurationService payrollConfigService;
    
    // ==================== PAYROLL CONFIGURATION ====================
    
    @GetMapping("/configuration")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<PayrollConfiguration>> getConfiguration(HttpServletRequest request) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            PayrollConfiguration config = payrollConfigService.getOrCreateConfiguration(orgUuid);
            return ResponseEntity.ok(ApiResponse.success(config, "Configuration retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching payroll configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch configuration: " + e.getMessage()));
        }
    }
    
    @PutMapping("/configuration")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<PayrollConfiguration>> updateConfiguration(
            HttpServletRequest request,
            @RequestBody PayrollConfiguration configData) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            PayrollConfiguration config = payrollConfigService.updateConfiguration(orgUuid, configData);
            return ResponseEntity.ok(ApiResponse.success(config, "Configuration updated successfully"));
        } catch (Exception e) {
            log.error("Error updating payroll configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to update configuration: " + e.getMessage()));
        }
    }
    
    // ==================== ALLOWANCES ====================
    
    @GetMapping("/allowances")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<Allowance>>> getAllAllowances(HttpServletRequest request) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            List<Allowance> allowances = payrollConfigService.getAllAllowances(orgUuid);
            return ResponseEntity.ok(ApiResponse.success(allowances, "Allowances retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching allowances", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch allowances: " + e.getMessage()));
        }
    }
    
    @PostMapping("/allowances")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Allowance>> createAllowance(
            HttpServletRequest request,
            @RequestBody Allowance allowance) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Allowance created = payrollConfigService.createAllowance(orgUuid, allowance);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Allowance created successfully"));
        } catch (Exception e) {
            log.error("Error creating allowance", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create allowance: " + e.getMessage()));
        }
    }
    
    @PutMapping("/allowances/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Allowance>> updateAllowance(
            @PathVariable Long id,
            @RequestBody Allowance allowance) {
        try {
            Allowance updated = payrollConfigService.updateAllowance(id, allowance);
            return ResponseEntity.ok(ApiResponse.success(updated, "Allowance updated successfully"));
        } catch (Exception e) {
            log.error("Error updating allowance", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to update allowance: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/allowances/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllowance(@PathVariable Long id) {
        try {
            payrollConfigService.deleteAllowance(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Allowance deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting allowance", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to delete allowance: " + e.getMessage()));
        }
    }
    
    // ==================== DEDUCTIONS ====================
    
    @GetMapping("/deductions")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<Deduction>>> getAllDeductions(HttpServletRequest request) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            List<Deduction> deductions = payrollConfigService.getAllDeductions(orgUuid);
            return ResponseEntity.ok(ApiResponse.success(deductions, "Deductions retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching deductions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch deductions: " + e.getMessage()));
        }
    }
    
    @PostMapping("/deductions")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Deduction>> createDeduction(
            HttpServletRequest request,
            @RequestBody Deduction deduction) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Deduction created = payrollConfigService.createDeduction(orgUuid, deduction);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Deduction created successfully"));
        } catch (Exception e) {
            log.error("Error creating deduction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create deduction: " + e.getMessage()));
        }
    }
    
    @PutMapping("/deductions/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Deduction>> updateDeduction(
            @PathVariable Long id,
            @RequestBody Deduction deduction) {
        try {
            Deduction updated = payrollConfigService.updateDeduction(id, deduction);
            return ResponseEntity.ok(ApiResponse.success(updated, "Deduction updated successfully"));
        } catch (Exception e) {
            log.error("Error updating deduction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to update deduction: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/deductions/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDeduction(@PathVariable Long id) {
        try {
            payrollConfigService.deleteDeduction(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Deduction deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting deduction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to delete deduction: " + e.getMessage()));
        }
    }
}
