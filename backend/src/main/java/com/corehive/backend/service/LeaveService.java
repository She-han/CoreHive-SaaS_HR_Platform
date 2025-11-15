package com.corehive.backend.service;

import com.corehive.backend.model.Employee;
import com.corehive.backend.model.LeaveRequest;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.repository.LeaveRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveService(LeaveRepository leaveRepository, EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
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
        leaveRequest.setApprovedBy(approver);
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
