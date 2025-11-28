package com.corehive.backend.dto;

import lombok.Data;

@Data
public class JobPostingRequestDTO {

    private String organizationUuid;     // optional for now (or set default in service)
    private String title;
    private String description;
    private String department;           // varchar(100)
    private String employmentType;       // ENUM: CONTRACT, FULL_TIME, INTERN, PART_TIME
    private String status;               // ENUM: CLOSED, DRAFT, OPEN
    private String postedDate;           // yyyy-mm-dd
    private String closingDate;          // yyyy-mm-dd
    private Integer availableVacancies;  // INT
}
