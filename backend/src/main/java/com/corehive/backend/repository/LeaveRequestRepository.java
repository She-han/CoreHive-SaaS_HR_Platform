package com.corehive.backend.repository;

import com.corehive.backend.model.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest , Long> {

    List<LeaveRequest> findByOrganizationUuid(String orgUuid);

    List<LeaveRequest> findByStatusAndOrganizationUuid(
            LeaveRequest.LeaveStatus status,
            String orgUuid
    );

    //Count leave requests per organization
    int countByOrganizationUuid(String orgUuid);

    // Check if employee has approved leave on a specific date
    @Query("SELECT COUNT(lr) > 0 FROM LeaveRequest lr WHERE lr.employee.id = :employeeId " +
           "AND lr.status = 'APPROVED' " +
           "AND :date BETWEEN lr.startDate AND lr.endDate")
    boolean hasApprovedLeaveOnDate(@Param("employeeId") Long employeeId, 
                                   @Param("date") LocalDate date);

    // Get all employees with approved leave on a specific date for an organization
    @Query("SELECT lr.employee.id FROM LeaveRequest lr WHERE lr.organizationUuid = :orgUuid " +
           "AND lr.status = 'APPROVED' " +
           "AND :date BETWEEN lr.startDate AND lr.endDate")
    List<Long> findEmployeeIdsWithApprovedLeaveOnDate(@Param("orgUuid") String orgUuid,
                                                       @Param("date") LocalDate date);

       void deleteByOrganizationUuidAndEmployee_Id(String organizationUuid, Long employeeId);
}
