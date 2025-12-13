package com.corehive.backend.controller;

import com.corehive.backend.dto.EmployeeRequestDTO;
import com.corehive.backend.dto.JobPostingRequestDTO;
import com.corehive.backend.dto.paginated.PaginatedResponseItemDTO;
import com.corehive.backend.model.Employee;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.JobPostingRepository;
import com.corehive.backend.service.JobPostingService;
import com.corehive.backend.util.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orgs/{orgUuid}/job-postings")
//@CrossOrigin(origins = "*")
public class JobPostingController {
    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    //CREATE
    @PostMapping
    public ResponseEntity<JobPosting> createJobPosting(@RequestBody JobPostingRequestDTO req) {
        JobPosting created = jobPostingService.createJobPosting(req);
        return ResponseEntity.ok(created);
    }


    //************************************************//
    //GET ALL JOB-POSTINGS//
    //************************************************//
    @GetMapping
    public ResponseEntity<StandardResponse>  getAllJobPostings(
            @PathVariable String orgUuid ,
            @RequestParam(value = "page") int page ,
            @RequestParam(value = "size") int size)
    {
        PaginatedResponseItemDTO paginatedResponseItemDTO = jobPostingService.getAllJobPostingsWithPaginated(orgUuid , page , size);

        return new ResponseEntity<StandardResponse>(
                new StandardResponse(200, "Success", paginatedResponseItemDTO), HttpStatus.OK
        );
    }


//    @GetMapping
//    public ResponseEntity<List<JobPosting>> getAllJobPostings(){
//        return ResponseEntity.ok(jobPostingService.getAllJobPostings());
//    }

    //Read BY ID
    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> getJobPostingById(@PathVariable Long id){
        return jobPostingService.getJobPostingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJobPosting(@PathVariable Long id, @RequestBody JobPostingRequestDTO req) {

        JobPosting updated = jobPostingService.updateJobPosting(id, req);

        if (updated == null) {
            return ResponseEntity.badRequest().body("Employee not found");
        }

        return ResponseEntity.ok(updated);
    }


    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id){
        jobPostingService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }
}
