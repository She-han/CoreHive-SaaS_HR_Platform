package com.corehive.backend.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PublicJobPostingResponseDTO {

    // Job info
    private Long jobId;
    private String title;
    private String description;
    private String employmentType;
    private
    LocalDate postedDate;
    private LocalDate closingDate;
    private Integer availableVacancies;
    private String contactEmail;

    // Organization public info
    private String organizationName;
    private String organizationEmail;
    private String employeeCountRange;
}