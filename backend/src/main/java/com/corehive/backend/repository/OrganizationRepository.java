package com.corehive.backend.repository;

import com.corehive.backend.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Organization Repository
 * Organizations database access 
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    /**
     * find by Organization UUID   
     * Multi-tenant operations 
     */
    Optional<Organization> findByOrganizationUuid(String organizationUuid);

    /**
     * Organization find by Email address   
     * Registration time duplicate check 
     */
    Optional<Organization> findByEmail(String email);

    /**
     * Organizations filter according to status 
     * System admin dashboard 
     */
    Page<Organization> findByStatus(String status, Pageable pageable);

    /**
     * Pending approval organizations list
     * System admin approval queue 
     */
    @Query("SELECT o FROM Organization o WHERE o.status = 'PENDING_APPROVAL' ORDER BY o.createdAt ASC")
    List<Organization> findPendingApprovals();

    /**
     * Count by status
     * Dashboard statistics 
     */
    long countByStatus(String status);

    /**
     * Email already registered or not checking 
     */
    boolean existsByEmail(String email);

    /**
     * Business Registration Number duplicate checking
     */
    boolean existsByBusinessRegistrationNumber(String brNumber);
}