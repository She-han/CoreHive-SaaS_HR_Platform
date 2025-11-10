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
 * හැම request එකකම JWT token validate කරනවා
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // 1. Authorization header එකෙන් JWT token extract කරන්න
        final String requestTokenHeader = request.getHeader("Authorization");

        String email = null;
        String jwtToken = null;

        // Bearer token format check කරන්න
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7); // "Bearer " remove කරන්න
            try {
                email = jwtUtil.extractEmail(jwtToken);
            } catch (Exception e) {
                log.warn("JWT token validation failed: {}", e.getMessage());
            }
        }

        // 2. Token valid නම් authentication set කරන්න
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Token validate කරන්න
            if (jwtUtil.validateToken(jwtToken, email)) {

                // User roles extract කරන්න
                String role = jwtUtil.extractRole(jwtToken);
                String userType = jwtUtil.extractUserType(jwtToken);

                // Spring Security authorities create කරන්න
                List<SimpleGrantedAuthority> authorities = createAuthorities(role);

                // Authentication object create කරන්න
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Security context එකේ authentication set කරන්න
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Request attributes එකේ user info store කරන්න (Controller වලින් access කරන්න)
                request.setAttribute("userId", jwtUtil.extractUserId(jwtToken));
                request.setAttribute("userEmail", email);
                request.setAttribute("userRole", role);
                request.setAttribute("userType", userType);
                request.setAttribute("organizationUuid", jwtUtil.extractOrganizationUuid(jwtToken));

                log.debug("Authentication set for user: {} with role: {}", email, role);
            }
        }

        // 3. Filter chain continue කරන්න
        chain.doFilter(request, response);
    }

    /**
     * User role අනුව Spring Security authorities create කරන්න
     */
    private List<SimpleGrantedAuthority> createAuthorities(String role) {
        // ROLE_ prefix add කරන්න (Spring Security requirement)
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    /**
     * Public endpoints සඳහා filter skip කරන්න (FIXED VERSION)
     * configure-modules endpoint එකට authentication ඕනේ නිසා එය exclude කරනවා
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Public endpoints (token required නැහැ)
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