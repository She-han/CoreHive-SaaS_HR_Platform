package com.corehive.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FeedbackSurveyResponseDTO {

    private Long responseId;
    private Long employeeId;
    private LocalDateTime submittedAt;
    private List<AnswerDTO> answers;

    @Data
    public static class AnswerDTO {
        private Long questionId;
        private String questionText;
        private String questionType;
        private String answerText;
        private String selectedOption;
    }
}
