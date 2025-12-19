package com.corehive.backend.exception.jobPostingCustomException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class JobPostingCreationException extends RuntimeException {
    public JobPostingCreationException(String message) {
        super(message);
    }
}
