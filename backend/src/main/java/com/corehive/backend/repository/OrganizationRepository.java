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
 * Organizations database access සඳහා
 */
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    /**
     * Organization UUID එකෙන් find කරන්න
     * Multi-tenant operations සඳහා
     */
    Optional<Organization> findByOrganizationUuid(String organizationUuid);

    /**
     * Email address එකෙන් organization find කරන්න
     * Registration time duplicate check සඳහා
     */
    Optional<Organization> findByEmail(String email);

    /**
     * Status අනුව organizations filter කරන්න
     * System admin dashboard සඳහා
     */
    Page<Organization> findByStatus(String status, Pageable pageable);

    /**
     * Pending approval organizations list
     * System admin approval queue සඳහා
     */
    @Query("SELECT o FROM Organization o WHERE o.status = 'PENDING_APPROVAL' ORDER BY o.createdAt ASC")
    List<Organization> findPendingApprovals();

    /**
     * Status එක අනුව count
     * Dashboard statistics සඳහා
     */
    long countByStatus(String status);

    /**
     * Email already registered ද check කරන්න
     */
    boolean existsByEmail(String email);

    /**
     * Business Registration Number duplicate ද check කරන්න
     */
    boolean existsByBusinessRegistrationNumber(String brNumber);
}