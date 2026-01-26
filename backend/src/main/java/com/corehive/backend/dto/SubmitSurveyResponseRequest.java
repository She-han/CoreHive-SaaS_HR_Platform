package com.corehive.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubmitSurveyResponseRequest {
    
    private List<AnswerData> answers;
    
    @Data
    public static class AnswerData {
        private Long questionId;
        private String answerText;
        private String selectedOption;
    }
}
