package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Extended Module Entity
 * Represents additional modules that organizations can subscribe to
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "extended_modules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtendedModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "module_id")
    private Long moduleId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "module_key", unique = true, length = 100)
    private String moduleKey; // e.g., "moduleQrAttendanceMarking"

    @Column(name = "icon", length = 50)
    private String icon; // Icon name for UI

    @Column(name = "category", length = 50)
    private String category; // e.g., "Attendance", "HR", "Performance"

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Business methods
    public boolean isAvailable() {
        return Boolean.TRUE.equals(this.isActive);
    }

    public String getDisplayName() {
        // Convert camelCase or snake_case to Display Name
        if (name != null) {
            return name.replaceAll("([a-z])([A-Z])", "$1 $2")
                      .replaceAll("_", " ")
                      .trim();
        }
        return "";
    }
}
