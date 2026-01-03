package com.corehive.backend.controller;

import com.corehive.backend.model.Employee;
import com.corehive.backend.service.HrReportPdfService;
import com.corehive.backend.service.HrReportService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reports")
public class HrReportController {
    @Autowired
    private HrReportService hrReportService;

    @Autowired
    private HrReportPdfService pdfService;


    //Get head-count report department , designation and overall wisely
    @GetMapping("/headcount")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getHeadcountReport(
            HttpServletRequest httpRequest)
    {
        String orgUuid = (String) httpRequest.getAttribute("organizationUuid");
        Map<String, Object> report =
                hrReportService.getHeadcountReport(orgUuid);
        return new ResponseEntity<>(
                new StandardResponse(200, "Employee status updated successfully", report),
                HttpStatus.OK
        );
    }

    //Get monthly employee attendance report
    @GetMapping("/monthly/employee-growth")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<?> getEmployeeGrowthMonthly(
            HttpServletRequest httpRequest ,
            @RequestParam int month,
            @RequestParam int year) {
        String orgUuid = (String) httpRequest.getAttribute("organizationUuid");

        Map<String, Object> growthMap = hrReportService.getMonthlyEmployeeReports(orgUuid ,month , year);

        return new ResponseEntity<>(
                new StandardResponse(200, "Get monthly growth successfully", growthMap),
                HttpStatus.OK
        );
    }

    //Get annually employee growth
    @GetMapping("/annual/employee-growth")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<?> getEmployeeGrowthAnnually(
            HttpServletRequest httpRequest ,
            @RequestParam int year) {
        String orgUuid = (String) httpRequest.getAttribute("organizationUuid");

        Map<Integer, Long> growthMap = hrReportService.getYearlyEmployeeGrowth(orgUuid , year);

        return new ResponseEntity<>(
                new StandardResponse(200, "Get Annually growth successfully", growthMap),
                HttpStatus.OK
        );
    }

    //Head-count report
    @GetMapping("/headcount/download")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public void downloadHeadcountReport(
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        Map<String, Object> report =
                hrReportService.getHeadcountReport(orgUuid);

        byte[] pdf = pdfService.generateHeadcountPdf(report);

        response.setContentType("application/pdf");
        response.setHeader(
                "Content-Disposition",
                "attachment; filename=headcount-report.pdf"
        );
        response.getOutputStream().write(pdf);
    }


    //Monthly Report
    @GetMapping("/monthly/download")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public void downloadMonthlyReport(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam int month,
            @RequestParam int year) throws IOException {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        Map<String, Object> report =
                hrReportService.getMonthlyEmployeeReports(orgUuid, month, year);

        byte[] pdf = pdfService.generateMonthlyPdf(report);

        response.setContentType("application/pdf");
        response.setHeader(
                "Content-Disposition",
                "attachment; filename=monthly-report.pdf"
        );
        response.getOutputStream().write(pdf);
    }


    //Annual Report
    @GetMapping("/annual/download")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public void downloadAnnualReport(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam int year) throws IOException {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        Map<Integer, Long> report =
                hrReportService.getYearlyEmployeeGrowth(orgUuid, year);

        byte[] pdf = pdfService.generateAnnualPdf(report);

        response.setContentType("application/pdf");
        response.setHeader(
                "Content-Disposition",
                "attachment; filename=annual-report.pdf"
        );
        response.getOutputStream().write(pdf);
    }

}
