package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * SystemUser Entity - Platform level administrators
 * මේ users ට platform level access තියෙනවා, specific organization එකකට bound වෙන්නේ නෑ
 */
@Entity
@Table(name = "system_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 200)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String role = "SYS_ADMIN";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Business methods
    public boolean isSysAdmin() {
        return "SYS_ADMIN".equals(this.role);
    }

    public boolean canManageOrganizations() {
        return isSysAdmin() && Boolean.TRUE.equals(isActive);
    }
}