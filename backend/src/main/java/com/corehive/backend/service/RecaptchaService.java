package com.corehive.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

@Service
@Slf4j
public class RecaptchaService {

    @Value("${recaptcha.secret-key:}")
    private String secretKey;

    @Value("${recaptcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    public boolean verifyRecaptcha(String token) {
        if (secretKey == null || secretKey.isEmpty()) {
            log.warn("reCAPTCHA secret key not configured - skipping verification");
            return true; // Allow in development
        }

        if (token == null || token.isEmpty()) {
            log.warn("No reCAPTCHA token provided");
            return false;
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", secretKey);
            params.add("response", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            Map<String, Object> response = restTemplate.postForObject(verifyUrl, request, Map.class);

            if (response != null && response.containsKey("success")) {
                boolean success = (Boolean) response.get("success");

                if (!success) {
                    log.warn("reCAPTCHA verification failed: {}", response.get("error-codes"));
                }

                return success;
            }

            return false;
        } catch (Exception e) {
            log.error("reCAPTCHA verification error: {}", e.getMessage());
            return false;
        }
    }
}