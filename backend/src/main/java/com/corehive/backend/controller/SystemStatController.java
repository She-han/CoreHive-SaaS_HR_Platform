package com.corehive.backend.controller;


import com.corehive.backend.model.SystemStat;
import com.corehive.backend.repository.SystemStatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "http://localhost:3000") // React port එකට අවසර දීම
public class SystemStatController {

    @Autowired
    private SystemStatRepository repository;

    @GetMapping("/stats-history")
    public List<SystemStat> getStatsHistory() {
        // අන්තිම දත්ත 24 ලබා ගැනීම
        List<SystemStat> stats = repository.findTop24ByOrderByIdDesc();

        // අලුත්ම දත්ත අන්තිමට එන ලෙස (Graph එකේ වමේ සිට දකුණට) සකස් කිරීම
        Collections.reverse(stats);

        return stats;
    }
}