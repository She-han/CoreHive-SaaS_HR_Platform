package com.corehive.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

@Entity
@Data
public class AuditActivities{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;
    private String userEmail;
    private String role;
    private String action;
    private String resource;
    private String details;
    private String severity; // Info, Warning, Critical, Success
    private String ip;



}
