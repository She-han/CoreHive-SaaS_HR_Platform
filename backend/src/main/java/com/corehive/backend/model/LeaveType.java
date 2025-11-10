package com.corehive.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_type")
public class leave_type {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_uuid", nullable = false)
    private String organizationUuid;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "default_days_per_year")
    private Integer defaultDaysPerYear = 0;

    @Column(name = "requires_approval")
    private Boolean requiresApproval = true;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
