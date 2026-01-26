package com.corehive.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponseWithEmployeeDTO {
    
    private Long responseId;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private LocalDateTime submittedAt;
    private List<FeedbackSurveyResponseDTO.AnswerDTO> answers;
    
    // Constructor without employee details (for anonymous surveys)
    public SurveyResponseWithEmployeeDTO(Long responseId, Long employeeId, LocalDateTime submittedAt) {
        this.responseId = responseId;
        this.employeeId = employeeId;
        this.submittedAt = submittedAt;
    }
}
