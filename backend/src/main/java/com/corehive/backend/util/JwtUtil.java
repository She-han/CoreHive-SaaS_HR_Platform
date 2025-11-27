package com.corehive.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT Utility Class - Updated for JWT 0.12.x
 * Methods to generate and validate JWT tokens
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Generate JWT Token
     */
    public String generateToken(Map<String, Object> userDetails, String userType) {
        Map<String, Object> claims = new HashMap<>();

        // Data in token payload
        claims.put("userId", userDetails.get("userId"));
        claims.put("email", userDetails.get("email"));
        claims.put("role", userDetails.get("role"));
        claims.put("userType", userType);

        // Add organization UUID if organization user
        if ("ORG_USER".equals(userType)) {
            claims.put("organizationUuid", userDetails.get("organizationUuid"));
        }

        return createToken(claims, (String) userDetails.get("email"));
    }

    /**
     * Private method to create token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims) // Set custom claims
                .subject(subject) // Usually email address
                .issuedAt(new Date(System.currentTimeMillis())) // Token issue time
                .expiration(new Date(System.currentTimeMillis() + expiration)) // Expiry time
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sign with secret key
                .compact(); // Generate final token string
    }

    /**
     * Extract email address from token
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract specific claim from token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from token - UPDATED VERSION
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()  // Updated method
                .verifyWith(getSigningKey()) // Updated method
                .build()
                .parseSignedClaims(token) // Updated method
                .getPayload(); // Updated method
    }

    /**
     * Check if token is expired
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Check if token is valid
     */
    public Boolean validateToken(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return (extractedEmail.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract user role from token
     */
    public String extractRole(String token) {
        final Claims claims = extractAllClaims(token);
        return (String) claims.get("role");
    }

    /**
     * Extract user type from token
     */
    public String extractUserType(String token) {
        final Claims claims = extractAllClaims(token);
        return (String) claims.get("userType");
    }

    /**
     * Extract organization UUID from token
     */
    public String extractOrganizationUuid(String token) {
        final Claims claims = extractAllClaims(token);
        return (String) claims.get("organizationUuid");
    }

    /**
     * Extract user ID from token
     */
    public Long extractUserId(String token) {
        final Claims claims = extractAllClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        }
        return null;
    }

    /**
     * Generate signing key
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}