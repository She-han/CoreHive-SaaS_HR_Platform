package com.corehive.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDesignationRequest {

    @NotBlank(message = "Designation name is required")
    @Size(max = 100, message = "Designation name must be at most 100 characters")
    private String name;

}
