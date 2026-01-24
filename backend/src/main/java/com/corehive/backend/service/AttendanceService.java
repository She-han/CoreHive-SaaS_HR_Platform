package com.corehive.backend.service;

import com.corehive.backend.dto.attendance.AttendanceHistoryResponse;
import com.corehive.backend.dto.attendance.FaceAttendanceRequest;
import com.corehive.backend.dto.attendance.FaceAttendanceResponse;
import com.corehive.backend.dto.attendance.TodayAttendanceDTO;
import com.corehive.backend.dto.response.QrAttendanceResponse;
import com.corehive.backend.exception.attendanceException.AttendanceAlreadyCheckedInException;
import com.corehive.backend.exception.attendanceException.AttendanceNotCheckedInException;
import com.corehive.backend.exception.attendanceException.AttendanceNotFoundException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Attendance.AttendanceStatus;
import com.corehive.backend.model.Attendance.VerificationType;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRequestRepository;
import com.corehive.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceConfigurationService attendanceConfigurationService;
    private final JwtUtil jwtUtil;

    private static final LocalTime OFFICE_START_TIME = LocalTime.of(9, 0);
    private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 30);
    private static final LocalTime HALF_DAY_THRESHOLD = LocalTime.of(13, 0);

    //GET ATTENDANCE DETAILS FOR A WEEK/////////////////////////////////////
    private long calculateWorkingMinutes(Attendance attendance) {

        if (attendance.getCheckInTime() == null ||
                attendance.getCheckOutTime() == null) {
            return 0;
        }

        return Duration.between(
                attendance.getCheckInTime(),
                attendance.getCheckOutTime()
        ).toMinutes();
    }

    private long calculateLateMinutes(Attendance attendance) {

        if (attendance.getStatus() != Attendance.AttendanceStatus.LATE ||
                attendance.getCheckInTime() == null) {
            return 0;
        }

        //assume office start at 9am
        LocalTime officeStart = LocalTime.of(9, 0);

        return Math.max(
                0,
                Duration.between(
                        officeStart,
                        attendance.getCheckInTime().toLocalTime()
                ).toMinutes()
        );
    }


    private Map<String, Object> buildAttendanceRow(Attendance attendance) {

        Map<String, Object> row = new HashMap<>();

        Employee emp = attendance.getEmployee();

        row.put("employeeId", emp.getId());
        row.put("name", emp.getFirstName() + " " + emp.getLastName());
        row.put("dept", emp.getDepartment() != null
                ? emp.getDepartment().getName()
                : "N/A");

        row.put("date", attendance.getAttendanceDate());

        // Check if employee has approved leave on this date
        boolean hasApprovedLeave = leaveRequestRepository.hasApprovedLeaveOnDate(
                emp.getId(), 
                attendance.getAttendanceDate()
        );

        // If employee has approved leave, show ON_LEAVE status
        row.put("status", hasApprovedLeave ? "ON_LEAVE" : attendance.getStatus().name());

        row.put("checkIn", attendance.getCheckInTime());
        row.put("checkOut", attendance.getCheckOutTime());

        // Calculate working minutes
        row.put("workingMinutes", calculateWorkingMinutes(attendance));

        row.put("lateMinutes", calculateLateMinutes(attendance));

        return row;
    }
    ////////////////////////////////////////////////////////////////////////////////////

    //GET TODAY SUMMARY BY STATUS WITH COUNT
    public Map<String, Long> getTodaySummary(String orgUuid, LocalDate date) {

        // If frontend does not send date → use today
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        List<Object[]> results =
                attendanceRepository.countByStatus(orgUuid, targetDate);

        // 🔑 MUST MATCH FRONTEND KEYS
        Map<String, Long> summary = new HashMap<>();
        summary.put("PRESENT", 0L);
        summary.put("LATE", 0L);
        summary.put("ON_LEAVE", 0L);
        summary.put("HALF_DAY", 0L);
        summary.put("ABSENT", 0L);
        summary.put("WORK_FROM_HOME", 0L);

        for (Object[] row : results) {
            AttendanceStatus status = (AttendanceStatus) row[0];
            Long count = (Long) row[1];

            switch (status) {
                case PRESENT -> summary.put("PRESENT", count);
                case LATE -> summary.put("LATE", count);
                case ON_LEAVE -> summary.put("ON_LEAVE", count);
                case ABSENT -> summary.put("ABSENT", count);
                case WORK_FROM_HOME -> summary.put("WORK_FROM_HOME", count);

                // ❌ HALF_DAY intentionally ignored (not shown in cards)
                case HALF_DAY -> { }
            }
        }

        // Add count of employees with approved leaves on this date
        List<Long> employeeIdsOnLeave = leaveRequestRepository
                .findEmployeeIdsWithApprovedLeaveOnDate(orgUuid, targetDate);
        
        // Update ON_LEAVE count to include employees with approved leave requests
        summary.put("ON_LEAVE", summary.get("ON_LEAVE") + employeeIdsOnLeave.size());

        return summary;
    }


    //GET ATTENDANCE BY DATE
    public List<Map<String, Object>> getAttendanceForDate(
            String orgUuid,
            LocalDate date
    ) {

        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }

        List<Attendance> records =
                attendanceRepository.findByOrgAndDate(orgUuid, date);

        // Convert entities → response objects (NO MAPPER)
        return records.stream()
                .map(this::buildAttendanceRow)
                .toList();
    }

    // =========================================================
    // GET ALL EMPLOYEES WITH TODAY'S ATTENDANCE STATUS
    // Used in CHECK-IN TAB (Admin / HR)
    // =========================================================
    public List<TodayAttendanceDTO> getEmployeesForCheckIn(String orgUuid) {

        // 1. Fetch all ACTIVE employees for the organization
        //    Inactive employees should not be shown in attendance screens
        List<Employee> employees = employeeRepository
                .findByOrganizationUuidAndIsActiveTrue(orgUuid);

        // 2. Get today's date once (avoid calling LocalDate.now() repeatedly)
        LocalDate today = LocalDate.now();

        // 3. For each employee, check if attendance exists for today
        return employees.stream().map(emp -> {

            // Fetch today's attendance record (if any)
            Attendance att = attendanceRepository
                    .findByEmployeeIdAndAttendanceDate(emp.getId(), today)
                    .orElse(null);

            // Check if employee has approved leave on this date
            boolean hasApprovedLeave = leaveRequestRepository.hasApprovedLeaveOnDate(emp.getId(), today);

            // 4. Build response DTO with attendance status
            return TodayAttendanceDTO.builder()
                    .id(att != null ? att.getId() : null) // Attendance ID
                    .employeeId(emp.getId())
                    .employeeName(emp.getFirstName() + " " + emp.getLastName())
                    .employeeCode(emp.getEmployeeCode())

                    // If attendance exists → show times
                    // If not → keep null
                    .checkInTime(att != null ? att.getCheckInTime() : null)
                    .checkOutTime(att != null ? att.getCheckOutTime() : null)

                    // Status logic:
                    // - If employee has approved leave → ON_LEAVE
                    // - If attendance exists → show actual status
                    // - If not → NOT_CHECKED_IN
                    .status(hasApprovedLeave ? "ON_LEAVE" : 
                            (att != null ? att.getStatus().name() : "NOT_CHECKED_IN"))

                    // Attendance is complete only if both check-in & check-out exist
                    .isComplete(att != null && att.isComplete())
                    .build();
        }).toList();
    }

    // =========================================================
    // MANUAL CHECK-IN
    // Admin / HR marks check-in for an employee
    // =========================================================
    public void manualCheckIn(String orgUuid, Long employeeId, String manualTime) {

        // 1. Validate employee exists
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException("Employee not found")
                );

        // 2. Validate employee belongs to the same organization
        if (!employee.getOrganizationUuid().equals(orgUuid)) {
            throw new OrganizationNotFoundException("Invalid organization");
        }

        // 3. Get today's date
        LocalDate today = LocalDate.now();

        // 4. Prevent duplicate check-ins for the same day
        if (attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today)
                .isPresent()) {

            throw new AttendanceAlreadyCheckedInException(
                    "Employee already checked in today"
            );
        }

        // 5. Get check-in time: manual or current time
        LocalDateTime checkInDateTime;
        if (manualTime != null && !manualTime.isEmpty()) {
            // Parse manual time (HH:mm format) and combine with today's date
            LocalTime time = LocalTime.parse(manualTime);
            checkInDateTime = LocalDateTime.of(today, time);
        } else {
            // Use current local time
            checkInDateTime = LocalDateTime.now();
        }
        LocalTime checkInTime = checkInDateTime.toLocalTime();


        // 6. Determine status based on attendance configuration
        Attendance.AttendanceStatus status = determineStatusFromConfig(employeeId, orgUuid, checkInTime);

        // 7. Create new attendance record
        Attendance attendance = Attendance.builder()
                .organizationUuid(orgUuid)
                .employeeId(employeeId)
                .attendanceDate(today)
                .checkInTime(checkInDateTime)
                .status(status)
                .verificationType(Attendance.VerificationType.MANUAL)
                .build();

        // 8. Save attendance
        attendanceRepository.save(attendance);
    }

    // =========================================================
