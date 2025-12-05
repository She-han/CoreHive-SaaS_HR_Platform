package com.corehive.backend.service;

import com.corehive.backend.dto.attendance.AttendanceHistoryResponse;
import com.corehive.backend.dto.attendance.FaceAttendanceRequest;
import com.corehive.backend.dto.attendance.FaceAttendanceResponse;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Attendance.AttendanceStatus;
import com.corehive.backend.model.Attendance.VerificationType;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // Office timing configuration (can be moved to organization settings later)
    private static final LocalTime OFFICE_START_TIME = LocalTime.of(9, 0);   // 9:00 AM
    private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 30);      // 9:30 AM
    private static final LocalTime HALF_DAY_THRESHOLD = LocalTime.of(13, 0);  // 1:00 PM

    /**
     * Mark attendance using face recognition
     * Called after Python AI Service verifies the face
     */
    @Transactional
    public FaceAttendanceResponse markFaceAttendance(Long employeeId, String organizationUuid, 
                                                      FaceAttendanceRequest request) {
        log.info("Marking face attendance for employee ID: {} in org: {}", employeeId, organizationUuid);

        // 1. Validate employee exists and belongs to organization
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        if (!employee.getOrganizationUuid().equals(organizationUuid)) {
            throw new RuntimeException("Employee does not belong to this organization");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // 2. Check existing attendance for today
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today);

        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();

            // Case: Already checked in, not checked out - This is CHECK OUT
            if (attendance.isCheckedIn() && !attendance.isCheckedOut()) {
                attendance.setCheckOutTime(now);
                attendanceRepository.save(attendance);

                log.info("Check-out recorded for employee: {} at {}", 
                        employee.getFirstName(), now);

                return buildResponse(attendance, employee, false);
            }

            // Case: Already completed attendance for today
            if (attendance.isComplete()) {
                return FaceAttendanceResponse.builder()
                        .success(false)
                        .message("You have already completed attendance for today (Check-in: " + 
                                 formatTime(attendance.getCheckInTime()) + ", Check-out: " + 
                                 formatTime(attendance.getCheckOutTime()) + ")")
                        .employeeId(employeeId)
                        .employeeName(employee.getFirstName() + " " + employee.getLastName())
                        .attendanceDate(today)
                        .checkInTime(attendance.getCheckInTime())
                        .checkOutTime(attendance.getCheckOutTime())
                        .status(attendance.getStatus().name())
                        .build();
            }
        }

        // 3. Create new attendance record - This is CHECK IN
        AttendanceStatus status = determineAttendanceStatus(now.toLocalTime());

        Attendance newAttendance = Attendance.builder()
                .organizationUuid(organizationUuid)
                .employeeId(employeeId)
                .attendanceDate(today)
                .checkInTime(now)
                .status(status)
                .verificationType(VerificationType.FACE_RECOGNITION)
                .verificationConfidence(request.getVerificationConfidence())
                .ipAddress(request.getIpAddress())
                .deviceInfo(request.getDeviceInfo())
                .notes(request.getNotes())
                .build();

        Attendance savedAttendance = attendanceRepository.save(newAttendance);

        log.info("Check-in recorded for employee: {} at {} with status: {}", 
                employee.getFirstName(), now, status);

        return buildResponse(savedAttendance, employee, true);
    }

    /**
     * Get today's attendance status for employee
     */
    public FaceAttendanceResponse getTodayAttendance(Long employeeId, String organizationUuid) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Optional<Attendance> todayAttendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, LocalDate.now());

        if (todayAttendance.isEmpty()) {
            return FaceAttendanceResponse.builder()
                    .success(true)
                    .message("No attendance recorded yet today. Please check in.")
                    .employeeId(employeeId)
                    .employeeName(employee.getFirstName() + " " + employee.getLastName())
                    .employeeCode(employee.getEmployeeCode())
                    .attendanceDate(LocalDate.now())
                    .build();
        }

        Attendance attendance = todayAttendance.get();
        
        String message;
        if (attendance.isComplete()) {
            message = "Attendance complete for today";
        } else if (attendance.isCheckedIn()) {
            message = "Checked in. Don't forget to check out!";
        } else {
            message = "Please check in";
        }

        return FaceAttendanceResponse.builder()
                .success(true)
                .message(message)
                .attendanceId(attendance.getId())
                .employeeId(employeeId)
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .employeeCode(employee.getEmployeeCode())
                .attendanceDate(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .verificationType(attendance.getVerificationType() != null ? 
                        attendance.getVerificationType().name() : null)
                .verificationConfidence(attendance.getVerificationConfidence())
                .build();
    }

    /**
     * Get attendance history for employee
     */
    public List<AttendanceHistoryResponse> getAttendanceHistory(Long employeeId, 
                                                                 LocalDate startDate, 
                                                                 LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository
                .findByEmployeeAndDateRange(employeeId, startDate, endDate);

        return attendances.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all attendance for organization on a specific date (Admin view)
     */
    public List<FaceAttendanceResponse> getOrganizationAttendance(String organizationUuid, LocalDate date) {
        List<Attendance> attendances = attendanceRepository
                .findByOrganizationUuidAndAttendanceDate(organizationUuid, date);

        return attendances.stream()
                .map(a -> {
                    Employee emp = a.getEmployee();
                    return FaceAttendanceResponse.builder()
                            .attendanceId(a.getId())
                            .employeeId(a.getEmployeeId())
                            .employeeName(emp != null ? emp.getFirstName() + " " + emp.getLastName() : "Unknown")
                            .employeeCode(emp != null ? emp.getEmployeeCode() : null)
                            .attendanceDate(a.getAttendanceDate())
                            .checkInTime(a.getCheckInTime())
                            .checkOutTime(a.getCheckOutTime())
                            .status(a.getStatus().name())
                            .verificationType(a.getVerificationType() != null ? 
                                    a.getVerificationType().name() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ===== Private Helper Methods =====

    private AttendanceStatus determineAttendanceStatus(LocalTime checkInTime) {
        if (checkInTime.isBefore(LATE_THRESHOLD)) {
            return AttendanceStatus.PRESENT;
        } else if (checkInTime.isBefore(HALF_DAY_THRESHOLD)) {
            return AttendanceStatus.LATE;
        } else {
            return AttendanceStatus.HALF_DAY;
        }
    }

    private FaceAttendanceResponse buildResponse(Attendance attendance, Employee employee, boolean isCheckIn) {
        String message;
        if (isCheckIn) {
            if (attendance.getStatus() == AttendanceStatus.LATE) {
                message = "Check-in successful (Late arrival)";
            } else if (attendance.getStatus() == AttendanceStatus.HALF_DAY) {
                message = "Check-in successful (Half day)";
            } else {
                message = "Check-in successful! Have a great day!";
            }
        } else {
            message = "Check-out successful! See you tomorrow!";
        }

        return FaceAttendanceResponse.builder()
                .success(true)
                .message(message)
                .attendanceId(attendance.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFirstName() + " " + employee.getLastName())
                .employeeCode(employee.getEmployeeCode())
                .attendanceDate(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .verificationType(VerificationType.FACE_RECOGNITION.name())
                .verificationConfidence(attendance.getVerificationConfidence())
                .isCheckIn(isCheckIn)
                .build();
    }

    private AttendanceHistoryResponse mapToHistoryResponse(Attendance attendance) {
        String workingHours = null;
        if (attendance.getCheckInTime() != null && attendance.getCheckOutTime() != null) {
            Duration duration = Duration.between(attendance.getCheckInTime(), attendance.getCheckOutTime());
            long hours = duration.toHours();
            long minutes = duration.toMinutesPart();
            workingHours = String.format("%d hrs %d mins", hours, minutes);
        }

        return AttendanceHistoryResponse.builder()
                .id(attendance.getId())
                .date(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .verificationType(attendance.getVerificationType() != null ? 
                        attendance.getVerificationType().name() : null)
                .workingHours(workingHours)
                .build();
    }

    private String formatTime(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        return dateTime.toLocalTime().toString();
    }
}