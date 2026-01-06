package com.corehive.backend.dto.request;

import com.corehive.backend.model.FeedbackType;
import lombok.Data;

@Data
public class EmployeeFeedbackRequest {

    private Long employeeId;
    private Integer rating;
    private FeedbackType feedbackType;
    private String message;
}
