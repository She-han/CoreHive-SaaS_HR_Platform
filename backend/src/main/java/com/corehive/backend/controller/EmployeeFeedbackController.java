package com.corehive.backend.controller;

import com.corehive.backend.dto.request.EmployeeFeedbackRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.repository.EmployeeRepository;
import com.corehive.backend.service.EmployeeFeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/employee-feedback")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://corehive-frontend-app-cmbucjbga2e6amey.southeastasia-01.azurewebsites.net"})
@RequiredArgsConstructor
@Slf4j
public class EmployeeFeedbackController {

    private final EmployeeFeedbackService feedbackService;
    private final EmployeeRepository employeeRepository;

    /**
     * Submit feedback (max 3 per month)
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<EmployeeFeedbackResponseDTO>> submitFeedback(
            HttpServletRequest httpRequest,
            @RequestBody EmployeeFeedbackRequest request) {
        try {
            String orgUuid = (String) httpRequest.getAttribute("organizationUuid");
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            
            // Get employee by email
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, orgUuid)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            EmployeeFeedbackResponseDTO response = feedbackService.saveFeedback(request, employee.getId());
            return ResponseEntity.ok(ApiResponse.success(response, "Feedback submitted successfully"));
        } catch (RuntimeException e) {
            log.error("Error submitting feedback", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error submitting feedback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to submit feedback"));
        }
    }
    
    /**
     * Get own feedbacks
     */
    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<EmployeeFeedbackResponseDTO>>> getOwnFeedbacks(
            HttpServletRequest httpRequest) {
        try {
            String orgUuid = (String) httpRequest.getAttribute("organizationUuid");
            String userEmail = (String) httpRequest.getAttribute("userEmail");
            
            // Get employee by email
            Employee employee = employeeRepository.findByEmailAndOrganizationUuid(userEmail, orgUuid)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

            List<EmployeeFeedbackResponseDTO> feedbacks = feedbackService.getFeedbacksByEmployee(employee.getId());
            return ResponseEntity.ok(ApiResponse.success(feedbacks, "Feedbacks retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching feedbacks", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch feedbacks"));
        }
    }
}
