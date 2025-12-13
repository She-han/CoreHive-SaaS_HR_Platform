package com.corehive.backend.dto.response;

import com.corehive.backend.model.JobPosting;
import jakarta.persistence.*;
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

    private String title;

    private String description;

    private String department;

    private JobPosting.EmploymentType employmentType = JobPosting.EmploymentType.FULL_TIME;

    private JobPosting.Status status = JobPosting.Status.DRAFT;

    private LocalDate postedDate;

    private LocalDate closingDate;

    private Long postedBy;

    private Integer availableVacancies = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERN
    }

    public enum Status {
        DRAFT, OPEN, CLOSED
    }

}
