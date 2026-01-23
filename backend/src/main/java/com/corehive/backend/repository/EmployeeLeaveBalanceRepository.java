package com.corehive.backend.repository;

import com.corehive.backend.model.EmployeeLeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeLeaveBalanceRepository extends JpaRepository<EmployeeLeaveBalance, Long> {
    
    List<EmployeeLeaveBalance> findByEmployeeIdAndOrganizationUuid(Long employeeId, String organizationUuid);
    
    List<EmployeeLeaveBalance> findByOrganizationUuid(String organizationUuid);
    
    Optional<EmployeeLeaveBalance> findByEmployeeIdAndLeaveTypeIdAndOrganizationUuid(
            Long employeeId, Long leaveTypeId, String organizationUuid);
    
    void deleteByEmployeeIdAndOrganizationUuid(Long employeeId, String organizationUuid);
}
