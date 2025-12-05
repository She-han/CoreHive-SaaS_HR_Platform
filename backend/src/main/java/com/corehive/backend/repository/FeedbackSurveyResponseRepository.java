package com.corehive.backend.repository;

import com.corehive.backend.model.FeedbackSurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackSurveyResponseRepository
        extends JpaRepository<FeedbackSurveyResponse, Long> {

    List<FeedbackSurveyResponse> findBySurveyId(Long surveyId);
}

