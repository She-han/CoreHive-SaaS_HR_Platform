package com.corehive.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * AppUser Entity - Organization level users
 *  These App users bond specific organization (each have organization uuid) 
 */
@Entity
@Table(name = "app_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_uuid", nullable = false, length = 36)
    private String organizationUuid;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AppUserRole role;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "linked_employee_id")
    private Long linkedEmployeeId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_uuid", referencedColumnName = "organization_uuid", insertable = false, updatable = false)
    private Organization organization;

    // Business methods
    public boolean isOrgAdmin() {
        return AppUserRole.ORG_ADMIN.equals(this.role);
    }

    public boolean isHrStaff() {
        return AppUserRole.HR_STAFF.equals(this.role);
    }

    public boolean isEmployee() {
        return AppUserRole.EMPLOYEE.equals(this.role);
    }

    public boolean canAccessPayroll() {
        return isOrgAdmin(); // Only ORG_ADMIN can access payroll
    }

    public boolean canManageUsers() {
        return isOrgAdmin(); // Only ORG_ADMIN can manage users
    }
}

/**
 * AppUser Role Enum
 * Organization level user roles
 */
