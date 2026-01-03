package com.corehive.backend.service;

import com.corehive.backend.dto.*;
import com.corehive.backend.exception.feedbackSurveyException.*;
import com.corehive.backend.model.*;
import com.corehive.backend.repository.FeedbackSurveyQuestionRepository;
import com.corehive.backend.repository.FeedbackSurveyRepository;
import com.corehive.backend.repository.FeedbackSurveyResponseRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * SERVICE: FEEDBACK SURVEYS
 * --------------------------
 * Handles CRUD operations and fetching responses.
 */
@Service
@RequiredArgsConstructor
public class FeedbackSurveyService {

    private final FeedbackSurveyRepository surveyRepo;
    private final FeedbackSurveyQuestionRepository questionRepo;
    private final FeedbackSurveyResponseRepository responseRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ============================================================
    // CREATE A NEW SURVEY
    // ============================================================
    @Transactional
    public FeedbackSurvey createSurvey(String orgUuid, CreateSurveyRequest req) {

        if (req.getTitle() == null || req.getTitle().isEmpty()) {
            throw new InvalidSurveyRequestException("Survey title cannot be empty");
        }

        FeedbackSurvey survey = FeedbackSurvey.builder()
                .organizationUuid(orgUuid)
                .title(req.getTitle())
                .description(req.getDescription())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .isAnonymous(req.getIsAnonymous())
                .status(SurveyStatus.DRAFT)
                .createdBy(1L) // TODO: replace with actual logged-in user
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        List<FeedbackSurveyQuestion> questions = new ArrayList<>();
        int pos = 1;

        for (CreateQuestionRequest q : req.getQuestions()) {
            String optionsJson = null;
            try {
                if (q.getOptions() != null) optionsJson = objectMapper.writeValueAsString(q.getOptions());
            } catch (JsonProcessingException e) {
                throw new InvalidSurveyRequestException("Failed to convert question options to JSON");
            }

            FeedbackSurveyQuestion qEntity = FeedbackSurveyQuestion.builder()
                    .survey(survey)
                    .questionText(q.getQuestionText())
                    .questionType(QuestionType.valueOf(q.getQuestionType()))
                    .options(optionsJson)
                    .position(pos++)
                    .createdAt(LocalDateTime.now())
                    .build();

            questions.add(qEntity);
        }

        survey.setQuestions(questions);
        return surveyRepo.save(survey);
    }

    // ============================================================
    // GET ALL SURVEYS FOR AN ORGANIZATION
    // ============================================================
    public List<FeedbackSurvey> listSurveys(String orgUuid) {
        return surveyRepo.findByOrganizationUuid(orgUuid);
    }

    // ============================================================
    // GET SINGLE SURVEY BY ID
    // ============================================================
    public FeedbackSurvey getSurvey(Long id) {
        return surveyRepo.findById(id)
                .orElseThrow(() -> new SurveyNotFoundException("Survey not found with ID: " + id));
    }

    // ============================================================
    // DELETE SURVEY
    // ============================================================
    public void deleteSurvey(Long id) {
        try {
            if (!surveyRepo.existsById(id)) {
                throw new SurveyNotFoundException("Survey with ID " + id + " does not exist");
            }
            surveyRepo.deleteById(id);

        } catch (EmptyResultDataAccessException e) {
            throw new SurveyNotFoundException("Survey not found: " + id);

        } catch (DataIntegrityViolationException e) {
            throw new SurveyDeletionException("Survey cannot be deleted because it has responses linked");

        } catch (Exception e) {
            throw new SurveyDeletionException("Failed to delete survey: " + e.getMessage());
        }
    }

    // ============================================================
    // GET RESPONSES FOR SURVEY
    // ============================================================
    public List<FeedbackSurveyResponse> getResponses(Long surveyId) {
        getSurvey(surveyId); // validate survey exists
        List<FeedbackSurveyResponse> responses = responseRepo.findBySurveyId(surveyId);
        if (responses.isEmpty()) {
            throw new SurveyResponseNotFoundException("No responses submitted for survey ID: " + surveyId);
        }
        return responses;
    }

