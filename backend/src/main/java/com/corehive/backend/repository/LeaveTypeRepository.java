package com.corehive.backend.repository;

import com.corehive.backend.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveTypeRepository extends JpaRepository<LeaveType , Long> {
    List<LeaveType> findByOrganizationUuidAndIsActiveTrue(String orgUuid);
}
