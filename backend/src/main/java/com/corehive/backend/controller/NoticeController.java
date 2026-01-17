package com.corehive.backend.controller;

import com.corehive.backend.dto.request.NoticeRequestDTO;
import com.corehive.backend.service.NoticeService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    //************************************************//
    //GET ALL NOTICES
    //************************************************//
    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getAllNotices(
            HttpServletRequest request,
            @RequestParam int page,
            @RequestParam int size
    ) throws BadRequestException {
        String organizationUuid =
                (String) request.getAttribute("organizationUuid");

        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Fetched all notices successfully",
                        noticeService.getAllNotices(organizationUuid, page, size)
                ),
                HttpStatus.OK
        );
    }

    //************************************************//
    //CREATE NOTICE
    //************************************************//
    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> createNotice(
            HttpServletRequest request,
            @RequestBody NoticeRequestDTO req
    ) throws BadRequestException {
        String organizationUuid =
                (String) request.getAttribute("organizationUuid");
        Long userId =
                (Long) request.getAttribute("userId");

        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Notice created successfully",
                        noticeService.createNotice(organizationUuid, req, userId)
                ),
                HttpStatus.OK
        );
    }

    //************************************************//
    //GET ONE NOTICE
    //************************************************//
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> getNoticeById(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        String organizationUuid =
                (String) request.getAttribute("organizationUuid");

        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Notice fetched successfully",
                        noticeService.getNoticeById(organizationUuid, id)
                ),
                HttpStatus.OK
        );
    }

    //************************************************//
    //UPDATE NOTICE
    //************************************************//
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> updateNotice(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody NoticeRequestDTO req
    ) {
        String organizationUuid =
                (String) request.getAttribute("organizationUuid");

        return new ResponseEntity<>(
                new StandardResponse(
                        200,
                        "Notice updated successfully",
                        noticeService.updateNotice(organizationUuid, id, req)
                ),
                HttpStatus.OK
        );
    }

    //************************************************//
    //DELETE NOTICE
    //************************************************//
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> deleteNotice(
            HttpServletRequest request,
            @PathVariable Long id
    ) {
        String organizationUuid =
                (String) request.getAttribute("organizationUuid");

        noticeService.deleteNotice(organizationUuid, id);

        return new ResponseEntity<>(
                new StandardResponse(200, "Notice deleted successfully", null),
                HttpStatus.OK
        );
    }
}

