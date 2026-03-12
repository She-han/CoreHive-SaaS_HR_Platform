package com.corehive.backend.service;

import com.corehive.backend.model.*;
import com.corehive.backend.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayslipService {
    
    private final PayslipRepository payslipRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollConfigurationRepository payrollConfigRepository;
    private final AllowanceRepository allowanceRepository;
    private final DeductionRepository deductionRepository;
    private final DepartmentService departmentService;
    private final ObjectMapper objectMapper;
    
    /**
     * Generate payslips for all employees
     */
    @Transactional
    public List<Payslip> generatePayslipsForAll(String organizationUuid, Integer month, Integer year, Long generatedBy) {
        List<Employee> employees = employeeRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid);
        List<Payslip> payslips = new ArrayList<>();
        
        for (Employee employee : employees) {
            try {
                Payslip payslip = generatePayslipForEmployee(organizationUuid, employee.getId(), month, year, generatedBy);
                payslips.add(payslip);
            } catch (Exception e) {
                log.error("Failed to generate payslip for employee {}: {}", employee.getId(), e.getMessage());
            }
        }
        
        return payslips;
    }
    
    /**
     * Generate payslips by department
     */
    @Transactional
    public List<Payslip> generatePayslipsByDepartment(String organizationUuid, Long departmentId, Integer month, Integer year, Long generatedBy) {
        List<Employee> employees = employeeRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid)
            .stream()
            .filter(e -> e.getDepartmentId() != null && e.getDepartmentId().equals(departmentId))
            .collect(Collectors.toList());
        
        List<Payslip> payslips = new ArrayList<>();
        for (Employee employee : employees) {
            try {
                Payslip payslip = generatePayslipForEmployee(organizationUuid, employee.getId(), month, year, generatedBy);
                payslips.add(payslip);
            } catch (Exception e) {
                log.error("Failed to generate payslip for employee {}: {}", employee.getId(), e.getMessage());
            }
        }
        
        return payslips;
    }
    
    /**
     * Generate payslips by designation
     */
    @Transactional
    public List<Payslip> generatePayslipsByDesignation(String organizationUuid, String designation, Integer month, Integer year, Long generatedBy) {
        List<Employee> employees = employeeRepository.findByOrganizationUuidAndIsActiveTrue(organizationUuid)
            .stream()
            .filter(e -> e.getDesignation() != null && e.getDesignation().equalsIgnoreCase(designation))
            .collect(Collectors.toList());
        
        List<Payslip> payslips = new ArrayList<>();
        for (Employee employee : employees) {
            try {
                Payslip payslip = generatePayslipForEmployee(organizationUuid, employee.getId(), month, year, generatedBy);
                payslips.add(payslip);
            } catch (Exception e) {
                log.error("Failed to generate payslip for employee {}: {}", employee.getId(), e.getMessage());
            }
        }
        
        return payslips;
    }
    
    /**
     * Generate payslip for a single employee
     */
    @Transactional
    public Payslip generatePayslipForEmployee(String organizationUuid, Long employeeId, Integer month, Integer year, Long generatedBy) {
        // Check if payslip already exists
        Optional<Payslip> existing = payslipRepository.findByOrganizationUuidAndEmployeeIdAndMonthAndYear(
            organizationUuid, employeeId, month, year
        );
        
        if (existing.isPresent()) {
            log.info("Payslip already exists for employee {} for {}/{}", employeeId, month, year);
            return existing.get();
        }
        
        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        PayrollConfiguration config = payrollConfigRepository.findByOrganizationUuid(organizationUuid)
            .orElseGet(() -> createDefaultConfig(organizationUuid));
        
        Payslip payslip = new Payslip();
        payslip.setOrganizationUuid(organizationUuid);
        payslip.setEmployeeId(employeeId);
        payslip.setEmployeeCode(employee.getEmployeeCode());
        payslip.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
        payslip.setDesignation(employee.getDesignation());
        payslip.setDepartmentName(departmentService.getDepartmentNameById(employee.getDepartmentId()));
        payslip.setBankAccNo(employee.getBankAccNo());
        payslip.setMonth(month);
        payslip.setYear(year);
        payslip.setBasicSalary(employee.getBasicSalary());
        
        // Calculate allowances
        List<Allowance> allowances = allowanceRepository.findApplicableAllowances(
            organizationUuid, 
            employee.getDepartmentId(), 
            employee.getDesignation(), 
            employeeId
        );
        
        BigDecimal totalAllowances = BigDecimal.ZERO;
        Map<String, BigDecimal> allowanceMap = new HashMap<>();
        
        for (Allowance allowance : allowances) {
            BigDecimal amount = allowance.getAmount();
            if (allowance.getIsPercentage()) {
                amount = employee.getBasicSalary()
                    .multiply(allowance.getAmount())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            totalAllowances = totalAllowances.add(amount);
            allowanceMap.put(allowance.getName(), amount);
        }
        
        payslip.setTotalAllowances(totalAllowances);
        try {
            payslip.setAllowanceDetails(objectMapper.writeValueAsString(allowanceMap));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize allowances", e);
        }
        
        // Calculate gross salary
        BigDecimal grossSalary = employee.getBasicSalary().add(totalAllowances);
        payslip.setGrossSalary(grossSalary);
        
        // Calculate statutory deductions
        BigDecimal epfEmployee = grossSalary
            .multiply(config.getEpfEmployeePercentage())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        BigDecimal epfEmployer = grossSalary
            .multiply(config.getEpfEmployerPercentage())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        BigDecimal etf = grossSalary
            .multiply(config.getEtfPercentage())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        BigDecimal tax = grossSalary
            .multiply(config.getTaxPercentage())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        payslip.setEpfEmployee(epfEmployee);
        payslip.setEpfEmployer(epfEmployer);
        payslip.setEtf(etf);
        payslip.setTax(tax);
        
        // Calculate other deductions
        List<Deduction> deductions = deductionRepository.findApplicableDeductions(
            organizationUuid,
            employee.getDepartmentId(),
            employee.getDesignation(),
            employeeId
        );
        
        BigDecimal otherDeductions = BigDecimal.ZERO;
        Map<String, BigDecimal> deductionMap = new HashMap<>();
        
        for (Deduction deduction : deductions) {
            BigDecimal amount = deduction.getAmount();
            if (deduction.getIsPercentage()) {
                amount = employee.getBasicSalary()
                    .multiply(deduction.getAmount())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            otherDeductions = otherDeductions.add(amount);
            deductionMap.put(deduction.getName(), amount);
        }
        
        payslip.setOtherDeductions(otherDeductions);
        try {
            payslip.setDeductionDetails(objectMapper.writeValueAsString(deductionMap));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize deductions", e);
        }
        
        // Calculate total deductions and net salary
        BigDecimal totalDeductions = epfEmployee.add(tax).add(otherDeductions);
        payslip.setTotalDeductions(totalDeductions);
        
        BigDecimal netSalary = grossSalary.subtract(totalDeductions);
        payslip.setNetSalary(netSalary);
        
        payslip.setStatus(Payslip.PayslipStatus.GENERATED);
        payslip.setGeneratedBy(generatedBy);
        payslip.setGeneratedAt(LocalDateTime.now());
        
        return payslipRepository.save(payslip);
    }
    
    private PayrollConfiguration createDefaultConfig(String organizationUuid) {
        PayrollConfiguration config = new PayrollConfiguration();
        config.setOrganizationUuid(organizationUuid);
        config.setIsActive(true);
        return payrollConfigRepository.save(config);
    }
    
    /**
     * Get all payslips for a month/year
     */
    public List<Payslip> getPayslipsForMonth(String organizationUuid, Integer month, Integer year) {
        return payslipRepository.findByOrganizationUuidAndMonthAndYear(organizationUuid, month, year);
    }
    
    /**
     * Get payslips by department
     */
    public List<Payslip> getPayslipsByDepartment(String organizationUuid, String departmentName, Integer month, Integer year) {
        return payslipRepository.findByOrganizationAndMonthYearAndDepartment(organizationUuid, month, year, departmentName);
    }
    
    /**
     * Get payslips by designation
     */
    public List<Payslip> getPayslipsByDesignation(String organizationUuid, String designation, Integer month, Integer year) {
        return payslipRepository.findByOrganizationAndMonthYearAndDesignation(organizationUuid, month, year, designation);
    }
    
    /**
     * Get payslip for specific employee
     */
    public Payslip getPayslipForEmployee(String organizationUuid, Long employeeId, Integer month, Integer year) {
        return payslipRepository.findByOrganizationUuidAndEmployeeIdAndMonthAndYear(
            organizationUuid, employeeId, month, year
        ).orElseThrow(() -> new RuntimeException("Payslip not found"));
    }
    
    /**
     * Approve a single payslip
     */
    @Transactional
    public Payslip approvePayslip(String organizationUuid, Long payslipId, Long approvedBy) {
        Payslip payslip = payslipRepository.findById(payslipId)
            .orElseThrow(() -> new RuntimeException("Payslip not found"));
        
        if (!payslip.getOrganizationUuid().equals(organizationUuid)) {
            throw new RuntimeException("Unauthorized access to payslip");
        }
        
        if (payslip.getStatus() == Payslip.PayslipStatus.APPROVED) {
            return payslip; // Already approved
        }
        
        payslip.setStatus(Payslip.PayslipStatus.APPROVED);
        payslip.setApprovedBy(approvedBy);
        payslip.setApprovedAt(LocalDateTime.now());
        
        return payslipRepository.save(payslip);
    }
    
    /**
     * Approve all payslips for a given period with optional filters
     */
    @Transactional
    public Map<String, Object> approveAllPayslips(String organizationUuid, Integer month, Integer year, 
                                                    String departmentName, String designation, 
                                                    String employeeCode, Long approvedBy) {
        List<Payslip> payslips;
        
        // Apply filters
        if (employeeCode != null && !employeeCode.isEmpty()) {
            payslips = payslipRepository.findByOrganizationUuidAndMonthAndYear(organizationUuid, month, year)
                .stream()
                .filter(p -> employeeCode.equals(p.getEmployeeCode()))
                .collect(Collectors.toList());
        } else if (departmentName != null && !departmentName.isEmpty()) {
            payslips = getPayslipsByDepartment(organizationUuid, departmentName, month, year);
        } else if (designation != null && !designation.isEmpty()) {
            payslips = getPayslipsByDesignation(organizationUuid, designation, month, year);
        } else {
            payslips = getPayslipsForMonth(organizationUuid, month, year);
        }
        
        // Filter only GENERATED payslips
        List<Payslip> generatedPayslips = payslips.stream()
            .filter(p -> p.getStatus() == Payslip.PayslipStatus.GENERATED)
            .collect(Collectors.toList());
        
        // Approve all
        int approvedCount = 0;
        for (Payslip payslip : generatedPayslips) {
            payslip.setStatus(Payslip.PayslipStatus.APPROVED);
            payslip.setApprovedBy(approvedBy);
            payslip.setApprovedAt(LocalDateTime.now());
            payslipRepository.save(payslip);
            approvedCount++;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("approvedCount", approvedCount);
        result.put("totalPayslips", payslips.size());
        
        return result;
    }
    
    /**
     * Get approved payslips for an employee (for employee portal)
     */
    public List<Payslip> getApprovedPayslipsForEmployee(String organizationUuid, Long employeeId) {
        return payslipRepository.findByOrganizationUuidAndEmployeeIdAndStatus(
            organizationUuid, employeeId, Payslip.PayslipStatus.APPROVED
        );
    }
}
