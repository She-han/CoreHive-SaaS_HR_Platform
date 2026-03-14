package com.corehive.backend.repository;

import com.corehive.backend.model.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    
    List<Payslip> findByOrganizationUuid(String organizationUuid);
    
    List<Payslip> findByOrganizationUuidAndMonthAndYear(String organizationUuid, Integer month, Integer year);
    
    List<Payslip> findByOrganizationUuidAndEmployeeId(String organizationUuid, Long employeeId);
    
    List<Payslip> findByOrganizationUuidAndEmployeeIdAndStatus(
        String organizationUuid, Long employeeId, Payslip.PayslipStatus status
    );

    void deleteByOrganizationUuidAndEmployeeId(String organizationUuid, Long employeeId);
    
    Optional<Payslip> findByOrganizationUuidAndEmployeeIdAndMonthAndYear(
        String organizationUuid, Long employeeId, Integer month, Integer year
    );
    
    @Query("""
        SELECT p FROM Payslip p 
        WHERE p.organizationUuid = :orgUuid 
        AND p.month = :month 
        AND p.year = :year 
        AND p.departmentName = :departmentName
    """)
    List<Payslip> findByOrganizationAndMonthYearAndDepartment(
        @Param("orgUuid") String orgUuid,
        @Param("month") Integer month,
        @Param("year") Integer year,
        @Param("departmentName") String departmentName
    );
    
    @Query("""
        SELECT p FROM Payslip p 
        WHERE p.organizationUuid = :orgUuid 
        AND p.month = :month 
        AND p.year = :year 
        AND p.designation = :designation
    """)
    List<Payslip> findByOrganizationAndMonthYearAndDesignation(
        @Param("orgUuid") String orgUuid,
        @Param("month") Integer month,
        @Param("year") Integer year,
        @Param("designation") String designation
    );
    
    @Query("""
        SELECT p FROM Payslip p 
        WHERE p.organizationUuid = :orgUuid 
        AND p.month = :month 
        AND p.year = :year 
        AND p.status = 'GENERATED'
    """)
    List<Payslip> findGeneratedPayslipsForMonthYear(
        @Param("orgUuid") String orgUuid,
        @Param("month") Integer month,
        @Param("year") Integer year
    );
}
