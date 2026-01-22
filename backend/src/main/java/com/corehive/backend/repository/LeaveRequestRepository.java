package com.corehive.backend.repository;

import com.corehive.backend.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest , Long> {

    List<LeaveRequest> findByOrganizationUuid(String orgUuid);

    List<LeaveRequest> findByStatusAndOrganizationUuid(
            LeaveRequest.LeaveStatus status,
            String orgUuid
    );

    //Count leave requests per organization
    int countByOrganizationUuid(String orgUuid);
}
