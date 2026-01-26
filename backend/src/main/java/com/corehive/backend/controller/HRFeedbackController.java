package com.corehive.backend.controller;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.EmployeeFeedbackResponseDTO;
import com.corehive.backend.service.EmployeeFeedbackService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr-staff/employee-feedbacks")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class HRFeedbackController {

    private final EmployeeFeedbackService feedbackService;

    /**
     * Get all feedbacks for organization
     */
    @GetMapping
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<List<EmployeeFeedbackResponseDTO>>> getAllFeedbacks(
            HttpServletRequest request) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            
            List<EmployeeFeedbackResponseDTO> feedbacks = 
                feedbackService.getAllFeedbacksByOrganization(orgUuid);
            
            return ResponseEntity.ok(ApiResponse.success(feedbacks, "Feedbacks retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching feedbacks", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch feedbacks"));
        }
    }

    /**
     * Mark feedback as read
     */
    @PutMapping("/{feedbackId}/mark-read")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeFeedbackResponseDTO>> markAsRead(
            HttpServletRequest request,
            @PathVariable Long feedbackId) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            
            EmployeeFeedbackResponseDTO feedback = feedbackService.markAsRead(feedbackId, orgUuid);
            
            return ResponseEntity.ok(ApiResponse.success(feedback, "Feedback marked as read"));
        } catch (Exception e) {
            log.error("Error marking feedback as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to mark feedback as read"));
        }
    }

    /**
     * Reply to feedback
     */
    @PutMapping("/{feedbackId}/reply")
    @PreAuthorize("hasRole('HR_STAFF') or hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeFeedbackResponseDTO>> replyToFeedback(
            HttpServletRequest request,
            @PathVariable Long feedbackId,
            @RequestBody Map<String, String> payload) {
        try {
            String orgUuid = (String) request.getAttribute("organizationUuid");
            Long userId = Long.valueOf(request.getAttribute("userId").toString());
            String reply = payload.get("reply");
            
            if (reply == null || reply.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Reply cannot be empty"));
            }
            
            EmployeeFeedbackResponseDTO feedback = 
                feedbackService.replyToFeedback(feedbackId, reply, userId, orgUuid);
            
            return ResponseEntity.ok(ApiResponse.success(feedback, "Reply submitted successfully"));
        } catch (Exception e) {
            log.error("Error replying to feedback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to submit reply"));
        }
    }
}
