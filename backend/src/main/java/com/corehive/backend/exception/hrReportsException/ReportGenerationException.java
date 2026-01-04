package com.corehive.backend.exception.hrReportsException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class ReportGenerationException extends RuntimeException {
    public ReportGenerationException(String message, Exception ex) {
        super(message);
    }
}
