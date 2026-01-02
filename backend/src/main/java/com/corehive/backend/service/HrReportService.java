package com.corehive.backend.service;

import com.corehive.backend.exception.hrReportsException.InvalidRequestException;
import com.corehive.backend.exception.hrReportsException.ReportGenerationException;
import com.corehive.backend.exception.hrReportsException.ResourceNotFoundException;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class HrReportService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    // Headcount report
    public Map<String, Object> getHeadcountReport(String orgUuid) {

        if (orgUuid == null || orgUuid.isBlank()) {
            throw new InvalidRequestException("Organization UUID is missing");
        }

        try {
            Map<String, Object> report = new HashMap<>();

            long total = employeeRepository
                    .countByOrganizationUuidAndIsActiveTrue(orgUuid);

            if (total == 0) {
                throw new ResourceNotFoundException(
                        "No employees found for this organization");
            }

            report.put("totalEmployees", total);
            report.put("byDepartment",
                    employeeRepository.countByDepartment(orgUuid));
            report.put("byDesignation",
                    employeeRepository.countByDesignation(orgUuid));

            return report;

        } catch (Exception ex) {
            throw new ReportGenerationException(
                    "Failed to generate headcount report", ex);
        }
    }

    // Monthly attendance & hiring report
    public Map<String, Object> getMonthlyEmployeeReports(
            String orgUuid, int month, int year) {

        if (month < 1 || month > 12) {
            throw new InvalidRequestException(
                    "Month must be between 1 and 12");
        }

        if (year < 2000) {
            throw new InvalidRequestException("Invalid year");
        }

        try {
            Map<String, Object> report = new HashMap<>();

            report.put("attendance",
                    attendanceRepository
                            .monthlyAttendanceStats(orgUuid, month, year));

            report.put("newHires",
                    employeeRepository
                            .countNewHires(orgUuid, month, year));

            return report;

        } catch (Exception ex) {
            throw new ReportGenerationException(
                    "Failed to generate monthly HR report", ex);
        }
    }

    // Annual employee growth
    public Map<Integer, Long> getYearlyEmployeeGrowth(
            String orgUuid, int year) {

        if (year < 2000) {
            throw new InvalidRequestException("Invalid year");
        }

        try {
            List<Object[]> rawData =
                    employeeRepository.yearlyEmployeeGrowth(orgUuid, year);

            Map<Integer, Long> growthMap = new LinkedHashMap<>();

            for (int i = 1; i <= 12; i++) {
                growthMap.put(i, 0L);
            }

            for (Object[] row : rawData) {
                Integer month = (Integer) row[0];
                Long count = (Long) row[1];
                growthMap.put(month, count);
            }

            return growthMap;

        } catch (Exception ex) {
            throw new ReportGenerationException(
                    "Failed to generate annual employee growth report", ex);
        }
    }
}
