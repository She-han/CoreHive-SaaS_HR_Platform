package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard Controller
 * Provides role-based dashboard data
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;

    /**
     * Get Dashboard Data
     * GET /api/dashboard
     *
     * Return dashboard data based on user role
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

            // Prepare dashboard data based on user type
            if ("SYSTEM_ADMIN".equals(userType)) {
                dashboardData = prepareSysAdminDashboard();
            } else if ("ORG_USER".equals(userType)) {
                dashboardData = prepareOrgUserDashboard(userRole, organizationUuid);
            }

            // Add common user info
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

        // Return different data based on role.
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

        // Get real statistics from database
        List<Employee> allEmployees = employeeRepository.findByOrganizationUuid(orgUuid);
        long totalEmployees = allEmployees.size();
        long activeEmployees = allEmployees.stream().filter(e -> e.getIsActive() != null && e.getIsActive()).count();
        
        // Get pending leave requests
        List<LeaveRequest> allLeaves = leaveRepository.findAll();
        long pendingLeaveRequests = allLeaves.stream()
                .filter(lr -> lr.getOrganizationUuid().equals(orgUuid))
                .filter(lr -> lr.getStatus() == LeaveRequest.LeaveStatus.PENDING)
                .count();
        
        // Get today's attendance
        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceRepository
                .findByOrganizationUuidAndAttendanceDate(orgUuid, today);
        long attendanceToday = todayAttendance.stream()
                .filter(a -> a.getCheckInTime() != null)
                .count();
        long absentToday = totalEmployees - attendanceToday;
        
        data.put("totalEmployees", totalEmployees);
        data.put("activeEmployees", activeEmployees);
        data.put("pendingLeaveRequests", pendingLeaveRequests);
        data.put("attendanceToday", attendanceToday);
        data.put("absentToday", absentToday);
        data.put("monthlyPayrollTotal", 0); // TODO: Implement when payroll module is ready

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

        // Get real statistics
        List<Employee> allEmployees = employeeRepository.findByOrganizationUuid(orgUuid);
        long totalEmployees = allEmployees.size();
        
        // Get pending leave requests
        List<LeaveRequest> allLeaves = leaveRepository.findAll();
        long pendingLeaveRequests = allLeaves.stream()
                .filter(lr -> lr.getOrganizationUuid().equals(orgUuid))
                .filter(lr -> lr.getStatus() == LeaveRequest.LeaveStatus.PENDING)
                .count();
        
        // Get today's attendance
        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceRepository
                .findByOrganizationUuidAndAttendanceDate(orgUuid, today);
        long attendanceToday = todayAttendance.stream()
                .filter(a -> a.getCheckInTime() != null)
                .count();
        long absentToday = totalEmployees - attendanceToday;
        long lateArrivals = todayAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.LATE)
                .count();
        
        data.put("totalEmployees", totalEmployees);
        data.put("pendingLeaveRequests", pendingLeaveRequests);
        data.put("attendanceToday", attendanceToday);
        data.put("absentToday", absentToday);
        data.put("lateArrivals", lateArrivals);

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