package com.corehive.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Test Controller
 * API testing සහ health checks සඳහා
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    /**
     * Public Test Endpoint
     * Authentication නැතිව test කරන්න
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "CoreHive API is running!");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "1.0.0");
        response.put("environment", "development");

        return ResponseEntity.ok(response);
    }

    /**
     * Protected Test Endpoint
     * Authentication required
     */
    @GetMapping("/test/protected")
    public ResponseEntity<Map<String, Object>> protectedTest(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Protected endpoint accessed successfully!");
        response.put("timestamp", LocalDateTime.now());
        response.put("tokenReceived", authHeader != null);

        return ResponseEntity.ok(response);
    }

    /**
     * Database Connection Test
     * TODO: Add actual database query
     */
    @GetMapping("/test/database")
    public ResponseEntity<Map<String, Object>> databaseTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Database connection test");
        response.put("status", "OK");
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(response);
    }
}