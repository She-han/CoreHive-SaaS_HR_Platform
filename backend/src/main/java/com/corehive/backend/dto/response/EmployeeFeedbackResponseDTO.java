package com.corehive.backend.dto.response;

import com.corehive.backend.model.FeedbackType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmployeeFeedbackResponseDTO {

    private Long id;
    private Integer rating;
    private FeedbackType feedbackType;
    private String message;
    private LocalDateTime createdAt;
}
