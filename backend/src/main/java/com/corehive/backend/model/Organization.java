package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "organization")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_uuid", unique = true, nullable = false, length = 36)
    private String organizationUuid;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(name = "business_registration_number", length = 100)
    private String businessRegistrationNumber;

    @Column(name = "business_registration_document", length = 500)
    private String businessRegistrationDocument;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizationStatus status = OrganizationStatus.PENDING_APPROVAL;

    @Column(name = "employee_count_range", nullable = false, length = 50)
    private String employeeCountRange;

    @Column(name = "plan", length = 50)
    private String plan = "Starter";

    // Module flags
    @Column(name = "module_qr_attendance_marking")
    private Boolean moduleQrAttendanceMarking = false;

    @Column(name = "module_face_recognition_attendance_marking")
    private Boolean moduleFaceRecognitionAttendanceMarking = false;

    @Column(name = "module_employee_feedback")
    private Boolean moduleEmployeeFeedback = false;

    @Column(name = "module_hiring_management")
    private Boolean moduleHiringManagement = false;

    @Column(name = "modules_configured")
    private Boolean modulesConfigured = false;

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "organization", fetch = FetchType.LAZY)
    private List<AppUser> users;

    // Business methods
    public boolean hasModule(String moduleName) {
        switch (moduleName.toLowerCase()) {
            case "feedback":
                return Boolean.TRUE.equals(moduleEmployeeFeedback);
            case "hiring":
                return Boolean.TRUE.equals(moduleHiringManagement);
            case "qr_attendance":
                return Boolean.TRUE.equals(moduleQrAttendanceMarking);
            case "face_recognition_attendance":
                return Boolean.TRUE.equals(moduleFaceRecognitionAttendanceMarking);
            default:
                return false;
        }
    }

    public boolean isActive() {
        return OrganizationStatus.ACTIVE.equals(this.status);
    }

    // Check if organization is pending approval
    public boolean isPendingApproval() {
        return OrganizationStatus.PENDING_APPROVAL.equals(this.status);
    }

    // Get status as string (safe method)
    public String getStatusString() {
        return this.status != null ? this.status.name() : null;
    }

    @PrePersist
    public void generateUuid() {
        if (this.organizationUuid == null) {
            this.organizationUuid = UUID.randomUUID().toString();
        }
    }
}