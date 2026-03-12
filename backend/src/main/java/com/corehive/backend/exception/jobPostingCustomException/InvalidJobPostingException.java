package com.corehive.backend.exception.jobPostingCustomException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidJobPostingException extends RuntimeException {
    public InvalidJobPostingException(String message) {
        super(message);
    }
}
