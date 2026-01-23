package com.corehive.backend.repository;

import com.corehive.backend.model.Allowance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllowanceRepository extends JpaRepository<Allowance, Long> {
    
    List<Allowance> findByOrganizationUuidAndIsActiveTrue(String organizationUuid);
    
    List<Allowance> findByOrganizationUuidAndDepartmentIdAndIsActiveTrue(String organizationUuid, Long departmentId);
    
    List<Allowance> findByOrganizationUuidAndDesignationAndIsActiveTrue(String organizationUuid, String designation);
    
    List<Allowance> findByOrganizationUuidAndEmployeeIdAndIsActiveTrue(String organizationUuid, Long employeeId);
    
    @Query("""
        SELECT a FROM Allowance a 
        WHERE a.organizationUuid = :orgUuid 
        AND a.isActive = true
        AND (
            a.allowanceType = 'ALL_EMPLOYEES' 
            OR (a.allowanceType = 'DEPARTMENT_WISE' AND a.departmentId = :departmentId)
            OR (a.allowanceType = 'DESIGNATION_WISE' AND a.designation = :designation)
            OR (a.allowanceType = 'EMPLOYEE_SPECIFIC' AND a.employeeId = :employeeId)
        )
    """)
    List<Allowance> findApplicableAllowances(
        @Param("orgUuid") String orgUuid,
        @Param("departmentId") Long departmentId,
        @Param("designation") String designation,
        @Param("employeeId") Long employeeId
    );
}
