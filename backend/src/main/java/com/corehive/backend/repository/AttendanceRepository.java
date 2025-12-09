package com.corehive.backend.repository;

import com.corehive.backend.model.Attendance;
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
    @Query("SELECT a FROM Attendance a LEFT JOIN FETCH a.employee " +
            "WHERE a.organizationUuid = :orgUuid " +
            "AND a.attendanceDate = :date " +
            "AND a.checkInTime IS NOT NULL " +
            "AND a.checkOutTime IS NULL " +
            "ORDER BY a.checkInTime ASC")
    List<Attendance> findPendingCheckouts(@Param("orgUuid") String orgUuid,
                                          @Param("date") LocalDate date);

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
}