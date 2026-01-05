package com.corehive.backend.exception.feedbackSurveyException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT)
public class SurveyDeletionException extends RuntimeException {
    public SurveyDeletionException(String message) {
        super(message);
    }
}
