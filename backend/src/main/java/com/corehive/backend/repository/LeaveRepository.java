package com.corehive.backend.repository;

import com.corehive.backend.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRepository extends JpaRepository <LeaveRequest , Long> {
    // Get all leaves of a specific employee
    List<LeaveRequest> findByEmployeeId(Long employeeId);

    // Get leaves by status (PENDING, APPROVED, REJECTED)
    List<LeaveRequest> findByStatus(LeaveRequest.LeaveStatus status);
}


