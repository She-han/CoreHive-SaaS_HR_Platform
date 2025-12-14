package com.corehive.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobPostingRequestDTO {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Long department;   // department ID

    @NotBlank
    private String employmentType;

    @NotBlank
    private String status;

    private String postedDate;
    private String closingDate;

    @NotNull
    private Integer availableVacancies; // INT
}
