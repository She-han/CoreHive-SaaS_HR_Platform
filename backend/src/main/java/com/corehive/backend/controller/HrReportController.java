package com.corehive.backend.controller;

import com.corehive.backend.model.Employee;
import com.corehive.backend.service.HrReportService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reports")
public class HrReportController {
    @Autowired
    private HrReportService hrReportService;

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
}
