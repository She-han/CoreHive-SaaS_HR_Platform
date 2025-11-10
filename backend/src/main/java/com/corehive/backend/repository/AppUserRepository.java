package com.corehive.backend.repository;

import com.corehive.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * AppUser Repository
 * Organization users database access සඳහා
 */
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    /**
     * Email address එකෙන් app user find කරන්න
     * Login වෙලාවේ use වෙනවා
     */
    Optional<AppUser> findByEmail(String email);

    /**
     * Organization UUID සහ email එකෙන් find කරන්න
     * Multi-tenant environment එකේ specific user find කරන්න
     */
    Optional<AppUser> findByOrganizationUuidAndEmail(String organizationUuid, String email);

    /**
     * Organization එකේ සියලු users
     * User management සඳහා
     */
    List<AppUser> findByOrganizationUuid(String organizationUuid);

    /**
     * Organization එකේ specific role එකේ users
     * Role-based filtering සඳහා
     */
    @Query("SELECT u FROM AppUser u WHERE u.organizationUuid = :orgUuid AND u.role = :role")
    List<AppUser> findByOrganizationUuidAndRole(@Param("orgUuid") String organizationUuid, @Param("role") String role);

    /**
     * Organization එකේ active users count
     */
    long countByOrganizationUuidAndIsActiveTrue(String organizationUuid);

    /**
     * Email already exists in organization
     */
    boolean existsByOrganizationUuidAndEmail(String organizationUuid, String email);
}