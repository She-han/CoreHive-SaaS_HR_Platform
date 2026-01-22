
package com.corehive.backend.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class InitiatePaymentRequest {
    @NotBlank(message = "Organization UUID is required")
    private String organizationUuid;

    @NotBlank(message = "User email is required")
    private String userEmail;
}