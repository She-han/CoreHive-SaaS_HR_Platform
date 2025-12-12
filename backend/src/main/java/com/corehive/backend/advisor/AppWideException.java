package com.corehive.backend.advisor;

import com.corehive.backend.exception.EmployeeNotFoundException;
import com.corehive.backend.exception.OrganizationNotFoundException;
import com.corehive.backend.util.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AppWideException {
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

}
