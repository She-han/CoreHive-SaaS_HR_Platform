package com.corehive.backend.exception.feedbackSurveyException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class SurveyResponseNotFoundException extends RuntimeException {
    public SurveyResponseNotFoundException(String message) {
        super(message);
    }
}
