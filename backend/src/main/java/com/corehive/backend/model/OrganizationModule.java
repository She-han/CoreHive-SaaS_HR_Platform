package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Organization Module Entity
 * Links organizations with their subscribed extended modules
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "organization_modules", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "module_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    private ExtendedModule extendedModule;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Column(name = "subscribed_at")
    private LocalDateTime subscribedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // For subscription management

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isActive() {
        return Boolean.TRUE.equals(this.isEnabled) && 
               (this.expiresAt == null || this.expiresAt.isAfter(LocalDateTime.now()));
    }

    public String getModuleName() {
        return extendedModule != null ? extendedModule.getName() : null;
    }

    public String getModuleKey() {
        return extendedModule != null ? extendedModule.getModuleKey() : null;
    }

    @PrePersist
    public void prePersist() {
        if (this.subscribedAt == null) {
            this.subscribedAt = LocalDateTime.now();
        }
    }
}
