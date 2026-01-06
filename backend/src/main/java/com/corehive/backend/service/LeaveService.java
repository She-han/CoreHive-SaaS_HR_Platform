package com.corehive.backend.service;

import com.corehive.backend.dto.request.LeaveRequestDTO;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.LeaveRequestResponseDTO;
import com.corehive.backend.dto.response.LeaveTypeResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.model.LeaveType;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeService leaveTypeService;

    /**
     * Employee submits a leave request
     */
    @Transactional
    public ApiResponse<LeaveRequestResponseDTO> submitLeaveRequest(LeaveRequestDTO requestDTO) {
        try {
            log.info("Processing leave request for employee ID: {}", requestDTO.getEmployeeId());

            // Validate employee
            Employee employee = employeeRepository.findById(requestDTO.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + requestDTO.getEmployeeId()));

            // Validate leave type
            LeaveType leaveType = leaveTypeService.findById(requestDTO.getLeaveTypeId());
            if (leaveType == null) {
                return ApiResponse.error("Leave type not found");
            }

            // Validate dates
            if (requestDTO.getEndDate().isBefore(requestDTO.getStartDate())) {
                return ApiResponse.error("End date cannot be before start date");
            }

            // Calculate total days
            long totalDays = ChronoUnit.DAYS.between(requestDTO.getStartDate(), requestDTO.getEndDate()) + 1;

            // Create leave request
            LeaveRequest leaveRequest = new LeaveRequest();
            leaveRequest.setOrganizationUuid(employee.getOrganizationUuid());
            leaveRequest.setEmployee(employee);
            leaveRequest.setLeaveType(leaveType);
            leaveRequest.setStartDate(requestDTO.getStartDate());
            leaveRequest.setEndDate(requestDTO.getEndDate());
            leaveRequest.setTotalDays((int) totalDays);
            leaveRequest.setReason(requestDTO.getReason());
            leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);
            leaveRequest.setCreatedAt(LocalDateTime.now());

            LeaveRequest savedRequest = leaveRepository.save(leaveRequest);
            log.info("Leave request submitted successfully with ID: {}", savedRequest.getId());

            return ApiResponse.success("Leave request submitted successfully", mapToResponseDTO(savedRequest));

        } catch (Exception e) {
            log.error("Error submitting leave request", e);
            return ApiResponse.error("Failed to submit leave request: " + e.getMessage());
        }
    }

    /**
     * Get leave requests for a specific employee
     */
    public ApiResponse<List<LeaveRequestResponseDTO>> getEmployeeLeaveRequests(Long employeeId) {
        try {
            log.info("Fetching leave requests for employee ID: {}", employeeId);
            List<LeaveRequest> leaveRequests = leaveRepository.findByEmployeeId(employeeId);
            
            List<LeaveRequestResponseDTO> responseDTOs = leaveRequests.stream()
                    .map(this::mapToResponseDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success("Leave requests retrieved successfully", responseDTOs);
        } catch (Exception e) {
            log.error("Error fetching leave requests for employee ID: {}", employeeId, e);
            return ApiResponse.error("Failed to retrieve leave requests");
        }
    }

    /**
     * Get all leave types for an organization
     */
    public ApiResponse<List<LeaveTypeResponseDTO>> getLeaveTypes(String organizationUuid) {
        try {
            log.info("Fetching leave types for organization: {}", organizationUuid);
            List<LeaveType> leaveTypes = leaveTypeService.getActiveLeaveTypes(organizationUuid);
            
            List<LeaveTypeResponseDTO> responseDTOs = leaveTypes.stream()
                    .map(this::mapToLeaveTypeDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success("Leave types retrieved successfully", responseDTOs);
        } catch (Exception e) {
            log.error("Error fetching leave types", e);
            return ApiResponse.error("Failed to retrieve leave types");
        }
    }

    /**
     * Map LeaveRequest entity to DTO
     */
    private LeaveRequestResponseDTO mapToResponseDTO(LeaveRequest leaveRequest) {
        return LeaveRequestResponseDTO.builder()
                .id(leaveRequest.getId())
                .employeeId(leaveRequest.getEmployee().getId())
                .employeeName(leaveRequest.getEmployee().getFirstName() + " " + leaveRequest.getEmployee().getLastName())
                .leaveTypeId(leaveRequest.getLeaveType().getId())
                .leaveTypeName(leaveRequest.getLeaveType().getName())
                .startDate(leaveRequest.getStartDate())
                .endDate(leaveRequest.getEndDate())
                .totalDays(leaveRequest.getTotalDays())
                .reason(leaveRequest.getReason())
                .status(leaveRequest.getStatus())
                .approvedByName(null) // approvedBy is stored as Long ID, not Employee object
                .approvedAt(leaveRequest.getApprovedAt())
                .createdAt(leaveRequest.getCreatedAt())
                .build();
    }

    /**
     * Map LeaveType entity to DTO
     */
    private LeaveTypeResponseDTO mapToLeaveTypeDTO(LeaveType leaveType) {
        return LeaveTypeResponseDTO.builder()
                .id(leaveType.getId())
                .name(leaveType.getName())
                .code(leaveType.getCode())
                .defaultDaysPerYear(leaveType.getDefaultDaysPerYear())
                .requiresApproval(leaveType.getRequiresApproval())
                .isActive(leaveType.getIsActive())
                .build();
    }

    //HR can view all leave requests
    public List<LeaveRequest> getAllLeaves() {
        return leaveRepository.findAll();
    }

    //HR can filter leaves by employee
    public List<LeaveRequest> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    // HR can filter leaves by status (PENDING, APPROVED, REJECTED)
    public List<LeaveRequest> getLeavesByStatus(LeaveRequest.LeaveStatus status) {
        return leaveRepository.findByStatus(status);
    }

    // HR approves a leave
    public LeaveRequest approveLeave(Long id, Long approvedById) {
        LeaveRequest leaveRequest = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        Employee approver = employeeRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        leaveRequest.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRequest.setApprovedBy(approvedById);
        leaveRequest.setApprovedAt(LocalDateTime.now());

        return leaveRepository.save(leaveRequest);
    }

    //HR rejects a leave
    public LeaveRequest rejectLeave(Long id, String reason) {
        return null;
    }

    //HR delete a leave
    public void deleteLeave(Long id) {
        LeaveRequest leaveRequest = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRepository.delete(leaveRequest);
    }
}
