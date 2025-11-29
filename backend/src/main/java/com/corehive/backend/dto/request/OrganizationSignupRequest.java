package com.corehive.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Organization Registration Request DTO
 * Get company registration data from frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationSignupRequest {

    @NotBlank(message = "Organization name is required")
    @Size(max = 200, message = "Organization name must be less than 200 characters")
    private String organizationName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Size(max = 200, message = "Email must be less than 200 characters")
    private String adminEmail;

    @NotBlank(message = "Business registration number is required")
    @Size(max = 100, message = "Business registration number must be less than 100 characters")
    private String businessRegistrationNumber;

    @NotBlank(message = "Employee count range is required")
    private String employeeCountRange;

    // Extended modules (Optional)

    private Boolean moduleQrAttendanceMarking = false;
    private Boolean moduleFaceRecognitionAttendanceMarking = false;
    private Boolean moduleEmployeeFeedback = false;
    private Boolean moduleHiringManagement = false;
}
