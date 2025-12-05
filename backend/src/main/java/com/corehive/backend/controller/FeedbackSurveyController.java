package com.corehive.backend.controller;

import com.corehive.backend.dto.CreateSurveyRequest;
import com.corehive.backend.model.FeedbackSurvey;
import com.corehive.backend.model.FeedbackSurveyResponse;
import com.corehive.backend.service.FeedbackSurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orgs/{orgUuid}/surveys")
@RequiredArgsConstructor
public class FeedbackSurveyController {

    private final FeedbackSurveyService service;

    // 1) GET all surveys Okay
    @GetMapping
    public List<FeedbackSurvey> list(@PathVariable String orgUuid) {
        return service.listSurveys(orgUuid);
    }

    // 2) CREATE survey Okay but without target type and who created is hardcode
    @PostMapping
    public FeedbackSurvey create(
            @PathVariable String orgUuid,
            @RequestBody CreateSurveyRequest req) {

        return service.createSurvey(orgUuid, req);
    }

    // 3) GET one survey Oky
    @GetMapping("/{id}")
    public FeedbackSurvey getOne(
            @PathVariable String orgUuid,
            @PathVariable Long id) {

        return service.getSurvey(id);
    }

    // 4) GET responses for survey
    @GetMapping("/{id}/responses")
    public List<FeedbackSurveyResponse> getResponses(
            @PathVariable String orgUuid,
            @PathVariable Long id) {

        return service.getResponses(id);
    }

    // 5) DELETE survey
    @DeleteMapping("/{id}")
    public void deleteSurvey(@PathVariable String orgUuid, @PathVariable Long id) {
        service.deleteSurvey(id);
    }


    //Get all the response for relevant survey
    @GetMapping("/{surveyId}/responses/all")
    public ResponseEntity<?> getAllResponses(
            @PathVariable String orgUuid,
            @PathVariable Long surveyId
    ) {
        try {
            List<FeedbackSurveyResponse> responses = service.getAllResponsesForSurvey(surveyId);
            return ResponseEntity.ok(responses);

        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Unexpected server error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/responses/details")
    public ResponseEntity<?> getDetailedResponses(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getResponseDetails(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}

