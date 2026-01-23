package com.corehive.backend.repository;

import com.corehive.backend.model.Deduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeductionRepository extends JpaRepository<Deduction, Long> {
    
    List<Deduction> findByOrganizationUuidAndIsActiveTrue(String organizationUuid);
    
    List<Deduction> findByOrganizationUuidAndDepartmentIdAndIsActiveTrue(String organizationUuid, Long departmentId);
    
    List<Deduction> findByOrganizationUuidAndDesignationAndIsActiveTrue(String organizationUuid, String designation);
    
    List<Deduction> findByOrganizationUuidAndEmployeeIdAndIsActiveTrue(String organizationUuid, Long employeeId);
    
    @Query("""
        SELECT d FROM Deduction d 
        WHERE d.organizationUuid = :orgUuid 
        AND d.isActive = true
        AND (
            d.deductionType = 'ALL_EMPLOYEES' 
            OR (d.deductionType = 'DEPARTMENT_WISE' AND d.departmentId = :departmentId)
            OR (d.deductionType = 'DESIGNATION_WISE' AND d.designation = :designation)
            OR (d.deductionType = 'EMPLOYEE_SPECIFIC' AND d.employeeId = :employeeId)
        )
    """)
    List<Deduction> findApplicableDeductions(
        @Param("orgUuid") String orgUuid,
        @Param("departmentId") Long departmentId,
        @Param("designation") String designation,
        @Param("employeeId") Long employeeId
    );
}
