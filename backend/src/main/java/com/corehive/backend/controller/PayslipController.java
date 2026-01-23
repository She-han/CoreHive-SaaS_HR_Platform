package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Payslip;
import com.corehive.backend.service.PayslipService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/hr-staff/payslips")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class PayslipController {
    
    private final PayslipService payslipService;
    
    // ==================== GENERATE PAYSLIPS ====================
    
    @PostMapping("/generate/all")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<Payslip>>> generatePayslipsForAll(
            HttpServletRequest request,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Long userId = Long.valueOf(request.getAttribute("userId").toString());
            
            List<Payslip> payslips = payslipService.generatePayslipsForAll(orgUuid, month, year, userId);
            return ResponseEntity.ok(ApiResponse.success(payslips, "Payslips generated successfully for all employees"));
        } catch (Exception e) {
            log.error("Error generating payslips", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate payslips: " + e.getMessage()));
        }
    }
    
    @PostMapping("/generate/department/{departmentId}")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<Payslip>>> generatePayslipsByDepartment(
            HttpServletRequest request,
            @PathVariable Long departmentId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Long userId = Long.valueOf(request.getAttribute("userId").toString());
            
            List<Payslip> payslips = payslipService.generatePayslipsByDepartment(orgUuid, departmentId, month, year, userId);
            return ResponseEntity.ok(ApiResponse.success(payslips, "Payslips generated successfully for department"));
        } catch (Exception e) {
            log.error("Error generating payslips by department", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate payslips: " + e.getMessage()));
        }
    }
    
    @PostMapping("/generate/designation")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<Payslip>>> generatePayslipsByDesignation(
            HttpServletRequest request,
            @RequestParam String designation,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Long userId = Long.valueOf(request.getAttribute("userId").toString());
            
            List<Payslip> payslips = payslipService.generatePayslipsByDesignation(orgUuid, designation, month, year, userId);
            return ResponseEntity.ok(ApiResponse.success(payslips, "Payslips generated successfully for designation"));
        } catch (Exception e) {
            log.error("Error generating payslips by designation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate payslips: " + e.getMessage()));
        }
    }
    
    @PostMapping("/generate/employee/{employeeId}")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Payslip>> generatePayslipForEmployee(
            HttpServletRequest request,
            @PathVariable Long employeeId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Long userId = Long.valueOf(request.getAttribute("userId").toString());
            
            Payslip payslip = payslipService.generatePayslipForEmployee(orgUuid, employeeId, month, year, userId);
            return ResponseEntity.ok(ApiResponse.success(payslip, "Payslip generated successfully"));
        } catch (Exception e) {
            log.error("Error generating payslip for employee", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to generate payslip: " + e.getMessage()));
        }
    }
    
    // ==================== GET PAYSLIPS ====================
    
    @GetMapping
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<Payslip>>> getPayslips(
            HttpServletRequest request,
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) String designation) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            List<Payslip> payslips;
            
            if (departmentName != null) {
                payslips = payslipService.getPayslipsByDepartment(orgUuid, departmentName, month, year);
            } else if (designation != null) {
                payslips = payslipService.getPayslipsByDesignation(orgUuid, designation, month, year);
            } else {
                payslips = payslipService.getPayslipsForMonth(orgUuid, month, year);
            }
            
            return ResponseEntity.ok(ApiResponse.success(payslips, "Payslips retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching payslips", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch payslips: " + e.getMessage()));
        }
    }
    
    // ==================== EXPORT TO EXCEL/CSV ====================
    
    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<byte[]> exportToExcel(
            HttpServletRequest request,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            List<Payslip> payslips = payslipService.getPayslipsForMonth(orgUuid, month, year);
            
            byte[] excelData = generateExcelFile(payslips, month, year);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                String.format("payslips_%d_%d.xlsx", month, year));
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error exporting payslips to Excel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/export/bank-transfer")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<byte[]> exportBankTransferFile(
            HttpServletRequest request,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            List<Payslip> payslips = payslipService.getPayslipsForMonth(orgUuid, month, year);
            
            byte[] excelData = generateBankTransferExcel(payslips, month, year);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", 
                String.format("bank_transfer_%d_%d.xlsx", month, year));
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error exporting bank transfer file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    private byte[] generateExcelFile(List<Payslip> payslips, Integer month, Integer year) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payslips");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Employee Code", "Employee Name", "Designation", "Department", 
                "Basic Salary", "Allowances", "Gross Salary", "EPF Employee", "Tax", 
                "Other Deductions", "Total Deductions", "Net Salary"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 1;
            for (Payslip payslip : payslips) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(payslip.getEmployeeCode());
                row.createCell(1).setCellValue(payslip.getEmployeeName());
                row.createCell(2).setCellValue(payslip.getDesignation());
                row.createCell(3).setCellValue(payslip.getDepartmentName());
                row.createCell(4).setCellValue(payslip.getBasicSalary().doubleValue());
                row.createCell(5).setCellValue(payslip.getTotalAllowances().doubleValue());
                row.createCell(6).setCellValue(payslip.getGrossSalary().doubleValue());
                row.createCell(7).setCellValue(payslip.getEpfEmployee().doubleValue());
                row.createCell(8).setCellValue(payslip.getTax().doubleValue());
                row.createCell(9).setCellValue(payslip.getOtherDeductions().doubleValue());
                row.createCell(10).setCellValue(payslip.getTotalDeductions().doubleValue());
                row.createCell(11).setCellValue(payslip.getNetSalary().doubleValue());
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private byte[] generateBankTransferExcel(List<Payslip> payslips, Integer month, Integer year) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bank Transfer");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Employee Code", "Employee Name", "Bank Account Number", "Net Salary", "Month", "Year"};
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data rows
            int rowNum = 1;
            BigDecimal totalAmount = BigDecimal.ZERO;
            
            for (Payslip payslip : payslips) {
                if (payslip.getBankAccNo() == null || payslip.getBankAccNo().isEmpty()) {
                    continue; // Skip employees without bank account
                }
                
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(payslip.getEmployeeCode());
                row.createCell(1).setCellValue(payslip.getEmployeeName());
                row.createCell(2).setCellValue(payslip.getBankAccNo());
                row.createCell(3).setCellValue(payslip.getNetSalary().doubleValue());
                row.createCell(4).setCellValue(month);
                row.createCell(5).setCellValue(year);
                
                totalAmount = totalAmount.add(payslip.getNetSalary());
            }
            
            // Add total row
            Row totalRow = sheet.createRow(rowNum);
            Cell totalLabelCell = totalRow.createCell(2);
            totalLabelCell.setCellValue("TOTAL");
            
            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);
            totalLabelCell.setCellStyle(boldStyle);
            
            Cell totalAmountCell = totalRow.createCell(3);
            totalAmountCell.setCellValue(totalAmount.doubleValue());
            totalAmountCell.setCellStyle(boldStyle);
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
