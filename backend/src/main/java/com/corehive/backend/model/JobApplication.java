package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_application")
@Data
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobId;
    private String fullName;
    private String email;
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    private LocalDateTime appliedAt = LocalDateTime.now();
}

