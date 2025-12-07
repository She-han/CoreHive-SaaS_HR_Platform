package com.corehive.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateQuestionDTO {
    private Long id;                    // null → new question
    private String questionText;
    private String questionType;
    private List<String> options;
    private Integer position;
}
