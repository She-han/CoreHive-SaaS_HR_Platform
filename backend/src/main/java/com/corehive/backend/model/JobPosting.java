package com.corehive.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_posting")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    @Column(nullable = false, length = 200)
    private String title;

//    @Column(name = "avatar_url" , length = 1000)
//    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20, nullable = false)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status = Status.DRAFT;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @Column(name = "posted_by")
    private Long postedBy;

    @Column(name = "available_vacancies")
    private Integer availableVacancies = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // ===== ENUMS =====
    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERN
    }

    public enum Status {
        DRAFT, OPEN, CLOSED
    }
}
