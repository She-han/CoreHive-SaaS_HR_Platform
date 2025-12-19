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

    @Query("""
    SELECT r.id AS responseId, r.employeeId AS employeeId, r.submittedAt AS submittedAt,
           q.id AS questionId, q.questionText AS questionText, q.questionType AS questionType,
           a.answerText AS answerText, a.selectedOption AS selectedOption
    FROM FeedbackSurveyResponse r
    JOIN FeedbackSurveyAnswer a ON r.id = a.response.id
    JOIN FeedbackSurveyQuestion q ON a.question.id = q.id
    WHERE r.survey.id = :surveyId
    ORDER BY r.employeeId, q.position
""")
    List<Object[]> fetchSurveyResponsesWithQuestions(Long surveyId);

}

