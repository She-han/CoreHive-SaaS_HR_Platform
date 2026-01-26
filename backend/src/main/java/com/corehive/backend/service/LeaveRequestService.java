package com.corehive.backend.service;

import com.corehive.backend.dto.request.CreateLeaveRequestDTO;
import com.corehive.backend.dto.response.LeaveRequestResponseDTO;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.leaveException.InsufficientLeaveBalanceException;
import com.corehive.backend.exception.leaveException.LeaveRequestNotFoundException;
import com.corehive.backend.exception.leaveException.LeaveTypeNotFoundException;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.EmployeeLeaveBalance;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.model.LeaveType;
import com.corehive.backend.model.Attendance;
import com.corehive.backend.repository.EmployeeLeaveBalanceRepository;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRequestRepository;
import com.corehive.backend.repository.LeaveTypeRepository;
import com.corehive.backend.repository.AttendanceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestService {
    private final LeaveRequestRepository leaveRequestRepo;
    private final LeaveTypeRepository leaveTypeRepo;
    private final EmployeeRepository employeeRepo;
    private final EmployeeLeaveBalanceRepository employeeLeaveBalanceRepo;
    private final AttendanceRepository attendanceRepository;

    // CREATE LEAVE REQUEST (For employee part implementation)
    public void createLeaveRequest(String orgUuid, CreateLeaveRequestDTO dto) {

        Employee employee = employeeRepo.findById(dto.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        LeaveType leaveType = leaveTypeRepo.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new LeaveTypeNotFoundException("Leave type not found"));

        int totalDays = (int)
                ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        // Get leave balance from EmployeeLeaveBalance table
        EmployeeLeaveBalance leaveBalance = employeeLeaveBalanceRepo
                .findByEmployeeIdAndLeaveTypeIdAndOrganizationUuid(
                        dto.getEmployeeId(), dto.getLeaveTypeId(), orgUuid)
                .orElseThrow(() -> new InsufficientLeaveBalanceException(
                        "No leave balance found for this leave type"));

        // Validate leave balance
        if (leaveBalance.getBalance() < totalDays) {
            throw new InsufficientLeaveBalanceException(
                    "Not enough leave balance. Available: " + leaveBalance.getBalance() + 
                    " days, Requested: " + totalDays + " days");
        }

        LeaveRequest request = new LeaveRequest();
        request.setOrganizationUuid(orgUuid);
        request.setEmployee(employee);
        request.setLeaveType(leaveType);
        request.setStartDate(dto.getStartDate());
        request.setEndDate(dto.getEndDate());
        request.setTotalDays(totalDays);
        request.setReason(dto.getReason());
        request.setStatus(LeaveRequest.LeaveStatus.PENDING);

        leaveRequestRepo.save(request);
    }

    // APPROVE / REJECT leave request
    @Transactional
    public void approveLeave(Long requestId, Long approverId, boolean approve) throws BadRequestException {

        // 1️⃣ Fetch leave request
        LeaveRequest request = leaveRequestRepo.findById(requestId)
                .orElseThrow(() ->
                        new LeaveRequestNotFoundException("Leave request not found")
                );

        // 3️⃣ Prevent double approval
        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new IllegalStateException("Leave request already processed");
        }


        // 3️⃣ Get employee & remaining leaves from EmployeeLeaveBalance
        Employee employee = request.getEmployee(); // ✅ correct employee
        Long leaveTypeId = request.getLeaveType().getId();
        int requestedDays = request.getTotalDays();

        // Get leave balance for this specific leave type
        EmployeeLeaveBalance leaveBalance = employeeLeaveBalanceRepo
                .findByEmployeeIdAndLeaveTypeIdAndOrganizationUuid(
                        employee.getId(), leaveTypeId, request.getOrganizationUuid())
                .orElseThrow(() -> new BadRequestException(
                        "No leave balance found for this leave type"));

        int remainingLeaves = leaveBalance.getBalance();

        // 4️⃣ Approve or Reject
        if (approve) {

            if (requestedDays > remainingLeaves) {
                throw new BadRequestException(
                        "Cannot approve leave. Requested " + requestedDays +
                                " days but only " + remainingLeaves + " days remaining."
                );
            }

            // 5️⃣ Approve & deduct leaves from EmployeeLeaveBalance
            request.setStatus(LeaveRequest.LeaveStatus.APPROVED);
            leaveBalance.setBalance(remainingLeaves - requestedDays);
            employeeLeaveBalanceRepo.save(leaveBalance);
            
            // 6️⃣ Mark attendance as ON_LEAVE for all days in the leave period
            markAttendanceAsOnLeave(employee.getId(), request.getOrganizationUuid(), 
                                   request.getStartDate(), request.getEndDate());
        } else {
            request.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        }

        // 5️⃣ Set approver details
        request.setApprovedBy(approverId);
        request.setApprovedAt(LocalDateTime.now());

        // 6️⃣ Save changes
        leaveRequestRepo.save(request);
    }


    // LIST ALL REQUESTS
    public List<LeaveRequestResponseDTO> getAllRequests(String orgUuid) {

        if (orgUuid == null || orgUuid.isBlank()) {
            throw new IllegalArgumentException("Organization UUID must not be null or empty");
        }

        List<LeaveRequest> requests =
                leaveRequestRepo.findByOrganizationUuid(orgUuid);

        if (requests.isEmpty()) {
            throw new LeaveRequestNotFoundException(
                    "No leave requests found for organization: " + orgUuid
            );
        }

        return requests.stream()
                .map(req -> LeaveRequestResponseDTO.builder()
                        .id(req.getId())
                        .employeeId(req.getEmployee().getId())
                        .employeeName(
                                req.getEmployee().getFirstName() + " " +
                                        req.getEmployee().getLastName()
                        )
                        .leaveTypeId(req.getLeaveType().getId())
                        .leaveTypeName(req.getLeaveType().getName())
                        .startDate(req.getStartDate())
                        .endDate(req.getEndDate())
                        .totalDays(req.getTotalDays())
                        .reason(req.getReason())
                        .status(req.getStatus())
                        .approvedAt(req.getApprovedAt())
                        .createdAt(req.getCreatedAt())
                        .build()
                )
                .toList();
    }

    /**
     * Helper method to mark attendance as ON_LEAVE for all days in a leave period
     */
    private void markAttendanceAsOnLeave(Long employeeId, String orgUuid, 
                                         LocalDate startDate, LocalDate endDate) {
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            // Check if attendance record already exists for this date
            attendanceRepository.findByEmployeeIdAndAttendanceDateAndOrganizationUuid(
                employeeId, currentDate, orgUuid
            ).ifPresentOrElse(
                // Update existing record
                existingAttendance -> {
                    existingAttendance.setStatus(Attendance.AttendanceStatus.ON_LEAVE);
                    existingAttendance.setNotes("Leave approved");
                    attendanceRepository.save(existingAttendance);
                },
                // Create new record
                () -> {
                    Attendance newAttendance = Attendance.builder()
                        .employeeId(employeeId)
                        .organizationUuid(orgUuid)
                        .attendanceDate(currentDate)
                        .status(Attendance.AttendanceStatus.ON_LEAVE)
                        .verificationType(Attendance.VerificationType.MANUAL)
                        .notes("Leave approved")
                        .build();
                    attendanceRepository.save(newAttendance);
                }
            );
            
            currentDate = currentDate.plusDays(1);
        }
    }


}
