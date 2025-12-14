package com.corehive.backend.advisor;

import com.corehive.backend.exception.employeeCustomException.EmployeeAlreadyInactiveException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.InvalidEmployeeDataException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.exception.jobPostingCustomException.InvalidJobPostingException;
import com.corehive.backend.exception.jobPostingCustomException.JobPostingCreationException;
import com.corehive.backend.exception.jobPostingCustomException.JobPostingNotFoundException;
import com.corehive.backend.util.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AppWideException {

    //Global Exception handler
    //If any exception happens in my controllers, handle it here globally."

    // ================= Employee Exceptions =================
    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<StandardResponse> handleEmployeeNotFound(EmployeeNotFoundException e) {
        return new ResponseEntity<>(
                new StandardResponse(404, "Employee Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(OrganizationNotFoundException.class)
    public ResponseEntity<StandardResponse> handleOrganizationNotFound(OrganizationNotFoundException e) {
        return new ResponseEntity<>(
                new StandardResponse(404, "Organization Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(EmployeeAlreadyInactiveException.class)
    public ResponseEntity<StandardResponse> handleOrganizationNotFound(EmployeeAlreadyInactiveException e) {
        return new ResponseEntity<>(
                new StandardResponse(400, "Employee is already Inactive", e.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(InvalidEmployeeDataException.class)
    public ResponseEntity<StandardResponse> handleInvalidEmployeeData(InvalidEmployeeDataException e) {
        return new ResponseEntity<>(
                new StandardResponse(400, "Invalid Employee Data", e.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    // ================= JobPosting Exceptions =================

    @ExceptionHandler(InvalidJobPostingException.class)
    public ResponseEntity<StandardResponse> handleInvalidJobPosting(InvalidJobPostingException e) {
        return new ResponseEntity<>(
                new StandardResponse(400, "Invalid Job Posting", e.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(JobPostingCreationException.class)
    public ResponseEntity<StandardResponse> handleJobPostingCreation(JobPostingCreationException e) {
        return new ResponseEntity<>(
                new StandardResponse(500, "Job Posting Creation Failed", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(JobPostingNotFoundException.class)
    public ResponseEntity<StandardResponse> handleJobPostingNotFound(JobPostingNotFoundException e) {
        return new ResponseEntity<>(
                new StandardResponse(404, "Job Posting Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

}
