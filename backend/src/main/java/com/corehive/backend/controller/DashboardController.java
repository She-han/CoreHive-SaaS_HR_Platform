package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Dashboard Controller
 * Role-based dashboard data provide කරනවා
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    /**
     * Get Dashboard Data
     * GET /api/dashboard
     *
     * User role අනුව dashboard data return කරනවා
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardData(HttpServletRequest request) {

        String userEmail = (String) request.getAttribute("userEmail");
        String userRole = (String) request.getAttribute("userRole");
        String userType = (String) request.getAttribute("userType");
        String organizationUuid = (String) request.getAttribute("organizationUuid");

        log.info("Dashboard data request from: {} (Role: {}, Type: {})", userEmail, userRole, userType);

        try {
            Map<String, Object> dashboardData = new HashMap<>();

            // User type අනුව dashboard data prepare කරන්න
            if ("SYSTEM_ADMIN".equals(userType)) {
                dashboardData = prepareSysAdminDashboard();
            } else if ("ORG_USER".equals(userType)) {
                dashboardData = prepareOrgUserDashboard(userRole, organizationUuid);
            }

            // Common user info add කරන්න
            dashboardData.put("userInfo", Map.of(
                    "email", userEmail,
                    "role", userRole,
                    "userType", userType
            ));

            ApiResponse<Map<String, Object>> response =
                    ApiResponse.success("Dashboard data retrieved successfully", dashboardData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving dashboard data for user: {}", userEmail, e);
            ApiResponse<Map<String, Object>> errorResponse =
                    ApiResponse.error("Failed to retrieve dashboard data");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * System Admin Dashboard Data
     */
    private Map<String, Object> prepareSysAdminDashboard() {
        Map<String, Object> data = new HashMap<>();

        // TODO: Implement real statistics from database
        data.put("totalOrganizations", 25);
        data.put("pendingApprovals", 3);
        data.put("activeOrganizations", 20);
        data.put("dormantOrganizations", 2);
        data.put("totalEmployees", 450);
        data.put("recentRegistrations", 5);

        // Quick actions for sys admin
        data.put("quickActions", Map.of(
                "viewPendingApprovals", "/admin/pending-approvals",
                "viewAllOrganizations", "/admin/organizations",
                "viewPlatformReports", "/admin/reports",
                "systemSettings", "/admin/settings"
        ));

        data.put("dashboardType", "SYSTEM_ADMIN");
        log.debug("System admin dashboard data prepared");

        return data;
    }

    /**
     * Organization User Dashboard Data
     */
    private Map<String, Object> prepareOrgUserDashboard(String role, String organizationUuid) {
        Map<String, Object> data = new HashMap<>();

        // Role අනුව different data return කරන්න
        switch (role) {
            case "ORG_ADMIN":
                data.putAll(prepareOrgAdminDashboard(organizationUuid));
                break;
            case "HR_STAFF":
                data.putAll(prepareHrStaffDashboard(organizationUuid));
                break;
            case "EMPLOYEE":
                data.putAll(prepareEmployeeDashboard(organizationUuid));
                break;
            default:
                throw new IllegalArgumentException("Unknown role: " + role);
        }

        data.put("dashboardType", role);
        data.put("organizationUuid", organizationUuid);

        return data;
    }

    /**
     * Organization Admin Dashboard
     */
    private Map<String, Object> prepareOrgAdminDashboard(String orgUuid) {
        Map<String, Object> data = new HashMap<>();

        // TODO: Implement real statistics from database
        data.put("totalEmployees", 45);
        data.put("activeEmployees", 42);
        data.put("pendingLeaveRequests", 8);
        data.put("monthlyPayrollTotal", 2500000.00);
        data.put("departmentCount", 5);
        data.put("newHiresThisMonth", 3);

        // Quick actions for org admin
        data.put("quickActions", Map.of(
                "addEmployee", "/employees/add",
                "processPayroll", "/payroll/process",
                "manageUsers", "/settings/users",
                "viewReports", "/reports",
                "organizationSettings", "/settings/organization"
        ));

        log.debug("Org admin dashboard data prepared for org: {}", orgUuid);
        return data;
    }

    /**
     * HR Staff Dashboard
     */
    private Map<String, Object> prepareHrStaffDashboard(String orgUuid) {
        Map<String, Object> data = new HashMap<>();

        // TODO: Implement real statistics
        data.put("totalEmployees", 45);
        data.put("pendingLeaveRequests", 8);
        data.put("attendanceToday", 38);
        data.put("absentToday", 4);
        data.put("lateArrivals", 2);
        data.put("birthdays", 1);

        // Quick actions for HR staff
        data.put("quickActions", Map.of(
                "reviewLeaveRequests", "/leaves/pending",
                "markAttendance", "/attendance/mark",
                "addEmployee", "/employees/add",
                "generateReports", "/reports"
        ));

        log.debug("HR staff dashboard data prepared for org: {}", orgUuid);
        return data;
    }

    /**
     * Employee Dashboard
     */
    private Map<String, Object> prepareEmployeeDashboard(String orgUuid) {
        Map<String, Object> data = new HashMap<>();

        // TODO: Implement real personal data
        data.put("leaveBalance", Map.of(
                "annual", 15,
                "sick", 5,
                "casual", 3
        ));
        data.put("attendanceThisMonth", Map.of(
                "present", 18,
                "absent", 1,
                "late", 2
        ));
        data.put("pendingLeaveRequests", 1);
        data.put("upcomingHolidays", 2);
        data.put("checkedInToday", false);

        // Quick actions for employee
        data.put("quickActions", Map.of(
                "applyLeave", "/leaves/apply",
                "viewPayslips", "/payroll/payslips",
                "markAttendance", "/attendance/mark",
                "updateProfile", "/profile"
        ));

        log.debug("Employee dashboard data prepared for org: {}", orgUuid);
        return data;
    }
}