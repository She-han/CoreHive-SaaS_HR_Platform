package com.corehive.backend.exception.attendanceException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class AttendanceNotCheckedInException extends RuntimeException {
    public AttendanceNotCheckedInException(String message) {
        super(message);
    }
}
