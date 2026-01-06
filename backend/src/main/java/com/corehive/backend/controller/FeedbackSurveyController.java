package com.corehive.backend.controller;

import com.corehive.backend.dto.CreateSurveyRequest;
import com.corehive.backend.dto.UpdateSurveyDTO;
import com.corehive.backend.model.FeedbackSurvey;
import com.corehive.backend.model.FeedbackSurveyResponse;
import com.corehive.backend.service.FeedbackSurveyService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orgs/surveys")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FeedbackSurveyController {

    private final FeedbackSurveyService surveyService;

    // ============================================================
    // GET ALL SURVEYS FOR ORGANIZATION
    // ============================================================
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getAllSurveys(HttpServletRequest request) {
        String orgUuid = (String) request.getAttribute("organizationUuid");
        List<FeedbackSurvey> surveys = surveyService.listSurveys(orgUuid);
        return new ResponseEntity<>(
                new StandardResponse(200, "Fetched all surveys successfully", surveys),
                HttpStatus.OK
        );
    }

    // ============================================================
    // CREATE A NEW SURVEY
    // ============================================================
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> createSurvey(
            HttpServletRequest request,
            @RequestBody CreateSurveyRequest req
    ) {
        String orgUuid = (String) request.getAttribute("organizationUuid");
        // NOTE: createdBy can be fetched from request if needed
        FeedbackSurvey survey = surveyService.createSurvey(orgUuid, req);

        return new ResponseEntity<>(
                new StandardResponse(200, "Survey created successfully", survey),
                HttpStatus.OK
        );
    }

    // ============================================================
    // GET SINGLE SURVEY BY ID
    // ============================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getSurveyById(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        FeedbackSurvey survey = surveyService.getSurvey(id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Survey fetched successfully", survey),
                HttpStatus.OK
        );
    }

    // ============================================================
    // DELETE A SURVEY
    // ============================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> deleteSurvey(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        surveyService.deleteSurvey(id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Survey deleted successfully", null),
                HttpStatus.OK
        );
    }

    // ============================================================
    // GET ALL RESPONSES FOR A SURVEY (BASIC)
    // ============================================================
    @GetMapping("/{id}/responses")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getSurveyResponses(@PathVariable Long id) {
        List<FeedbackSurveyResponse> responses = surveyService.getResponses(id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Survey responses fetched successfully", responses),
                HttpStatus.OK
        );
    }

    // ============================================================
    // GET ALL RESPONSES FOR SURVEY (DETAILED / ANALYTICS)
    // ============================================================
    @GetMapping("/{id}/responses/all")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getAllResponsesForSurvey(@PathVariable Long id) {
        // AppWideException handles SurveyResponseNotFoundException
        List<FeedbackSurveyResponse> responses = surveyService.getAllResponsesForSurvey(id);
        return new ResponseEntity<>(
                new StandardResponse(200, "All responses fetched successfully", responses),
                HttpStatus.OK
        );
    }

    // ============================================================
    // GET DETAILED RESPONSE VIEW (PER QUESTION / USER)
    // ============================================================
    @GetMapping("/{id}/responses/details")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getDetailedResponses(@PathVariable Long id) {
        // AppWideException handles SurveyResponseNotFoundException
        var responseDetails = surveyService.getResponseDetails(id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Detailed responses fetched successfully", responseDetails),
                HttpStatus.OK
        );
    }

    // ============================================================
    // GET QUESTIONS FOR A SURVEY
    // ============================================================
    @GetMapping("/{id}/questions")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getSurveyQuestions(@PathVariable Long id) {
        var questions = surveyService.getSurveyQuestions(id);
        return new ResponseEntity<>(
                new StandardResponse(200, "Survey questions fetched successfully", questions),
                HttpStatus.OK
        );
    }

    // ============================================================
    // UPDATE SURVEY QUESTIONS
    // ============================================================
    @PutMapping("/{id}/questions")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> updateSurveyQuestions(
            @PathVariable Long id,
            @RequestBody UpdateSurveyDTO dto
    ) {
        var updatedSurvey = surveyService.updateSurveyQuestions(id, dto);
        return new ResponseEntity<>(
                new StandardResponse(200, "Survey questions updated successfully", updatedSurvey),
                HttpStatus.OK
        );
    }
}
