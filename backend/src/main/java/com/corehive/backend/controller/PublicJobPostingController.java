package com.corehive.backend.controller;

import com.corehive.backend.service.PublicJobPostingService;
import com.corehive.backend.util.StandardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/jobs")
@CrossOrigin("*")
public class PublicJobPostingController {

    private final PublicJobPostingService service;

    public PublicJobPostingController(PublicJobPostingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<StandardResponse> getPublicJobs(
            @RequestParam int page,
            @RequestParam int size
    ) {
        return ResponseEntity.ok(
                new StandardResponse(200, "Public jobs fetched", service.getPublicJobs(page, size))
        );
    }
}

