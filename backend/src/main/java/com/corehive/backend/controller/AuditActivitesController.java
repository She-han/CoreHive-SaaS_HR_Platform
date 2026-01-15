package com.corehive.backend.controller;

import com.corehive.backend.model.AuditActivities;
import com.corehive.backend.service.AuditActivitiesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@RequestMapping("/api/sys-admin/auditlogswer")

@CrossOrigin(origins = "http://localhost:3000") // React development server
public class AuditActivitesController {
    @Autowired
    private AuditActivitiesService auditActivitiesService;

    @GetMapping
    public List<AuditActivities> getAllActivities(){
        return auditActivitiesService.getAllActivities();
    }
}