    // ============================================================
    // GET ALL RESPONSES (DETAILED)
    // ============================================================
    public List<FeedbackSurveyResponse> getAllResponsesForSurvey(Long surveyId) {
        getSurvey(surveyId);
        List<FeedbackSurveyResponse> responses = responseRepo.findResponsesWithAnswers(surveyId);
        if (responses.isEmpty()) {
            throw new SurveyResponseNotFoundException("No responses found for survey ID: " + surveyId);
        }
        return responses;
    }

    // ============================================================
    // GET DETAILED RESPONSE PER QUESTION
    // ============================================================
    public List<FeedbackSurveyResponseDTO> getResponseDetails(Long surveyId) {
        getSurvey(surveyId);

        List<Object[]> rows = responseRepo.fetchSurveyResponsesWithQuestions(surveyId);
        if (rows == null || rows.isEmpty()) {
            throw new SurveyResponseNotFoundException("No detailed responses found for survey ID: " + surveyId);
        }

        Map<Long, FeedbackSurveyResponseDTO> grouped = new LinkedHashMap<>();
        for (Object[] row : rows) {
            Long responseId = (Long) row[0];
            FeedbackSurveyResponseDTO dto = grouped.computeIfAbsent(responseId, id -> {
                FeedbackSurveyResponseDTO r = new FeedbackSurveyResponseDTO();
                r.setResponseId(responseId);
                r.setEmployeeId((Long) row[1]);
                r.setSubmittedAt((LocalDateTime) row[2]);
                r.setAnswers(new ArrayList<>());
                return r;
            });

            FeedbackSurveyResponseDTO.AnswerDTO ans = new FeedbackSurveyResponseDTO.AnswerDTO();
            ans.setQuestionId((Long) row[3]);
            ans.setQuestionText((String) row[4]);
            ans.setQuestionType(row[5] != null ? row[5].toString() : "UNKNOWN");
            ans.setAnswerText((String) row[6]);
            ans.setSelectedOption((String) row[7]);

            dto.getAnswers().add(ans);
        }

        return new ArrayList<>(grouped.values());
    }

    // ============================================================
    // GET QUESTIONS FOR SURVEY
    // ============================================================
    public List<FeedbackSurveyQuestion> getSurveyQuestions(Long surveyId) {
        FeedbackSurvey survey = getSurvey(surveyId);
        return survey.getQuestions();
    }

    // ============================================================
    // UPDATE SURVEY QUESTIONS
    // ============================================================
    @Transactional
    public FeedbackSurvey updateSurveyQuestions(Long surveyId, UpdateSurveyDTO dto) {

        FeedbackSurvey survey = getSurvey(surveyId);

        List<FeedbackSurveyQuestion> existingQuestions = survey.getQuestions();
        existingQuestions.clear(); // orphanRemoval deletes old questions

        int pos = 1;
        for (UpdateQuestionDTO q : dto.getQuestions()) {
            String optionsJson = null;
            try {
                if (q.getOptions() != null) optionsJson = objectMapper.writeValueAsString(q.getOptions());
            } catch (JsonProcessingException e) {
                throw new InvalidSurveyRequestException("Failed to convert question options to JSON");
            }

            FeedbackSurveyQuestion question = FeedbackSurveyQuestion.builder()
                    .id(q.getId()) // update if ID exists
                    .survey(survey)
                    .questionText(q.getQuestionText())
                    .questionType(QuestionType.valueOf(q.getQuestionType()))
                    .options(optionsJson)
                    .position(pos++)
                    .createdAt(LocalDateTime.now())
                    .build();

            existingQuestions.add(question);
        }

        return surveyRepo.save(survey);
    }
}
