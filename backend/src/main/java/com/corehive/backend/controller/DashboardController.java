package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.model.Payslip;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRepository;
import com.corehive.backend.repository.PayslipRepository;
import com.corehive.backend.repository.OrganizationRepository;
import com.corehive.backend.repository.OrganizationModuleRepository;
import com.corehive.backend.model.Organization;
import com.corehive.backend.model.OrganizationModule;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dashboard Controller
 * Provides role-based dashboard data
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://corehive-frontend-app-cmbucjbga2e6amey.southeastasia-01.azurewebsites.net"})
public class DashboardController {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final PayslipRepository payslipRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationModuleRepository organizationModuleRepository;

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
                    ApiResponse.success(dashboardData, "Dashboard data retrieved successfully");

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
        
        // --- NEW STATISTICS ---
        
        // 1. Calculate Monthly Payroll Total (Current Month) - APPROVED payslips only
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();
        
        List<Payslip> monthlyPayslips = payslipRepository.findByOrganizationUuid(orgUuid).stream()
                .filter(p -> p.getMonth() == currentMonth && p.getYear() == currentYear)
                .filter(p -> p.getStatus() == Payslip.PayslipStatus.APPROVED || 
                             p.getStatus() == Payslip.PayslipStatus.PAID)
                .collect(Collectors.toList());
                
        double monthlyPayrollTotal = monthlyPayslips.stream()
                .mapToDouble(p -> p.getNetSalary() != null ? p.getNetSalary().doubleValue() : 0.0)
                .sum();
        
        data.put("monthlyPayrollTotal", monthlyPayrollTotal);
        log.info("Monthly payroll total for org {}: {} (from {} approved payslips)", 
                orgUuid, monthlyPayrollTotal, monthlyPayslips.size());

        // 2. Department-wise User Count
        Map<String, Long> employeesByDepartment = allEmployees.stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getName() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getDepartment().getName(),
                        Collectors.counting()
                ));
        data.put("employeesByDepartment", employeesByDepartment);
        log.info("Department distribution for org {}: {}", orgUuid, employeesByDepartment);

        // 3. Designation-wise User Count (designation is a String field, not an object)
        Map<String, Long> employeesByDesignation = allEmployees.stream()
                .filter(e -> e.getDesignation() != null && !e.getDesignation().trim().isEmpty())
                .collect(Collectors.groupingBy(
                        Employee::getDesignation,
                        Collectors.counting()
                ));
        data.put("employeesByDesignation", employeesByDesignation);
        log.info("Designation distribution for org {}: {}", orgUuid, employeesByDesignation);

        // 4. Check available modules (Quick Action / Feature check support)
        // Similar logic to AuthService but simplified for dashboard flags
        Organization org = organizationRepository.findByOrganizationUuid(orgUuid).orElse(null);
        if (org != null) {
            Map<String, Boolean> features = new HashMap<>();
            features.put("faceAttendance", org.getModuleFaceRecognitionAttendanceMarking());
            features.put("qrAttendance", org.getModuleQrAttendanceMarking());
            features.put("feedback", org.getModuleEmployeeFeedback());
            features.put("hiring", org.getModuleHiringManagement());
            
            // Check AI Insights
             boolean hasAIInsights = false;
             try {
                 List<OrganizationModule> enabledModules = organizationModuleRepository
                         .findEnabledByOrganizationUuid(orgUuid);
                 hasAIInsights = enabledModules.stream()
                         .anyMatch(om -> om.getExtendedModule().getModuleId() == 5L && om.getIsEnabled());
             } catch (Exception e) { /* ignore */ }
             features.put("aiInsights", hasAIInsights);
             
             data.put("features", features);
        }

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