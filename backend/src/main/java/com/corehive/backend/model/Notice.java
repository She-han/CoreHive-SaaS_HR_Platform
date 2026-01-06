package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "hr_notice",
        indexes = {
                @Index(name = "idx_notice_org", columnList = "organization_uuid"),
                @Index(name = "idx_notice_status", columnList = "status"),
                @Index(name = "idx_notice_publish", columnList = "publish_at")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* =========================
       ORGANIZATION
       ========================= */
    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    /* =========================
       NOTICE CONTENT
       ========================= */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /* =========================
       PRIORITY
       ========================= */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "priority",
            nullable = false,
            columnDefinition = "ENUM('LOW','NORMAL','HIGH') DEFAULT 'NORMAL'"
    )
    private Priority priority = Priority.NORMAL;

    /* =========================
       PUBLISH / EXPIRY
       ========================= */
    @Column(name = "publish_at", nullable = false)
    private LocalDateTime publishAt;

    @Column(name = "expire_at")
    private LocalDateTime expireAt;

    /* =========================
       STATUS
       ========================= */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            columnDefinition = "ENUM('DRAFT','PUBLISHED','EXPIRED') DEFAULT 'DRAFT'"
    )
    private Status status = Status.DRAFT;

    /* =========================
       CREATED BY (HR STAFF)
       ========================= */
    @Column(name = "created_by", nullable = false)
    private Long createdBy;


    /* =========================
       AUDIT
       ========================= */
    @Column(
            name = "created_at",
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    )
    private LocalDateTime updatedAt;

    /* =========================
       ENUMS
       ========================= */
    public enum Priority {
        LOW,
        NORMAL,
        HIGH
    }

    public enum Status {
        DRAFT,
        PUBLISHED,
        EXPIRED
    }
}
