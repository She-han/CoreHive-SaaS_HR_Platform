package com.corehive.backend.service;

import com.corehive.backend.dto.CreateQuestionRequest;
import com.corehive.backend.dto.CreateSurveyRequest;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.FeedbackSurveyQuestionRepository;
import com.corehive.backend.repository.FeedbackSurveyRepository;
import com.corehive.backend.repository.FeedbackSurveyResponseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class FeedbackSurveyService {

    private final FeedbackSurveyRepository surveyRepo;
    private final FeedbackSurveyQuestionRepository questionRepo;
    private final FeedbackSurveyResponseRepository responseRepo;


    //create survey
    @Transactional
    public FeedbackSurvey createSurvey(String orgUuid, CreateSurveyRequest req) {

        FeedbackSurvey survey = FeedbackSurvey.builder()
                .organizationUuid(orgUuid)
                .title(req.getTitle())
                .description(req.getDescription())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isAnonymous(req.getIsAnonymous())
//                .targetType(TargetType.valueOf(req.getTargetType()))
                .status(SurveyStatus.DRAFT)
                .createdBy(1L) //Temporary hardcoded value (for testing)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        List<FeedbackSurveyQuestion> questions = new ArrayList<>();
        int pos = 1;

        for (CreateQuestionRequest q : req.getQuestions()) {

            String optionsJson = null;

            if (q.getOptions() != null) {
                try {
                    optionsJson = new ObjectMapper().writeValueAsString(q.getOptions());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to convert options to JSON", e);
                }
            }

            FeedbackSurveyQuestion qEntity = FeedbackSurveyQuestion.builder()
                    .survey(survey)
                    .questionText(q.getQuestionText())
                    .questionType(QuestionType.valueOf(q.getQuestionType())) // FIXED
                    .options(optionsJson)
                    .position(pos++)
                    .createdAt(LocalDateTime.now())
                    .build();

            questions.add(qEntity);
        }

        survey.setQuestions(questions);

        return surveyRepo.save(survey);
    }


    //get all the surveys for this organization
    public List<FeedbackSurvey> listSurveys(String orgUuid) {

        return surveyRepo.findByOrganizationUuid(orgUuid);
    }

    //get one survey
    public FeedbackSurvey getSurvey(Long id) {
        return surveyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found"));
    }

    public List<FeedbackSurveyResponse> getResponses(Long surveyId) {
        return responseRepo.findBySurveyId(surveyId);
    }


    //delete a survey
    public void deleteSurvey(Long id) {
        try {
            if (!surveyRepo.existsById(id)) {
                throw new RuntimeException("Survey with ID " + id + " does not exist.");
            }

            surveyRepo.deleteById(id);

        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("Survey not found: " + id, e);

        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Survey cannot be deleted because it is linked to responses.", e);

        } catch (Exception e) {
            throw new RuntimeException("Failed to delete survey. Please try again.", e);
        }
    }

    //get all responses
    public List<FeedbackSurveyResponse> getAllResponsesForSurvey(Long surveyId) {
        try {
            // Validate survey
            FeedbackSurvey survey = surveyRepo.findById(surveyId)
                    .orElseThrow(() -> new RuntimeException("Survey not found with ID: " + surveyId));

            List<FeedbackSurveyResponse> responses = responseRepo.findResponsesWithAnswers(surveyId);

            if (responses.isEmpty()) {
                throw new RuntimeException("No responses submitted for survey ID: " + surveyId);
            }

            return responses;

        } catch (RuntimeException e) {
            throw new RuntimeException("Error retrieving responses: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error occurred while fetching responses.");
        }
    }


}
