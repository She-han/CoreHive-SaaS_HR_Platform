package com.corehive.backend.repository;

import com.corehive.backend.model.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {

    /**
     * Find designations by organization UUID
     */
    List<Designation> findByOrganizationUuid(String organizationUuid);

    /**
     * Find designation by organization UUID and name
     */
    Optional<Designation> findByOrganizationUuidAndName(String organizationUuid, String name);

    /**
     * Check if designation exists in organization
     */
    boolean existsByIdAndOrganizationUuid(Long id, String organizationUuid);
}