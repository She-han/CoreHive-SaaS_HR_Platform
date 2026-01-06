package com.corehive.backend.repository;

import com.corehive.backend.model.Attendance;
import com.corehive.backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // ===== Single Employee Queries =====

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId = :employeeId " +
            "AND a.attendanceDate = :date AND a.checkInTime IS NOT NULL")
    Optional<Attendance> findTodayCheckIn(@Param("employeeId") Long employeeId,
                                          @Param("date") LocalDate date);

    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employeeId = :employeeId " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "ORDER BY a.attendanceDate DESC")
    List<Attendance> findByEmployeeAndDateRange(@Param("employeeId") Long employeeId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);

    // ===== Organization Queries =====

    List<Attendance> findByOrganizationUuidAndAttendanceDate(String organizationUuid, LocalDate date);

    /**
     * Get all attendance for organization on specific date, ordered by check-in time (newest first)
     */
    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee " +
            "WHERE a.organizationUuid = :orgUuid AND a.attendanceDate = :date " +
            "ORDER BY a.checkInTime DESC")
    List<Attendance> findByOrganizationUuidAndAttendanceDateOrderByCheckInTimeDesc(
            @Param("orgUuid") String orgUuid,
            @Param("date") LocalDate date
    );

    /**
     * Get employees who have checked in but NOT checked out (pending checkouts)
     */
    @Query("""
                SELECT a FROM Attendance a
                JOIN FETCH a.employee e
                WHERE a.organizationUuid = :orgUuid
                AND a.attendanceDate = :date
                AND a.checkInTime IS NOT NULL
                AND a.checkOutTime IS NULL
                AND a.status NOT IN ('ABSENT', 'ON_LEAVE')
                """)
    List<Attendance> findPendingCheckouts(
            @Param("orgUuid") String orgUuid,
            @Param("date") LocalDate date
    );


    @Query("SELECT a FROM Attendance a WHERE a.organizationUuid = :orgUuid " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "ORDER BY a.attendanceDate DESC, a.checkInTime DESC")
    List<Attendance> findByOrganizationAndDateRange(@Param("orgUuid") String orgUuid,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.organizationUuid = :orgUuid " +
            "AND a.attendanceDate = :date AND a.status = 'PRESENT'")
    Long countPresentByOrganizationAndDate(@Param("orgUuid") String orgUuid,
                                           @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.organizationUuid = :orgUuid " +
            "AND a.attendanceDate = :date AND a.status = 'LATE'")
    Long countLateByOrganizationAndDate(@Param("orgUuid") String orgUuid,
                                        @Param("date") LocalDate date);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a " +
            "WHERE a.organizationUuid = :orgUuid " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "GROUP BY a.status")
    List<Object[]> getAttendanceStatsByStatus(@Param("orgUuid") String orgUuid,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT a.verificationType, COUNT(a) FROM Attendance a " +
            "WHERE a.organizationUuid = :orgUuid " +
            "AND a.attendanceDate BETWEEN :startDate AND :endDate " +
            "GROUP BY a.verificationType")
    List<Object[]> getAttendanceStatsByVerificationType(@Param("orgUuid") String orgUuid,
                                                        @Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    List<Attendance> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    //GET ATTENDANCE BY DATE
    @Query("""
        SELECT a
        FROM Attendance a
        JOIN FETCH a.employee e
        WHERE a.organizationUuid = :orgUuid
          AND a.attendanceDate = :date
    """)
    List<Attendance> findByOrgAndDate(
            @Param("orgUuid") String orgUuid,
            @Param("date") LocalDate date
    );

    //Get summary from attendance by status with count
    @Query("""
        SELECT a.status, COUNT(a)
        FROM Attendance a
        WHERE a.organizationUuid = :orgUuid
          AND a.attendanceDate = :date
        GROUP BY a.status
    """)
    List<Object[]> countByStatus(
            @Param("orgUuid") String orgUuid,
            @Param("date") LocalDate date
    );


    //Get today on-leave employees count
    int countByOrganizationUuidAndAttendanceDateAndStatus(
            String organizationUuid,
            LocalDate attendanceDate,
            Attendance.AttendanceStatus status
    );

    //Get monthly attendance stats
    @Query("""
    SELECT a.status, COUNT(a.id)
    FROM Attendance a
    WHERE a.organizationUuid = :orgUuid
      AND MONTH(a.attendanceDate) = :month
      AND YEAR(a.attendanceDate) = :year
    GROUP BY a.status
""")
    List<Object[]> monthlyAttendanceStats(
            String orgUuid, int month, int year);


}