package com.corehive.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "feedback_survey_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeedbackSurveyAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id")
    @JsonBackReference
    private FeedbackSurveyResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonIgnore
    private FeedbackSurveyQuestion question;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private String selectedOption;
}
