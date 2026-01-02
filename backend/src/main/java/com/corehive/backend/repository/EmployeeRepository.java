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
    @Query(
            value = """
                        SELECT COALESCE(
                            MAX(CAST(SUBSTRING(employee_code, 5) AS UNSIGNED)),
                            0
                        ) + 1
                        FROM employee
                        WHERE organization_uuid = :organizationUuid
                          AND employee_code LIKE 'EMP-%'
                    """,
            nativeQuery = true
    )
    Integer findNextEmployeeNumber(@Param("organizationUuid") String organizationUuid);


    List<Employee> findAllByorganizationUuidEquals(String orgUuid);

    Optional<Employee> findByIdAndOrganizationUuid(Long id, String orgUuid);


    /**
     * Fetch employees by organization UUID WITH their department details.
     */
    @Query(
            value = """
                        SELECT e FROM Employee e
                        LEFT JOIN FETCH e.department
                        WHERE e.organizationUuid = :orgUuid
                    """,
            countQuery = """
                        SELECT COUNT(e) FROM Employee e
                        WHERE e.organizationUuid = :orgUuid
                    """
    )
    Page<Employee> findByOrganizationUuidWithDepartment(
            @Param("orgUuid") String orgUuid,
            Pageable pageable
    );


    /**
     * Fetch an employees by organization UUID and userId WITH their department details.
     */

    @Query("""
                SELECT e FROM Employee e
                LEFT JOIN FETCH e.department
                WHERE e.id = :id AND e.organizationUuid = :orgUuid
            """)
    Optional<Employee> findByIdAndOrganizationUuidWithDepartment(
            @Param("id") Long id,
            @Param("orgUuid") String orgUuid
    );


    List<Employee> findByOrganizationUuidAndIsActiveTrue(String orgUuid);

    int countByOrganizationUuid(String organizationUuid);

    int countByOrganizationUuidAndIsActive(String organizationUuid, boolean b);

    //Total Active employees
    long countByOrganizationUuidAndIsActiveTrue(String orgUuid);

    // Department-wise count
    @Query("""
                SELECT d.name, COUNT(e.id)
                FROM Employee e
                JOIN Department d ON e.departmentId = d.id
                WHERE e.organizationUuid = :orgUuid
                  AND e.isActive = true
                GROUP BY d.name
            """)
    List<Object[]> countByDepartment(@Param("orgUuid") String orgUuid);

    // Designation-wise count
    @Query("""
                SELECT e.designation, COUNT(e.id)
                FROM Employee e
                WHERE e.organizationUuid = :orgUuid
                  AND e.isActive = true
                GROUP BY e.designation
            """)
    List<Object[]> countByDesignation(String orgUuid);

    //Count new-hires for specific month
    @Query("""
        SELECT COUNT(e.id)
        FROM Employee e
        WHERE e.organizationUuid = :orgUuid
          AND e.isActive = true
          AND MONTH(e.dateOfJoining) = :month
          AND YEAR(e.dateOfJoining) = :year
    """)
    long countNewHires(
            @Param("orgUuid") String orgUuid,
            @Param("month") int month,
            @Param("year") int year
    );

    //Cont new-hires for specific year
    @Query("""
    SELECT MONTH(e.dateOfJoining), COUNT(e.id)
    FROM Employee e
    WHERE e.organizationUuid = :orgUuid
      AND YEAR(e.dateOfJoining) = :year
    GROUP BY MONTH(e.dateOfJoining)
""")
    List<Object[]> yearlyEmployeeGrowth(String orgUuid, int year);

}