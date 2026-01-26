package com.corehive.backend.repository;

import com.corehive.backend.model.AttendanceConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceConfigurationRepository extends JpaRepository<AttendanceConfiguration, Long> {
    
    List<AttendanceConfiguration> findByOrganizationUuidAndIsActiveTrue(String organizationUuid);
    
    List<AttendanceConfiguration> findByOrganizationUuid(String organizationUuid);
    
    @Query("SELECT ac FROM AttendanceConfiguration ac WHERE ac.organizationUuid = :orgUuid AND ac.isActive = true AND " +
           "((ac.applicationType = 'ALL_EMPLOYEES') OR " +
           "(ac.applicationType = 'DEPARTMENT_WISE' AND ac.departmentId = :deptId) OR " +
           "(ac.applicationType = 'DESIGNATION_WISE' AND ac.designation = :designation) OR " +
           "(ac.applicationType = 'EMPLOYEE_SPECIFIC' AND ac.employeeId = :empId)) " +
           "ORDER BY CASE ac.applicationType " +
           "WHEN 'EMPLOYEE_SPECIFIC' THEN 1 " +
           "WHEN 'DESIGNATION_WISE' THEN 2 " +
           "WHEN 'DEPARTMENT_WISE' THEN 3 " +
           "WHEN 'ALL_EMPLOYEES' THEN 4 END")
    List<AttendanceConfiguration> findApplicableConfigurations(
            @Param("orgUuid") String organizationUuid,
            @Param("empId") Long employeeId,
            @Param("deptId") Long departmentId,
            @Param("designation") String designation);
    
    Optional<AttendanceConfiguration> findByOrganizationUuidAndApplicationTypeAndIsActiveTrue(
            String organizationUuid, AttendanceConfiguration.ApplicationType applicationType);
}
