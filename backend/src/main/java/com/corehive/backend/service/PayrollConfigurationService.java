package com.corehive.backend.service;

import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollConfigurationService {
    
    private final PayrollConfigurationRepository payrollConfigRepository;
    private final AllowanceRepository allowanceRepository;
    private final DeductionRepository deductionRepository;
    private final EmployeeRepository employeeRepository;
    
    // Get or create payroll configuration
    @Transactional
    public PayrollConfiguration getOrCreateConfiguration(String organizationUuid) {
        return payrollConfigRepository.findByOrganizationUuid(organizationUuid)
            .orElseGet(() -> {
                PayrollConfiguration config = new PayrollConfiguration();
                config.setOrganizationUuid(organizationUuid);
                config.setIsActive(true);
                return payrollConfigRepository.save(config);
            });
    }
    
    // Update payroll configuration
    @Transactional
    public PayrollConfiguration updateConfiguration(String organizationUuid, PayrollConfiguration configData) {
        PayrollConfiguration config = getOrCreateConfiguration(organizationUuid);
        
        if (configData.getOtRatePerHour() != null) {
            config.setOtRatePerHour(configData.getOtRatePerHour());
        }
        if (configData.getOtMultiplier() != null) {
            config.setOtMultiplier(configData.getOtMultiplier());
        }
        if (configData.getEpfEmployerPercentage() != null) {
            config.setEpfEmployerPercentage(configData.getEpfEmployerPercentage());
        }
        if (configData.getEpfEmployeePercentage() != null) {
            config.setEpfEmployeePercentage(configData.getEpfEmployeePercentage());
        }
        if (configData.getEtfPercentage() != null) {
            config.setEtfPercentage(configData.getEtfPercentage());
        }
        if (configData.getTaxPercentage() != null) {
            config.setTaxPercentage(configData.getTaxPercentage());
        }
        
        return payrollConfigRepository.save(config);
    }
    
    // Allowance CRUD
    @Transactional
    public Allowance createAllowance(String organizationUuid, Allowance allowance) {
        allowance.setOrganizationUuid(organizationUuid);
        allowance.setIsActive(true);
        return allowanceRepository.save(allowance);
    }
    
    @Transactional
    public Allowance updateAllowance(Long id, Allowance allowanceData) {
        Allowance allowance = allowanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Allowance not found"));
        
        if (allowanceData.getName() != null) allowance.setName(allowanceData.getName());
        if (allowanceData.getAmount() != null) allowance.setAmount(allowanceData.getAmount());
        if (allowanceData.getAllowanceType() != null) allowance.setAllowanceType(allowanceData.getAllowanceType());
        if (allowanceData.getDepartmentId() != null) allowance.setDepartmentId(allowanceData.getDepartmentId());
        if (allowanceData.getDesignation() != null) allowance.setDesignation(allowanceData.getDesignation());
        if (allowanceData.getEmployeeId() != null) allowance.setEmployeeId(allowanceData.getEmployeeId());
        if (allowanceData.getIsPercentage() != null) allowance.setIsPercentage(allowanceData.getIsPercentage());
        
        return allowanceRepository.save(allowance);
    }
    
    @Transactional
    public void deleteAllowance(Long id) {
        allowanceRepository.deleteById(id);
    }
    
    public List<Allowance> getAllAllowances(String organizationUuid) {
        return allowanceRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
    }
    
    // Deduction CRUD
    @Transactional
    public Deduction createDeduction(String organizationUuid, Deduction deduction) {
        deduction.setOrganizationUuid(organizationUuid);
        deduction.setIsActive(true);
        return deductionRepository.save(deduction);
    }
    
    @Transactional
    public Deduction updateDeduction(Long id, Deduction deductionData) {
        Deduction deduction = deductionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Deduction not found"));
        
        if (deductionData.getName() != null) deduction.setName(deductionData.getName());
        if (deductionData.getAmount() != null) deduction.setAmount(deductionData.getAmount());
        if (deductionData.getDeductionType() != null) deduction.setDeductionType(deductionData.getDeductionType());
        if (deductionData.getDepartmentId() != null) deduction.setDepartmentId(deductionData.getDepartmentId());
        if (deductionData.getDesignation() != null) deduction.setDesignation(deductionData.getDesignation());
        if (deductionData.getEmployeeId() != null) deduction.setEmployeeId(deductionData.getEmployeeId());
        if (deductionData.getIsPercentage() != null) deduction.setIsPercentage(deductionData.getIsPercentage());
        
        return deductionRepository.save(deduction);
    }
    
    @Transactional
    public void deleteDeduction(Long id) {
        deductionRepository.deleteById(id);
    }
    
    public List<Deduction> getAllDeductions(String organizationUuid) {
        return deductionRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
    }
    
    // Get applicable allowances and deductions for an employee
    public List<Allowance> getApplicableAllowances(String orgUuid, Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        return allowanceRepository.findApplicableAllowances(
            orgUuid,
            employee.getDepartmentId(),
            employee.getDesignation(),
            employeeId
        );
    }
    
    public List<Deduction> getApplicableDeductions(String orgUuid, Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        return deductionRepository.findApplicableDeductions(
            orgUuid,
            employee.getDepartmentId(),
            employee.getDesignation(),
            employeeId
        );
    }
}
