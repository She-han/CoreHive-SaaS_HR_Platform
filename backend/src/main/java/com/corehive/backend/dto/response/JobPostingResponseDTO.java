package com.corehive.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobPostingResponseDTO {


    private Long id;

    private String organizationUuid;

    private String title;

    private String description;

    private String contactEmail;

    private EmploymentType employmentType;

    private Status status;

    private LocalDate postedDate;

    private LocalDate closingDate;

    private Long postedBy;

    private Integer availableVacancies;

    private LocalDateTime createdAt;

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERN
    }

    public enum Status {
        DRAFT, OPEN, CLOSED
    }

}
