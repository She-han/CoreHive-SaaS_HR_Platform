package com.corehive.backend.repository;

import com.corehive.backend.model.FeedbackSurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FeedbackSurveyResponseRepository
        extends JpaRepository<FeedbackSurveyResponse, Long> {

    // Simple version (works but may cause N+1 queries)
    List<FeedbackSurveyResponse> findBySurveyId(Long surveyId);

    // Optimized version with JOIN FETCH (loads answers in one query)
    @Query("SELECT r FROM FeedbackSurveyResponse r LEFT JOIN FETCH r.answers WHERE r.survey.id = :surveyId")
    List<FeedbackSurveyResponse> findResponsesWithAnswers(Long surveyId);
}

