package com.corehive.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for HR staff creation response with temporary password
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHRStaffResponse {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("employeeCode")
    private String employeeCode;

    @JsonProperty("firstName")
    private String firstName;

    @JsonProperty("lastName")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("temporaryPassword")
    private String temporaryPassword;

    @JsonProperty("message")
    private String message;

    public static CreateHRStaffResponse success(Long id, String employeeCode, String firstName, 
                                             String lastName, String email, String temporaryPassword) {
        return CreateHRStaffResponse.builder()
                .id(id)
                .employeeCode(employeeCode)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .temporaryPassword(temporaryPassword)
                .message("HR staff member created successfully. Temporary password has been generated.")
                .build();
    }
}