package com.corehive.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateSurveyRequest {

    private String title;
    private String description;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    @JsonProperty("is_anonymous")
    private Boolean isAnonymous;

//    @JsonProperty("target_type")
//    private String targetType;

    private List<CreateQuestionRequest> questions;
}
