package com.corehive.backend.controller;

import com.corehive.backend.dto.SubmitSurveyResponseRequest;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.FeedbackSurvey;
import com.corehive.backend.model.FeedbackSurveyResponse;
import com.corehive.backend.repository.EmployeeRepository;
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
@RequestMapping("/api/employee/surveys")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EmployeeSurveyController {

    private final FeedbackSurveyService surveyService;
    private final EmployeeRepository employeeRepository;

    /**
     * Get all active surveys for employee's organization
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<StandardResponse> getActiveSurveys(HttpServletRequest request) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            List<FeedbackSurvey> surveys = surveyService.getActiveSurveysForEmployee(orgUuid);
            return new ResponseEntity<>(
                new StandardResponse(200, "Active surveys retrieved successfully", surveys),
                HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new StandardResponse(500, "Failed to get surveys: " + e.getMessage(), null),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Get survey details with questions
     */
    @GetMapping("/{surveyId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<StandardResponse> getSurveyDetails(@PathVariable Long surveyId) {
        try {
            FeedbackSurvey survey = surveyService.getSurvey(surveyId);
            return new ResponseEntity<>(
                new StandardResponse(200, "Survey details retrieved successfully", survey),
                HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new StandardResponse(500, "Failed to get survey: " + e.getMessage(), null),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Submit survey response
     */
    @PostMapping("/{surveyId}/respond")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<StandardResponse> submitResponse(
            HttpServletRequest request,
            @PathVariable Long surveyId,
            @RequestBody SubmitSurveyResponseRequest responseData) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            // Get employee by email
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, orgUuid)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            FeedbackSurveyResponse response = surveyService.submitSurveyResponse(
                surveyId, 
                employee.getId(), 
                responseData
            );
            
            return new ResponseEntity<>(
                new StandardResponse(200, "Survey response submitted successfully", response),
                HttpStatus.OK
            );
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                new StandardResponse(400, e.getMessage(), null),
                HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new StandardResponse(500, "Failed to submit response: " + e.getMessage(), null),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check if employee has already responded to a survey
     */
    @GetMapping("/{surveyId}/has-responded")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<StandardResponse> hasResponded(
            HttpServletRequest request,
            @PathVariable Long surveyId) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            String userEmail = (String) request.getAttribute("userEmail");
            
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, orgUuid)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            boolean hasResponded = surveyService.hasEmployeeResponded(surveyId, employee.getId());
            
            return new ResponseEntity<>(
                new StandardResponse(200, "Check completed", hasResponded),
                HttpStatus.OK
            );
        } catch (Exception e) {
            return new ResponseEntity<>(
                new StandardResponse(500, "Failed to check response: " + e.getMessage(), null),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
