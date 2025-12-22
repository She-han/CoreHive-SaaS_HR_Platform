package com.corehive.backend.exception.feedbackSurveyException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidSurveyRequestException extends RuntimeException {
    public InvalidSurveyRequestException(String message) {
        super(message);
    }
}
