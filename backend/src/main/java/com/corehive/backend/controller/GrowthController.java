package com.corehive.backend.controller;

import com.corehive.backend.dto.TenantGrowthDTO;
import com.corehive.backend.service.TenantGrowth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000") // React port එකට අවසර දීම
public class GrowthController {

    @Autowired
    private TenantGrowth growthService;

    // Tenant Growth දත්ත ලබා දෙන GET Endpoint එක
    @GetMapping("/tenant-growth")
    public ResponseEntity<List<TenantGrowthDTO>> getTenantGrowth() {
        List<TenantGrowthDTO> data = growthService.getTenantGrowthData();
        return ResponseEntity.ok(data);
    }
}