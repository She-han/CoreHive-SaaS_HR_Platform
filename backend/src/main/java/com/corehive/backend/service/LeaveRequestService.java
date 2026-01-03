package com.corehive.backend.service;

import com.corehive.backend.dto.request.CreateLeaveRequestDTO;
import com.corehive.backend.dto.request.LeaveRequestResponseDTO;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.leaveException.InsufficientLeaveBalanceException;
import com.corehive.backend.exception.leaveException.LeaveRequestNotFoundException;
import com.corehive.backend.exception.leaveException.LeaveTypeNotFoundException;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.model.LeaveType;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRequestRepository;
import com.corehive.backend.repository.LeaveTypeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestService {
    private final LeaveRequestRepository leaveRequestRepo;
    private final LeaveTypeRepository leaveTypeRepo;
    private final EmployeeRepository employeeRepo;

    // CREATE LEAVE REQUEST (For employee part implementation)
    public void createLeaveRequest(String orgUuid, CreateLeaveRequestDTO dto) {

        Employee employee = employeeRepo.findById(dto.getEmployeeId())
                .orElseThrow(() -> new EmployeeNotFoundException("Employee not found"));

        LeaveType leaveType = leaveTypeRepo.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new LeaveTypeNotFoundException("Leave type not found"));

        int totalDays = (int)
                ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        // Simple leave balance validation (example logic)
        if (employee.getLeaveCount() < totalDays) {
            throw new InsufficientLeaveBalanceException("Not enough leave balance");
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
    public void approveLeave(Long requestId, Long approverId, boolean approve) {

        // 1️⃣ Fetch leave request
        LeaveRequest request = leaveRequestRepo.findById(requestId)
                .orElseThrow(() ->
                        new LeaveRequestNotFoundException("Leave request not found")
                );

//        // 2️⃣ Fetch approver (HR / Manager)
//        Employee approver = employeeRepo.findById(approverId)
//                .orElseThrow(() ->
//                        new EmployeeNotFoundException("Approver not found")
//                );

        // 3️⃣ Prevent double approval
        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new IllegalStateException("Leave request already processed");
        }

        // 4️⃣ Approve or Reject
        if (approve) {
            request.setStatus(LeaveRequest.LeaveStatus.APPROVED);

            // Deduct leave balance ONLY on approval
            request.getEmployee().setLeaveCount(
                    request.getEmployee().getLeaveCount() - request.getTotalDays()
            );
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
                .map(req -> {
                    LeaveRequestResponseDTO dto = new LeaveRequestResponseDTO();
                    dto.setRequestId(req.getId());
                    dto.setEmployeeName(
                            req.getEmployee().getFirstName() + " " +
                                    req.getEmployee().getLastName()
                    );
                    dto.setLeaveType(req.getLeaveType().getName());
                    dto.setStartDate(req.getStartDate());
                    dto.setEndDate(req.getEndDate());
                    dto.setTotalDays(req.getTotalDays());
                    dto.setStatus(req.getStatus().name());
                    return dto;
                })
                .toList();
    }


}
