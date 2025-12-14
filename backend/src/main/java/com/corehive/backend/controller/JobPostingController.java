package com.corehive.backend.controller;

import com.corehive.backend.dto.request.JobPostingRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.dto.response.EmployeeResponseDTO;
import com.corehive.backend.dto.response.JobPostingResponseDTO;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.service.JobPostingService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orgs/job-postings")
@CrossOrigin(origins = "*")
public class JobPostingController {
    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    //************************************************//
    //GET ALL JOB-POSTINGS//
    //************************************************//
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse>  getAllJobPostings(
            HttpServletRequest httpRequest,
            @RequestParam(value = "page") int page ,
            @RequestParam(value = "size") int size
    )
    {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");

        PaginatedResponseItemDTO paginatedResponseItemDTO = jobPostingService.getAllJobPostingsWithPaginated(organizationUuid , page , size);

        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200, "Fetched All Job-Postings successfully", paginatedResponseItemDTO), HttpStatus.OK
        );
    }

    //************************************************//
    //CREATE A JOB-POSTING//
    //************************************************//
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> createJobPosting(
            HttpServletRequest httpRequest,
            @RequestBody JobPostingRequestDTO req
    ) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        Long userId = (Long) httpRequest.getAttribute("userId");

        JobPosting created = jobPostingService.createJobPosting(organizationUuid , req , userId);
        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200, "Created Job-Posting Successfully", created), HttpStatus.OK
        );
    }

    //************************************************//
    //GET ONE JOB-POSTING//
    //************************************************//
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getById(HttpServletRequest httpRequest, @PathVariable Long id) {
        String organizationUuid = (String) httpRequest.getAttribute("organizationUuid");
        String userEmail = (String) httpRequest.getAttribute("userEmail");
        JobPostingResponseDTO jobPosting = jobPostingService.getJobPostingById(organizationUuid, id);
        return new ResponseEntity<>(
                new StandardResponse(200, "One Job-Posting fetched Successfully", jobPosting),
                HttpStatus.OK
        );
    }

//    //UPDATE
//    @PutMapping("/{id}")
//    public ResponseEntity<?> updateJobPosting(@PathVariable Long id, @RequestBody JobPostingRequestDTO req) {
//
//        JobPosting updated = jobPostingService.updateJobPosting(id, req);
//
//        if (updated == null) {
//            return ResponseEntity.badRequest().body("Employee not found");
//        }
//
//        return ResponseEntity.ok(updated);
//    }


    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id){
        jobPostingService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }
}
