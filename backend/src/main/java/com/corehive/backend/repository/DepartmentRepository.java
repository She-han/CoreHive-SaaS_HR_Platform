package com.corehive.backend.repository;

import com.corehive.backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    /**
     * Find departments by organization UUID
     */
    List<Department> findByOrganizationUuid(String organizationUuid);

    /**
     * Find department by organization UUID and name
     */
    Optional<Department> findByOrganizationUuidAndName(String organizationUuid, String name);

    /**
     * Check if department exists in organization
     */
    boolean existsByIdAndOrganizationUuid(Long id, String organizationUuid);

    /**
     * Find active departments by organization
     */
    List<Department> findByOrganizationUuidAndIsActiveTrue(String organizationUuid);
}