// GET PENDING CHECK-OUTS (Admin / HR)
// Employees who checked in today but not checked out
// =========================================================
    @Transactional(readOnly = true)
    public List<TodayAttendanceDTO> getPendingCheckouts(String orgUuid) {

        if (orgUuid == null || orgUuid.isBlank()) {
            throw new OrganizationNotFoundException("Organization UUID is required");
        }

        LocalDate today = LocalDate.now();

        List<Attendance> pendingAttendances =
                attendanceRepository.findPendingCheckouts(orgUuid, today);

        return pendingAttendances.stream()
                .map(att -> {
                    Employee emp = att.getEmployee();

                    if (emp == null) {
                        throw new EmployeeNotFoundException(
                                "Employee not found for attendance ID: " + att.getId()
                        );
                    }

                    // Check if employee has approved leave on this date
                    boolean hasApprovedLeave = leaveRequestRepository.hasApprovedLeaveOnDate(emp.getId(), today);

                    return TodayAttendanceDTO.builder()
                            .id(att.getId())
                            .employeeId(emp.getId())
                            .employeeName(emp.getFirstName() + " " + emp.getLastName())
                            .employeeCode(emp.getEmployeeCode())
                            .checkInTime(att.getCheckInTime())
                            .checkOutTime(null) // explicitly pending
                            .status(hasApprovedLeave ? "ON_LEAVE" : att.getStatus().name())
                            .isComplete(false)
                            .build();
                })
                .toList();
    }


    // =========================================================
    // MANUAL CHECK-OUT
    // Admin / HR marks check-out for an employee
    // =========================================================
    public TodayAttendanceDTO manualCheckOut(String orgUuid, Long employeeId, String manualTime) {

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new AttendanceNotCheckedInException("Not checked in"));

        if (attendance.getCheckOutTime() != null) {
            throw new AttendanceAlreadyCheckedInException("Already checked out");
        }

        // Set checkout time: manual or current time
        LocalDateTime checkOutDateTime;
        if (manualTime != null && !manualTime.isEmpty()) {
            // Parse manual time (HH:mm format) and combine with today's date
            LocalTime time = LocalTime.parse(manualTime);
            checkOutDateTime = LocalDateTime.of(LocalDate.now(), time);
        } else {
            // Use current local time
            checkOutDateTime = LocalDateTime.now();
        }
        attendance.setCheckOutTime(checkOutDateTime);

        // Re-evaluate attendance status based on both check-in and check-out times
        // This handles early departure (HALF_DAY if left before morning threshold)
        LocalTime checkInTime = attendance.getCheckInTime().toLocalTime();
        LocalTime checkOutTime = checkOutDateTime.toLocalTime();
        Attendance.AttendanceStatus updatedStatus = determineStatusFromConfig(
                employeeId, orgUuid, checkInTime, checkOutTime
        );
        attendance.setStatus(updatedStatus);

        // Calculate OT hours based on configuration
        calculateAndSetOtHours(attendance, employeeId, orgUuid, checkOutTime);

        attendanceRepository.save(attendance);

        Employee emp = attendance.getEmployee();

        return TodayAttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployeeId())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .employeeCode(emp.getEmployeeCode())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime()) // ✅ IMPORTANT
                .status(attendance.getStatus().name())
                .isComplete(true)
                .build();
    }

    // =========================================================
    // UPDATE ATTENDANCE STATUS
    // =========================================================
    @Transactional
    public TodayAttendanceDTO updateAttendanceStatus(
            String orgUuid,
            Long employeeId,
            Attendance.AttendanceStatus newStatus,
            LocalDateTime newCheckInTime
    ) {
        LocalDate today = LocalDate.now();

        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today)
                .orElse(null);

        if (attendance == null) {
            // If no record exists, create it
            attendance = Attendance.builder()
                    .organizationUuid(orgUuid)
                    .employeeId(employeeId)
                    .attendanceDate(today)
                    .status(newStatus)
                    .checkInTime(newCheckInTime) // optional, if passed
                    .verificationType(Attendance.VerificationType.MANUAL)
                    .build();

            // Prevent check-in for ABSENT or ON_LEAVE
            if ((newStatus == Attendance.AttendanceStatus.ABSENT ||
                    newStatus == Attendance.AttendanceStatus.ON_LEAVE)
                    && newCheckInTime != null) {
                throw new IllegalArgumentException("Cannot log check-in for ABSENT or ON_LEAVE status");
            }


        } else {
            // Update status if record exists
            if (attendance.getCheckOutTime() != null) {
                throw new IllegalStateException("Cannot change status after checkout");
            }

            attendance.setStatus(newStatus);

            // If you pass check-in time, update it
            if (newCheckInTime != null) {
                attendance.setCheckInTime(newCheckInTime);
            }
        }

        attendanceRepository.save(attendance);

        return TodayAttendanceDTO.builder()
                .id(attendance.getId())
                .employeeId(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus().name())
                .isComplete(attendance.isComplete())
                .build();
    }


    /**
     * Mark CHECK-IN only - won't allow if already checked in today
     */
    @Transactional
    public FaceAttendanceResponse markCheckIn(Long employeeId, String organizationUuid,
                                              FaceAttendanceRequest request) {
        log.info("Marking CHECK-IN for employee ID: {} in org: {}", employeeId, organizationUuid);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        if (!employee.getOrganizationUuid().equals(organizationUuid)) {
            throw new RuntimeException("Employee does not belong to this organization");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Check if already checked in today
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today);

        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();

            // Already has check-in record
            return FaceAttendanceResponse.builder()
                    .success(false)
                    .message(employee.getFirstName() + " has already checked in today at " +
                            formatTime(attendance.getCheckInTime()))
                    .employeeId(employeeId)
                    .employeeName(employee.getFirstName() + " " + employee.getLastName())
                    .attendanceDate(today)
                    .checkInTime(attendance.getCheckInTime())
                    .checkOutTime(attendance.getCheckOutTime())
                    .status(attendance.getStatus().name())
                    .isCheckIn(true)
                    .build();
        }

        // Create new check-in record
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
     * Mark CHECK-OUT only - requires existing check-in record
     */
    @Transactional
    public FaceAttendanceResponse markCheckOut(Long employeeId, String organizationUuid,
                                               FaceAttendanceRequest request) {
        log.info("Marking CHECK-OUT for employee ID: {} in org: {}", employeeId, organizationUuid);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        if (!employee.getOrganizationUuid().equals(organizationUuid)) {
            throw new RuntimeException("Employee does not belong to this organization");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        // Check for existing check-in
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today);

        if (existingAttendance.isEmpty()) {
            return FaceAttendanceResponse.builder()
                    .success(false)
                    .message(employee.getFirstName() + " has not checked in today. Please check-in first.")
                    .employeeId(employeeId)
                    .employeeName(employee.getFirstName() + " " + employee.getLastName())
                    .isCheckIn(false)
                    .build();
        }

        Attendance attendance = existingAttendance.get();

        // Already checked out
        if (attendance.isCheckedOut()) {
            return FaceAttendanceResponse.builder()
                    .success(false)
                    .message(employee.getFirstName() + " has already checked out at " +
                            formatTime(attendance.getCheckOutTime()))
                    .employeeId(employeeId)
                    .employeeName(employee.getFirstName() + " " + employee.getLastName())
                    .attendanceDate(today)
                    .checkInTime(attendance.getCheckInTime())
                    .checkOutTime(attendance.getCheckOutTime())
                    .status(attendance.getStatus().name())
                    .isCheckIn(false)
                    .build();
        }

        // Mark checkout
        attendance.setCheckOutTime(now);
        attendanceRepository.save(attendance);

        log.info("Check-out recorded for employee: {} at {}", employee.getFirstName(), now);

        return buildResponse(attendance, employee, false);
    }

    /**
     * Mark attendance using face recognition (auto check-in/out - legacy method)
     */
    @Transactional
    public FaceAttendanceResponse markFaceAttendance(Long employeeId, String organizationUuid,
                                                     FaceAttendanceRequest request) {
        log.info("Marking face attendance for employee ID: {} in org: {}", employeeId, organizationUuid);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        if (!employee.getOrganizationUuid().equals(organizationUuid)) {
            throw new RuntimeException("Employee does not belong to this organization");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        Optional<Attendance> existingAttendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, today);

        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();

            if (attendance.isCheckedIn() && !attendance.isCheckedOut()) {
                attendance.setCheckOutTime(now);
                attendanceRepository.save(attendance);

                log.info("Check-out recorded for employee: {} at {}",
                        employee.getFirstName(), now);

                return buildResponse(attendance, employee, false);
            }

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

    public List<AttendanceHistoryResponse> getAttendanceHistory(Long employeeId,
                                                                LocalDate startDate,
                                                                LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository
                .findByEmployeeAndDateRange(employeeId, startDate, endDate);

        return attendances.stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

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
                            .verificationConfidence(a.getVerificationConfidence())
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
            String statusText = attendance.getStatus() == AttendanceStatus.LATE ? " (Late)" :
                    attendance.getStatus() == AttendanceStatus.HALF_DAY ? " (Half Day)" : "";
            message = "Good " + getGreeting() + ", " + employee.getFirstName() + "! " +
                    "Check-in successful at " + formatTime(attendance.getCheckInTime()) + statusText;
        } else {
            message = "Goodbye, " + employee.getFirstName() + "! " +
                    "Check-out recorded at " + formatTime(attendance.getCheckOutTime());
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

        String otHours = null;
        if (attendance.getOtHours() != null) {
            otHours = attendance.getOtHours().toString();
        }

        return AttendanceHistoryResponse.builder()
                .id(attendance.getId())
                .date(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus() != null ? attendance.getStatus().name() : null)
                .verificationType(attendance.getVerificationType() != null ?
                        attendance.getVerificationType().name() : null)
                .workingHours(workingHours)
                .otHours(otHours)
                .build();
    }

    private String formatTime(LocalDateTime dateTime) {
        return dateTime.toLocalTime().toString().substring(0, 5);
    }

    private String getGreeting() {
        int hour = LocalTime.now().getHour();
        if (hour < 12) return "morning";
        if (hour < 17) return "afternoon";
        return "evening";
    }

    /**
     * Determines attendance status based on check-in time and attendance configuration
     * Applies priority-based configuration (Employee > Designation > Department > Organization)
     * This version is used during CHECK-IN (no checkout time available yet)
     */
    private Attendance.AttendanceStatus determineStatusFromConfig(Long employeeId, String orgUuid, LocalTime checkInTime) {
        try {
            // Get applicable configuration for this employee
            Optional<com.corehive.backend.model.AttendanceConfiguration> configOpt =
                    attendanceConfigurationService.getApplicableConfiguration(employeeId, orgUuid);

            if (configOpt.isPresent()) {
                com.corehive.backend.model.AttendanceConfiguration config = configOpt.get();
                // Compare check-in time with configured thresholds
                if (checkInTime.isAfter(config.getAbsentThreshold())) {
                    return Attendance.AttendanceStatus.ABSENT;
                } else if (checkInTime.isAfter(config.getEveningHalfDayThreshold())) {
                    return Attendance.AttendanceStatus.HALF_DAY;
                } else if (checkInTime.isAfter(config.getLateThreshold())) {
                    return Attendance.AttendanceStatus.LATE;
                } else {
                    return Attendance.AttendanceStatus.PRESENT;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load attendance configuration for employee {}: {}", employeeId, e.getMessage());
        }

        // Fallback to default logic if no configuration found
        return determineAttendanceStatus(checkInTime);
    }

    /**
     * Re-evaluates attendance status during CHECK-OUT based on both check-in and check-out times
     * Applies priority-based configuration (Employee > Designation > Department > Organization)
     * This version checks for early departure (half-day due to early checkout)
     */
    private Attendance.AttendanceStatus determineStatusFromConfig(Long employeeId, String orgUuid, LocalTime checkInTime, LocalTime checkOutTime) {
        try {
            // Get applicable configuration for this employee
            Optional<com.corehive.backend.model.AttendanceConfiguration> configOpt =
                    attendanceConfigurationService.getApplicableConfiguration(employeeId, orgUuid);

            if (configOpt.isPresent()) {
                com.corehive.backend.model.AttendanceConfiguration config = configOpt.get();
                
                // First, check if it's an early departure (checked in on time but left early)
                // This should be checked FIRST as it's a special case
                if (checkInTime.isBefore(config.getLateThreshold()) && 
                    checkOutTime.isBefore(config.getMorningHalfDayThreshold())) {
                    return Attendance.AttendanceStatus.HALF_DAY;
                }
                
                // Then check regular check-in based status
                if (checkInTime.isAfter(config.getAbsentThreshold())) {
                    return Attendance.AttendanceStatus.ABSENT;
                } else if (checkInTime.isAfter(config.getEveningHalfDayThreshold())) {
                    return Attendance.AttendanceStatus.HALF_DAY;
                } else if (checkInTime.isAfter(config.getLateThreshold())) {
                    return Attendance.AttendanceStatus.LATE;
                } else {
                    return Attendance.AttendanceStatus.PRESENT;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to load attendance configuration for employee {}: {}", employeeId, e.getMessage());
        }

        // Fallback to default logic if no configuration found
        return determineAttendanceStatus(checkInTime);
    }

    /**
     * Calculates and sets OT hours based on attendance configuration
     * OT is calculated only if checkout time is after the configured OT start time
     */
    private void calculateAndSetOtHours(Attendance attendance, Long employeeId, String orgUuid, LocalTime checkOutTime) {
        try {
            // Get applicable configuration for this employee
            Optional<com.corehive.backend.model.AttendanceConfiguration> configOpt =
                    attendanceConfigurationService.getApplicableConfiguration(employeeId, orgUuid);

            if (configOpt.isPresent()) {
                com.corehive.backend.model.AttendanceConfiguration config = configOpt.get();
                if (config.getOtStartTime() != null) {
                    // Check if checkout is after OT start time
                    if (checkOutTime.isAfter(config.getOtStartTime())) {
                        // Calculate OT hours as difference between checkout and OT start time
                        Duration otDuration = Duration.between(config.getOtStartTime(), checkOutTime);
                        double otHours = otDuration.toMinutes() / 60.0;

                        // Set OT hours (rounded to 2 decimal places)
                        attendance.setOtHours(java.math.BigDecimal.valueOf(otHours)
                                .setScale(2, java.math.RoundingMode.HALF_UP));

                        log.info("OT hours calculated for employee {}: {} hours", employeeId, otHours);
                    } else {
                        // No OT if checkout before OT start time
                        attendance.setOtHours(java.math.BigDecimal.ZERO);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to calculate OT hours for employee {}: {}", employeeId, e.getMessage());
            // Don't fail the checkout if OT calculation fails
            attendance.setOtHours(java.math.BigDecimal.ZERO);
        }
    }

    //Get today on-leave employee count
    public int getTodayOnLeaveCount(String organizationUuid) {

        if (organizationUuid == null || organizationUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID cannot be null or empty");
        }

        LocalDate today = LocalDate.now();

        return attendanceRepository.countByOrganizationUuidAndAttendanceDateAndStatus(
                organizationUuid,
                today,
                Attendance.AttendanceStatus.ON_LEAVE
        );
    }

    // ***********************************************
// Mark attendance using PERMANENT QR
// ***********************************************

    @Transactional
    public QrAttendanceResponse markAttendanceViaQr(
            String qrToken,
            String ip,
            String deviceInfo
    ) throws BadRequestException {

        // 1️⃣ Resolve employee using SHORT QR token
        Employee employee = (Employee) employeeRepository
                .findByQrToken(qrToken)
                .orElseThrow(() -> new BadRequestException("Invalid QR"));

        if (!Boolean.TRUE.equals(employee.getIsActive())) {
            throw new BadRequestException("Employee inactive");
        }

        Long employeeId = employee.getId();
        String orgUuid = employee.getOrganizationUuid();
        LocalDate today = LocalDate.now();

        // 2️⃣ Check existing attendance for today
        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndOrganizationUuidAndAttendanceDate(
                        employeeId, orgUuid, today
                )
                .orElse(null);

        String action;

        // ================= FIRST SCAN → CHECK-IN =================
        if (attendance == null) {

            attendance = Attendance.builder()
                    .employeeId(employeeId)
                    .organizationUuid(orgUuid)
                    .attendanceDate(today)
                    .checkInTime(LocalDateTime.now())
                    .status(Attendance.AttendanceStatus.PRESENT)   // ✅ REQUIRED
                    .verificationType(Attendance.VerificationType.QR_CODE)
                    .ipAddress(ip)
                    .deviceInfo(deviceInfo)
                    .build();

            attendanceRepository.save(attendance);
            action = "CHECK_IN";
        }

        // ================= SECOND SCAN → CHECK-OUT =================
        else if (attendance.getCheckOutTime() == null) {

            attendance.setCheckOutTime(LocalDateTime.now());
            attendance.setVerificationType(Attendance.VerificationType.QR_CODE);
            attendance.setIpAddress(ip);
            attendance.setDeviceInfo(deviceInfo);

            attendanceRepository.save(attendance);
            action = "CHECK_OUT";
        }

        // ================= THIRD SCAN → SAFE NO-OP =================
        else {
            action = "ALREADY_COMPLETED";
        }

        // 3️⃣ Response
        return QrAttendanceResponse.builder()
                .employeeId(employeeId)
                .attendanceDate(today)
                .action(action)
                .message(
                        switch (action) {
                            case "CHECK_IN" -> "Check-in successful";
                            case "CHECK_OUT" -> "Check-out successful";
                            default -> "Attendance already completed for today";
                        }
                )
                .build();
    }


}