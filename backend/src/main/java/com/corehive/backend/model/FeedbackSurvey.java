package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feedback_survey")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeedbackSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK linking to organization table
    @Column(name = "organization_uuid", nullable = false , length=36)
    private String organizationUuid;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SurveyStatus status;

    private Boolean isAnonymous;

//    @Enumerated(EnumType.STRING)
//    private TargetType targetType;

    @Column(columnDefinition = "json")
    private String departmentIds;

    private Long createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Connect survey → questions
    @OneToMany(mappedBy = "survey", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<FeedbackSurveyQuestion> questions;
}

