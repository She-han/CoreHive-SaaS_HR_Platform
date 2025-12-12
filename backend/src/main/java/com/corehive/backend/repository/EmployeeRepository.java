package com.corehive.backend.repository;

import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Find employees by organization UUID
     */
    List<Employee> findByOrganizationUuid(String organizationUuid);

    /**
     * Find employees by organization UUID with pagination
     */
    Page<Employee> findByOrganizationUuid(String organizationUuid, Pageable pageable);

    /**
     * Find employee by app user ID
     */
    Optional<Employee> findByAppUserId(Long appUserId);

    /**
     * Find employee by employee code within organization
     */
    Optional<Employee> findByEmployeeCodeAndOrganizationUuid(String employeeCode, String organizationUuid);

    /**
     * Find employees by email within organization
     */
    Optional<Employee> findByEmailAndOrganizationUuid(String email, String organizationUuid);

    /**
     * Find HR staff members by joining with app_user table
     */
    @Query("SELECT e FROM Employee e " +
           "JOIN AppUser au ON e.appUserId = au.id " +
           "WHERE e.organizationUuid = :organizationUuid " +
           "AND au.role = 'HR_STAFF' " +
           "ORDER BY e.createdAt DESC")
    List<Employee> findHRStaffByOrganizationUuid(@Param("organizationUuid") String organizationUuid);

    /**
     * Find HR staff members with pagination
     */
    @Query("SELECT e FROM Employee e " +
           "JOIN AppUser au ON e.appUserId = au.id " +
           "WHERE e.organizationUuid = :organizationUuid " +
           "AND au.role = 'HR_STAFF' " +
           "ORDER BY e.createdAt DESC")
    Page<Employee> findHRStaffByOrganizationUuid(@Param("organizationUuid") String organizationUuid, Pageable pageable);

    /**
     * Count HR staff members in an organization
     */
    @Query("SELECT COUNT(e) FROM Employee e " +
           "JOIN AppUser au ON e.appUserId = au.id " +
           "WHERE e.organizationUuid = :organizationUuid " +
           "AND au.role = 'HR_STAFF'")
    Long countHRStaffByOrganizationUuid(@Param("organizationUuid") String organizationUuid);

    /**
     * Search HR staff members by name, email, or employee code
     */
    @Query("SELECT e FROM Employee e " +
           "JOIN AppUser au ON e.appUserId = au.id " +
           "WHERE e.organizationUuid = :organizationUuid " +
           "AND au.role = 'HR_STAFF' " +
           "AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY e.createdAt DESC")
    Page<Employee> searchHRStaff(@Param("organizationUuid") String organizationUuid, 
                                 @Param("searchTerm") String searchTerm, 
                                 Pageable pageable);

    /**
     * Find active HR staff members
     */
    @Query("SELECT e FROM Employee e " +
           "JOIN AppUser au ON e.appUserId = au.id " +
           "WHERE e.organizationUuid = :organizationUuid " +
           "AND au.role = 'HR_STAFF' " +
           "AND e.isActive = true " +
           "ORDER BY e.createdAt DESC")
    List<Employee> findActiveHRStaffByOrganizationUuid(@Param("organizationUuid") String organizationUuid);

    /**
     * Check if employee code exists in organization
     */
    boolean existsByEmployeeCodeAndOrganizationUuid(String employeeCode, String organizationUuid);

    /**
     * Check if email exists in organization
     */
    boolean existsByEmailAndOrganizationUuid(String email, String organizationUuid);

    /**
     * Find next employee code for organization
     */
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(e.employeeCode, 4) AS INTEGER)), 0) + 1 " +
           "FROM Employee e " +
           "WHERE e.organizationUuid = :organizationUuid " +
           "AND e.employeeCode LIKE 'EMP%' " +
           "AND LENGTH(e.employeeCode) > 3")
    Integer findNextEmployeeNumber(@Param("organizationUuid") String organizationUuid);

    List<Employee> findAllByorganizationUuidEquals(String orgUuid);
}
