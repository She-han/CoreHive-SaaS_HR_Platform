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
 * JWT tokens generate කරන්න සහ validate කරන්න methods
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * JWT Token generate කරන්න
     */
    public String generateToken(Map<String, Object> userDetails, String userType) {
        Map<String, Object> claims = new HashMap<>();

        // Token eke payload එකේ තියෙන data
        claims.put("userId", userDetails.get("userId"));
        claims.put("email", userDetails.get("email"));
        claims.put("role", userDetails.get("role"));
        claims.put("userType", userType);

        // Organization user නම් organization UUID එකත් add කරන්න
        if ("ORG_USER".equals(userType)) {
            claims.put("organizationUuid", userDetails.get("organizationUuid"));
        }

        return createToken(claims, (String) userDetails.get("email"));
    }

    /**
     * Token create කරන්න private method
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims) // Custom claims set කරන්න
                .subject(subject) // Usually email address
                .issuedAt(new Date(System.currentTimeMillis())) // Token issue time
                .expiration(new Date(System.currentTimeMillis() + expiration)) // Expiry time
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Secret key සමඟ sign කරන්න
                .compact(); // Final token string generate කරන්න
    }

    /**
     * Token වලින් email address extract කරන්න
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Token වලින් expiration date extract කරන්න
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Token වලින් specific claim එකක් extract කරන්න
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Token වලින් සියලු claims extract කරන්න - UPDATED VERSION
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()  // Updated method
                .verifyWith(getSigningKey()) // Updated method
                .build()
                .parseSignedClaims(token) // Updated method
                .getPayload(); // Updated method
    }

    /**
     * Token expired වෙලාද check කරන්න
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Token valid ද check කරන්න
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
     * Token වලින් user role extract කරන්න
     */
    public String extractRole(String token) {
        final Claims claims = extractAllClaims(token);
        return (String) claims.get("role");
    }

    /**
     * Token වලින් user type extract කරන්න
     */
    public String extractUserType(String token) {
        final Claims claims = extractAllClaims(token);
        return (String) claims.get("userType");
    }

    /**
     * Token වලින් organization UUID extract කරන්න
     */
    public String extractOrganizationUuid(String token) {
        final Claims claims = extractAllClaims(token);
        return (String) claims.get("organizationUuid");
    }

    /**
     * Token වලින් user ID extract කරන්න
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
     * Signing key generate කරන්න
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}