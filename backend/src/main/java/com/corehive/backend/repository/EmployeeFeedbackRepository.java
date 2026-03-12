package com.corehive.backend.repository;

import com.corehive.backend.model.EmployeeFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeFeedbackRepository extends JpaRepository<EmployeeFeedback, Long> {
    
    /**
     * Find all feedbacks by employee ID
     */
    @Query("SELECT f FROM EmployeeFeedback f " +
           "WHERE f.employee.id = :employeeId " +
           "ORDER BY f.createdAt DESC")
    List<EmployeeFeedback> findByEmployeeId(@Param("employeeId") Long employeeId);
    
    /**
     * Find all feedbacks by organization UUID
     */
    @Query("SELECT f FROM EmployeeFeedback f " +
           "JOIN f.employee e " +
           "WHERE e.organizationUuid = :orgUuid " +
           "ORDER BY f.createdAt DESC")
    List<EmployeeFeedback> findByOrganizationUuid(@Param("orgUuid") String orgUuid);
    
    /**
     * Count feedbacks submitted by employee in a specific month and year
     */
    @Query("SELECT COUNT(f) FROM EmployeeFeedback f " +
           "WHERE f.employee.id = :employeeId " +
           "AND YEAR(f.createdAt) = :year " +
           "AND MONTH(f.createdAt) = :month")
    Long countByEmployeeIdAndMonthAndYear(
        @Param("employeeId") Long employeeId,
        @Param("month") int month,
        @Param("year") int year
    );
}

