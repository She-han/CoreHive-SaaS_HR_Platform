package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feedback_survey_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeedbackSurveyQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → survey
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_id")
    @JsonBackReference
    private FeedbackSurvey survey;

    private String questionText;

    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @Column(columnDefinition = "json")
    private String options;

    private Integer position;

    private LocalDateTime createdAt;

    // Prevent infinite recursion
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<FeedbackSurveyAnswer> answers;
}
