package com.corehive.backend.controller;

import com.corehive.backend.dto.attendance.AttendanceHistoryResponse;
import com.corehive.backend.dto.attendance.FaceAttendanceRequest;
import com.corehive.backend.dto.attendance.FaceAttendanceResponse;
import com.corehive.backend.model.AppUser;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.AppUserRepository;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    /**
     * Mark attendance using face recognition - KIOSK MODE
     * HR Staff can mark attendance for any employee
     */
    @PostMapping("/mark-face")
    public ResponseEntity<FaceAttendanceResponse> markFaceAttendance(
            @RequestBody FaceAttendanceRequest request,
            HttpServletRequest httpRequest
    ) {
        // Get user email from request attribute (set by JwtRequestFilter)
        String userEmail = (String) httpRequest.getAttribute("userEmail");

        if (userEmail == null) {
            log.error("User email not found in request attributes - authentication failed");
            return ResponseEntity.status(401).body(
                    FaceAttendanceResponse.builder()
                            .success(false)
                            .message("Authentication required. Please login again.")
                            .build()
            );
        }

        log.info("Face attendance request from: {}", userEmail);

        try {
            // Get logged-in user
            AppUser appUser = appUserRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Long employeeId;
            String organizationUuid;

            // Check if request contains employeeId (Kiosk mode - HR marking for employee)
            if (request.getEmployeeId() != null) {
                // KIOSK MODE: HR Staff marking attendance for identified employee
                log.info("Kiosk mode: Marking attendance for employee {}", request.getEmployeeId());

                employeeId = request.getEmployeeId();
                organizationUuid = request.getOrganizationUuid() != null
                        ? request.getOrganizationUuid()
                        : appUser.getOrganizationUuid();

                // Verify employee exists and belongs to same organization
                Employee employee = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new RuntimeException("Employee not found"));

                if (!employee.getOrganizationUuid().equals(organizationUuid)) {
                    throw new RuntimeException("Employee does not belong to this organization");
                }

            } else {
                // SELF MODE: User marking their own attendance
                if (appUser.getLinkedEmployeeId() == null) {
                    return ResponseEntity.badRequest().body(
                            FaceAttendanceResponse.builder()
                                    .success(false)
                                    .message("Your account is not linked to an employee profile")
                                    .build()
                    );
                }

                employeeId = appUser.getLinkedEmployeeId();
                organizationUuid = appUser.getOrganizationUuid();
            }

            // Set IP address
            request.setIpAddress(getClientIpAddress(httpRequest));

            // Mark attendance
            FaceAttendanceResponse response = attendanceService.markFaceAttendance(
                    employeeId,
                    organizationUuid,
                    request
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error marking face attendance: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    FaceAttendanceResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Get today's attendance for a specific employee (for kiosk display)
     */
    @GetMapping("/today/{employeeId}")
    public ResponseEntity<?> getTodayAttendanceForEmployee(
            @PathVariable Long employeeId,
            HttpServletRequest httpRequest
    ) {
        try {
            Optional<Attendance> attendance = attendanceRepository
                    .findByEmployeeIdAndAttendanceDate(employeeId, LocalDate.now());

            if (attendance.isPresent()) {
                Attendance att = attendance.get();
                return ResponseEntity.ok(FaceAttendanceResponse.builder()
                        .success(true)
                        .checkInTime(att.getCheckInTime())
                        .checkOutTime(att.getCheckOutTime())
                        .status(att.getStatus() != null ? att.getStatus().name() : null)
                        .isCheckIn(att.getCheckOutTime() == null)
                        .build());
            }

            return ResponseEntity.ok(FaceAttendanceResponse.builder()
                    .success(true)
                    .message("No attendance record for today")
                    .build());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    FaceAttendanceResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Get today's attendance for current user
     */
    @GetMapping("/today")
    public ResponseEntity<FaceAttendanceResponse> getTodayAttendance(
            HttpServletRequest httpRequest
    ) {
        try {
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            if (userEmail == null) {
                return ResponseEntity.status(401).body(FaceAttendanceResponse.builder()
                        .success(false)
                        .message("Authentication required")
                        .build());
            }

            AppUser appUser = appUserRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (appUser.getLinkedEmployeeId() == null) {
                return ResponseEntity.ok(FaceAttendanceResponse.builder()
                        .success(false)
                        .message("No linked employee profile")
                        .build());
            }

            Optional<Attendance> attendance = attendanceRepository
                    .findByEmployeeIdAndAttendanceDate(appUser.getLinkedEmployeeId(), LocalDate.now());

            if (attendance.isPresent()) {
                Attendance att = attendance.get();
                return ResponseEntity.ok(FaceAttendanceResponse.builder()
                        .success(true)
                        .checkInTime(att.getCheckInTime())
                        .checkOutTime(att.getCheckOutTime())
                        .status(att.getStatus() != null ? att.getStatus().name() : null)
                        .isCheckIn(att.getCheckOutTime() == null)
                        .build());
            }

            return ResponseEntity.ok(FaceAttendanceResponse.builder()
                    .success(true)
                    .message("No attendance record for today")
                    .build());

        } catch (Exception e) {
            log.error("Error getting today's attendance: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    FaceAttendanceResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Get all today's attendance for organization (for kiosk stats)
     */
    @GetMapping("/today-all")
    public ResponseEntity<?> getTodayAllAttendance(
            HttpServletRequest httpRequest
    ) {
        try {
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            if (userEmail == null) {
                return ResponseEntity.status(401).body(
                        FaceAttendanceResponse.builder()
                                .success(false)
                                .message("Authentication required")
                                .build()
                );
            }

            AppUser appUser = appUserRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Attendance> attendanceList = attendanceRepository
                    .findByOrganizationUuidAndAttendanceDate(
                            appUser.getOrganizationUuid(),
                            LocalDate.now()
                    );

            return ResponseEntity.ok(attendanceList);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    FaceAttendanceResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Get attendance history
     */
    @GetMapping("/history")
    public ResponseEntity<List<AttendanceHistoryResponse>> getAttendanceHistory(
            HttpServletRequest httpRequest,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            if (userEmail == null) {
                return ResponseEntity.ok(List.of());
            }

            AppUser appUser = appUserRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (appUser.getLinkedEmployeeId() == null) {
                return ResponseEntity.ok(List.of());
            }

            // Default to last 30 days
            if (startDate == null) startDate = LocalDate.now().minusDays(30);
            if (endDate == null) endDate = LocalDate.now();

            List<Attendance> history = attendanceRepository
                    .findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                            appUser.getLinkedEmployeeId(), startDate, endDate
                    );

            List<AttendanceHistoryResponse> response = history.stream()
                    .map(att -> AttendanceHistoryResponse.builder()
                            .date(att.getAttendanceDate())
                            .checkInTime(att.getCheckInTime())
                            .checkOutTime(att.getCheckOutTime())
                            .status(att.getStatus() != null ? att.getStatus().name() : null)
                            .build())
                    .toList();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting attendance history: {}", e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}