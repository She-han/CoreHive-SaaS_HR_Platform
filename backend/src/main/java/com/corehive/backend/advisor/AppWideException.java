package com.corehive.backend.advisor;

import com.corehive.backend.exception.attendanceException.AttendanceAlreadyCheckedInException;
import com.corehive.backend.exception.attendanceException.AttendanceAlreadyCheckedOutException;
import com.corehive.backend.exception.attendanceException.AttendanceNotCheckedInException;
import com.corehive.backend.exception.attendanceException.AttendanceNotFoundException;
import com.corehive.backend.exception.departmentException.DepartmentNotFoundException;
import com.corehive.backend.exception.employeeCustomException.EmployeeAlreadyInactiveException;
import com.corehive.backend.exception.employeeCustomException.EmployeeNotFoundException;
import com.corehive.backend.exception.employeeCustomException.InvalidEmployeeDataException;
import com.corehive.backend.exception.employeeCustomException.OrganizationNotFoundException;
import com.corehive.backend.exception.feedbackSurveyException.InvalidSurveyRequestException;
import com.corehive.backend.exception.feedbackSurveyException.SurveyDeletionException;
import com.corehive.backend.exception.feedbackSurveyException.SurveyNotFoundException;
import com.corehive.backend.exception.feedbackSurveyException.SurveyResponseNotFoundException;
import com.corehive.backend.exception.hrReportsException.InvalidRequestException;
import com.corehive.backend.exception.hrReportsException.ReportGenerationException;
import com.corehive.backend.exception.hrReportsException.ResourceNotFoundException;
import com.corehive.backend.exception.jobPostingCustomException.InvalidJobPostingException;
import com.corehive.backend.exception.jobPostingCustomException.JobPostingCreationException;
import com.corehive.backend.exception.jobPostingCustomException.JobPostingNotFoundException;
import com.corehive.backend.exception.leaveException.InsufficientLeaveBalanceException;
import com.corehive.backend.exception.leaveException.LeaveRequestNotFoundException;
import com.corehive.backend.exception.leaveException.LeaveTypeNotFoundException;
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
    @ExceptionHandler(DepartmentNotFoundException.class)
    public ResponseEntity<StandardResponse> handleDepartmentNotFound(DepartmentNotFoundException e) {
        return new ResponseEntity<>(
                new StandardResponse(404, "Department Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(AttendanceAlreadyCheckedInException.class)
    public ResponseEntity<StandardResponse> handleAlreadyCheckedIn(AttendanceAlreadyCheckedInException e) {
        return new ResponseEntity<>(
                new StandardResponse(400, "Already Checked In", e.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(AttendanceAlreadyCheckedOutException.class)
    public ResponseEntity<StandardResponse> handleAlreadyCheckedOut(AttendanceAlreadyCheckedOutException e) {
        return new ResponseEntity<>(
                new StandardResponse(400, "Already Checked Out", e.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(AttendanceNotFoundException.class)
    public ResponseEntity<StandardResponse> handleAttendanceNotFound(AttendanceNotFoundException e) {
        return new ResponseEntity<>(
                new StandardResponse(404, "Attendance Not Found", e.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(AttendanceNotCheckedInException.class)
    public ResponseEntity<StandardResponse> handleAttendanceNotCheckedIn(
            AttendanceNotCheckedInException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new StandardResponse(
                        400,
                        ex.getMessage(),
                        null
                ));
    }

    // ============================================================
    // FEEDBACK SURVEY EXCEPTIONS  ✅ (NEW)
    // ============================================================

    @ExceptionHandler(SurveyNotFoundException.class)
    public ResponseEntity<StandardResponse> handleSurveyNotFound(SurveyNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new StandardResponse(
                        404,
                        "Survey not found",
                        null
                ));
    }

    @ExceptionHandler(SurveyResponseNotFoundException.class)
    public ResponseEntity<StandardResponse> handleSurveyResponseNotFound(
            SurveyResponseNotFoundException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new StandardResponse(
                        404,
                        "Survey Response not found",
                        null
                ));
    }

    @ExceptionHandler(InvalidSurveyRequestException.class)
    public ResponseEntity<StandardResponse> handleInvalidSurveyRequest(
            InvalidSurveyRequestException ex
    ) {
        return new ResponseEntity<>(
                new StandardResponse(400, "Invalid survey request", null),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(SurveyDeletionException.class)
    public ResponseEntity<StandardResponse> handleSurveyDeletionException(
            SurveyDeletionException ex
    ) {

        return new ResponseEntity<>(
                new StandardResponse(409, "Survey deletion failed", null),
                HttpStatus.BAD_REQUEST
        );
    }

    // ============================================================
    // LEAVE EXCEPTIONS
    // ============================================================
    @ExceptionHandler(LeaveTypeNotFoundException.class)
    public ResponseEntity<StandardResponse> handleLeaveTypeNotFound(LeaveTypeNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new StandardResponse(
                        404,
                        "Leave type is not found",
                        null
                ));
    }

    @ExceptionHandler(LeaveRequestNotFoundException.class)
    public ResponseEntity<StandardResponse> handleLeaveRequestNotFound(LeaveRequestNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new StandardResponse(
                        404,
                        "Leave Request is not found",
                        null
                ));
    }

    @ExceptionHandler(InsufficientLeaveBalanceException.class)
    public ResponseEntity<StandardResponse> handleInsufficientLeaveBalance(
            InsufficientLeaveBalanceException ex
    ) {

        return new ResponseEntity<>(
                new StandardResponse(409, "Insufficient leave balance", null),
                HttpStatus.BAD_REQUEST
        );
    }

    // ============================================================
    // HR-Reports EXCEPTIONS
    // ============================================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<StandardResponse> handleNotFound(
            ResourceNotFoundException ex) {

        return new ResponseEntity<>(
                new StandardResponse(404, ex.getMessage(), null),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<StandardResponse> handleInvalidRequest(
            InvalidRequestException ex) {

        return new ResponseEntity<>(
                new StandardResponse(400, ex.getMessage(), null),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(ReportGenerationException.class)
    public ResponseEntity<StandardResponse> handleReportError(
            ReportGenerationException ex) {

        return new ResponseEntity<>(
                new StandardResponse(500, "Failed to generate HR report", null),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

}
