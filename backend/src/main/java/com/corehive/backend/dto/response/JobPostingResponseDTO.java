package com.corehive.backend.dto.response;

import com.corehive.backend.model.Department;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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

    private Long department;

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
