package com.corehive.backend.config;

import com.corehive.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

/**
 * JWT Request Filter
 * Validates JWT token for every request
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // 1. Extract JWT token from Authorization header   
        final String requestTokenHeader = request.getHeader("Authorization");

        String email = null;
        String jwtToken = null;

        // Check Bearer token format
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7); // Remove "Bearer " 
            try {
                email = jwtUtil.extractEmail(jwtToken);
            } catch (Exception e) {
                log.warn("JWT token validation failed: {}", e.getMessage());
            }
        }

        // 2. If token is valid, set authentication
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Validate token
            if (jwtUtil.validateToken(jwtToken, email)) {

                // Extract user roles 
                String role = jwtUtil.extractRole(jwtToken);
                String userType = jwtUtil.extractUserType(jwtToken);

                // Spring Security authorities create 
                List<SimpleGrantedAuthority> authorities = createAuthorities(role);

                // Create authentication object
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication in Security context   
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Store user info in request attributes (for Controller access)
                request.setAttribute("userId", jwtUtil.extractUserId(jwtToken));
                request.setAttribute("userEmail", email);
                request.setAttribute("userRole", role);
                request.setAttribute("userType", userType);
                request.setAttribute("organizationUuid", jwtUtil.extractOrganizationUuid(jwtToken));

                log.debug("Authentication set for user: {} with role: {}", email, role);
            }
        }

        // 3. Continue filter chain
        chain.doFilter(request, response);
    }

    /**
     * Create Spring Security authorities based on user role
     */
    private List<SimpleGrantedAuthority> createAuthorities(String role) {
        // ROLE_ prefix add  (Spring Security requirement)
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    /**
     * Skip filter for public endpoints (FIXED VERSION)
     * configure-modules endpoint requires authentication, so exclude it
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Public endpoints (no token required)
        List<String> publicPaths = Arrays.asList(
            "/api/auth/login",
            "/api/auth/signup"
        );
        
        // Check if the path is in public paths
        boolean isPublicPath = publicPaths.stream().anyMatch(path::startsWith);
        
        // Skip filter only for public paths and actuator
        boolean shouldSkip = isPublicPath || path.startsWith("/actuator/");
        
        if (shouldSkip) {
            log.debug("Skipping JWT filter for public endpoint: {}", path);
        }
        
        return shouldSkip;
    }
}