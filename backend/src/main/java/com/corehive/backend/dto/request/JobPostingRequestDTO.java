package com.corehive.backend.dto.request;

import com.corehive.backend.model.Department;
import com.corehive.backend.model.JobPosting;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobPostingRequestDTO {

    @NotNull
    private String organizationUuid;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Long departmentId;

    @NotNull
    private EmploymentType employmentType;

    private Status status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate postedDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate closingDate;

    private Long postedBy;

    private Integer availableVacancies;

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERN
    }

    public enum Status {
        DRAFT, OPEN, CLOSED
    }
}
