package com.corehive.backend.dto.response;

import com.corehive.backend.model.FeedbackType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeFeedbackResponseDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String departmentName;
    private FeedbackType feedbackType;
    private Integer rating;
    private String message;
    private Boolean markedAsRead;
    private String reply;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
}
