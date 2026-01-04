package com.corehive.backend.service;

import com.corehive.backend.dto.attendance.AttendanceHistoryResponse;
import com.corehive.backend.dto.attendance.FaceAttendanceRequest;
import com.corehive.backend.dto.attendance.FaceAttendanceResponse;
import com.corehive.backend.dto.attendance.TodayAttendanceDTO;
import com.corehive.backend.exception.attendanceException.AttendanceAlreadyCheckedInException;
import com.corehive.backend.exception.attendanceException.AttendanceNotCheckedInException;
import com.corehive.backend.exception.attendanceException.AttendanceNotFoundException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Attendance.AttendanceStatus;
import com.corehive.backend.model.Attendance.VerificationType;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.AttendanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
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

        row.put("status", attendance.getStatus().name());

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
                    // - If attendance exists → show actual status
                    // - If not → NOT_CHECKED_IN
                    .status(att != null ? att.getStatus().name() : "NOT_CHECKED_IN")

                    // Attendance is complete only if both check-in & check-out exist
                    .isComplete(att != null && att.isComplete())
                    .build();
        }).toList();
    }

    // =========================================================
    // MANUAL CHECK-IN
    // Admin / HR marks check-in for an employee
    // =========================================================
    public void manualCheckIn(String orgUuid, Long employeeId) {

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

        // 5. Create new attendance record
        Attendance attendance = Attendance.builder()
                .organizationUuid(orgUuid)
                .employeeId(employeeId)
                .attendanceDate(today)
                .checkInTime(LocalDateTime.now())

                // Manual marking always defaults to PRESENT
                .status(Attendance.AttendanceStatus.PRESENT)

                // Since this is manual marking
                .verificationType(Attendance.VerificationType.MANUAL)
                .build();

        // 6. Save attendance
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

                    return TodayAttendanceDTO.builder()
                            .id(att.getId())
                            .employeeId(emp.getId())
                            .employeeName(emp.getFirstName() + " " + emp.getLastName())
                            .employeeCode(emp.getEmployeeCode())
                            .checkInTime(att.getCheckInTime())
                            .checkOutTime(null) // explicitly pending
                            .status(att.getStatus().name())
                            .isComplete(false)
                            .build();
                })
                .toList();
    }


    // =========================================================
    // MANUAL CHECK-OUT
    // Admin / HR marks check-out for an employee
    // =========================================================
    public TodayAttendanceDTO manualCheckOut(String orgUuid, Long employeeId) {

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new AttendanceNotCheckedInException("Not checked in"));

        if (attendance.getCheckOutTime() != null) {
            throw new AttendanceAlreadyCheckedInException("Already checked out");
        }

        attendance.setCheckOutTime(LocalDateTime.now());
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
                .orElse(null); // 👈 important: allow null

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

        return AttendanceHistoryResponse.builder()
                .id(attendance.getId())
                .date(attendance.getAttendanceDate())
                .checkInTime(attendance.getCheckInTime())
                .checkOutTime(attendance.getCheckOutTime())
                .status(attendance.getStatus() != null ? attendance.getStatus().name() : null)
                .verificationType(attendance.getVerificationType() != null ?
                        attendance.getVerificationType().name() : null)
                .workingHours(workingHours)
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

    @Transactional
    public Attendance markAttendanceViaQr(
            String qrToken,
            String ip,
            String deviceInfo
    ) throws BadRequestException {

//        // 1️⃣ Validate QR
//        try {
//            jwtUtil.extractExpiration(qrToken);
//        } catch (Exception e) {
//            throw new BadRequestException("Invalid or expired QR");
//        }

        Claims claims;
        try {
            claims = jwtUtil.extractQrClaims(qrToken);
        } catch (Exception e) {
            throw new BadRequestException("Invalid or expired QR");
        }


        Long employeeId = claims.get("employeeId", Long.class);
        String orgUuid = claims.get("organizationUuid", String.class);
        String purpose = claims.get("purpose", String.class);

        if (employeeId == null) {
            throw new BadRequestException("Invalid QR: employee not identified");
        }

        if (purpose == null) {
            throw new BadRequestException("Invalid QR: purpose missing");
        }

        // 2️⃣ Validate employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new BadRequestException("Invalid QR: employee not found")
                );

        if (!employee.getOrganizationUuid().equals(orgUuid)) {
            throw new BadRequestException("Invalid QR: wrong organization");
        }

        if (!employee.getIsActive()) {
            throw new BadRequestException("Employee inactive");
        }

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndOrganizationUuidAndAttendanceDate(
                        employeeId, orgUuid, today
                )
                .orElse(
                        Attendance.builder()
                                .employeeId(employeeId)
                                .organizationUuid(orgUuid)
                                .attendanceDate(today)
                                .verificationType(VerificationType.QR_CODE)
                                .build()
                );

        // 3️⃣ Check-in / Check-out logic
        if ("CHECK_IN".equals(purpose)) {

            if (attendance.isCheckedIn()) {
                throw new BadRequestException("Already checked in");
            }

            attendance.setCheckInTime(LocalDateTime.now());
            attendance.setStatus(AttendanceStatus.PRESENT);
        }
        else if ("CHECK_OUT".equals(purpose)) {

            if (!attendance.isCheckedIn()) {
                throw new BadRequestException("Check-in required first");
            }

            if (attendance.isCheckedOut()) {
                throw new BadRequestException("Already checked out");
            }

            attendance.setCheckOutTime(LocalDateTime.now());
        }
        else {
            throw new BadRequestException("Invalid QR purpose");
        }

        // 4️⃣ Audit
        attendance.setIpAddress(ip);
        attendance.setDeviceInfo(deviceInfo);

        return attendanceRepository.save(attendance);
    }



}