package com.corehive.backend.controller;

import com.corehive.backend.dto.request.QrGenerateRequest;
import com.corehive.backend.service.QrCodeService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * QR Code generation for attendance
 */
@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class QrCodeController {

    private final QrCodeService qrCodeService;

    /**
     * Generate QR token for attendance
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('HR_STAFF')")
    public ResponseEntity<StandardResponse> generateAttendanceQr(
            @Valid @RequestBody QrGenerateRequest request,
            HttpServletRequest http
    ) {
        // organizationUuid injected by JWT filter
        String orgUuid = (String) http.getAttribute("organizationUuid");

        if (orgUuid == null) {
            throw new RuntimeException("Organization UUID missing from token");
        }

        String qrToken = qrCodeService.generateAttendanceQrToken(
                request.getEmployeeId(),
                orgUuid,
                request.getPurpose().name()
        );

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "QR token generated",
                        qrToken
                )
        );
    }
}
