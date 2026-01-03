package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "attendance", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"employee_id", "attendance_date" , "organization_uuid"})
       },
       indexes = {
           @Index(name = "idx_attendance_org_date", columnList = "organization_uuid, attendance_date"),
           @Index(name = "idx_attendance_employee", columnList = "employee_id"),
           @Index(name = "idx_attendance_date", columnList = "attendance_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", insertable = false, updatable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_uuid", referencedColumnName = "organization_uuid", insertable = false, updatable = false)
    private Organization organization;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AttendanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_type", length = 30)
    private VerificationType verificationType;

    @Column(name = "verification_confidence", length = 50)
    private String verificationConfidence;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== Enums =====
    
    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE,
        HALF_DAY,
        ON_LEAVE,
        WORK_FROM_HOME
    }

    public enum VerificationType {
        MANUAL,
        FACE_RECOGNITION,
        BIOMETRIC,
        QR_CODE,
        GPS
    }

    // ===== Helper Methods =====

    public String getEmployeeFullName() {
        if (employee != null) {
            return employee.getFirstName() + " " + employee.getLastName();
        }
        return null;
    }

    public boolean isCheckedIn() {
        return checkInTime != null;
    }

    public boolean isCheckedOut() {
        return checkOutTime != null;
    }

    public boolean isComplete() {
        return checkInTime != null && checkOutTime != null;
    }
}