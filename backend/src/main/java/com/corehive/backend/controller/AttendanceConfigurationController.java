package com.corehive.backend.controller;

import com.corehive.backend.model.AttendanceConfiguration;
import com.corehive.backend.service.AttendanceConfigurationService;
import com.corehive.backend.util.StandardResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/org-admin/attendance-config")
@RequiredArgsConstructor
public class AttendanceConfigurationController {

    private final AttendanceConfigurationService configService;

    @GetMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> getAllConfigurations(HttpServletRequest request) {
        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Attendance configurations loaded",
                        configService.getAllConfigurations(orgUuid)
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> getConfigurationById(
            @PathVariable Long id,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Configuration loaded",
                        configService.getConfigurationById(id, orgUuid)
                )
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> createConfiguration(
            @RequestBody AttendanceConfiguration config,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        201,
                        "Configuration created successfully",
                        configService.createConfiguration(config, orgUuid)
                )
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> updateConfiguration(
            @PathVariable Long id,
            @RequestBody AttendanceConfiguration config,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Configuration updated successfully",
                        configService.updateConfiguration(id, config, orgUuid)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<StandardResponse> deleteConfiguration(
            @PathVariable Long id,
            HttpServletRequest request) {

        String orgUuid = (String) request.getAttribute("organizationUuid");
        configService.deleteConfiguration(id, orgUuid);

        return ResponseEntity.ok(
                new StandardResponse(
                        200,
                        "Configuration deleted successfully",
                        null
                )
        );
    }
}
