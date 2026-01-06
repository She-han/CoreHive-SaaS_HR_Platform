package com.corehive.backend.controller;

import com.corehive.backend.dto.request.EmployeeFeedbackRequest;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;
import com.corehive.backend.service.EmployeeFeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee/employee-feedback")
public class EmployeeFeedbackController {

    private final EmployeeFeedbackService feedbackService;

    public EmployeeFeedbackController(EmployeeFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<EmployeeFeedbackResponseDTO> submitFeedback(
            @RequestBody EmployeeFeedbackRequest request) {

        EmployeeFeedbackResponseDTO response =
                feedbackService.saveFeedback(request);

        return ResponseEntity.ok(response);
    }
}
