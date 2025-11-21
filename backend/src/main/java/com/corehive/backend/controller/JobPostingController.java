package com.corehive.backend.controller;

import com.corehive.backend.dto.JobPostingRequestDTO;
import com.corehive.backend.model.JobPosting;
import com.corehive.backend.repository.JobPostingRepository;
import com.corehive.backend.service.JobPostingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-postings")
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


    //READ ALL
    @GetMapping
    public ResponseEntity<List<JobPosting>> getAllJobPostings(){
        return ResponseEntity.ok(jobPostingService.getAllJobPostings());
    }

    //Read BY ID
    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> getJobPostingById(@PathVariable Long id){
        return jobPostingService.getJobPostingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<JobPosting> updateJobPosting(
            @PathVariable Long id ,
            @RequestBody JobPosting jobPosting
    ){
        return ResponseEntity.ok(jobPostingService.updateJobPosting(id , jobPosting));
    }

    //DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id){
        jobPostingService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }
}
