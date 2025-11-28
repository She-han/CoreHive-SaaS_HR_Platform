package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String organizationUuid;

    private Long employeeId;

    private LocalDate attendanceDate;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Double totalHours;

    private Integer lateMinutes;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    public enum Status {
        PRESENT, ABSENT, LEAVE, HOLIDAY
    }
}
