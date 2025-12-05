package com.corehive.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;

/**
 * Spring Security Configuration
 * Authentication and Authorization rules configure 
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtRequestFilter jwtRequestFilter;

    /**
     * Password Encoder Bean
     * Passwords hash  BCrypt algorithm use 
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength 12 (recommended)
    }

    /**
     * Security Filter Chain Configuration
     * Define security rules
     */

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF disable  (JWT use )
                .csrf(csrf -> csrf.disable())

                // CORS enable  (for React frontend )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Session management disable  (Stateless JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Request authorization rules
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints (can access without authentication)
                        .requestMatchers("/api/auth/signup", "/api/auth/login").permitAll()
                        .requestMatchers("/actuator/health").permitAll() // Health check
                        .requestMatchers("/api/public/").permitAll() // Future public APIs
                        .requestMatchers("/api/test").permitAll() // Test endpoint
                        .requestMatchers("/api/employees").permitAll()
                        .requestMatchers("/api/job-postings").permitAll()
                        .requestMatchers("/api/orgs/{orgUuid}/surveys").permitAll()
                        .requestMatchers("/api/orgs/{orgUuid}/surveys/**").permitAll()
                        .requestMatchers( "/api/attendance" ,"/api/attendance/**").permitAll()
                        .requestMatchers( "/api/orgs/*/surveys").permitAll()
                        .requestMatchers("/api/orgs/*/surveys/*/responses/details").permitAll()
                        .requestMatchers("GET", "http://localhost:3000/*").hasAnyRole("HR_STAFF", "ORG_ADMIN")
                        .requestMatchers("DELETE", "/api/orgs/*/surveys/*").hasAnyRole("HR_STAFF", "ORG_ADMIN")
                        .requestMatchers("GET", "/api/orgs/*/surveys/*/responses").hasAnyRole("HR_STAFF", "ORG_ADMIN")
                        // Protected auth endpoints (requires valid JWT token)
                        .requestMatchers("/api/auth/configure-modules", "/api/auth/me", "/api/auth/logout").authenticated()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/").hasRole("SYS_ADMIN")

                        // Organization-level endpoints
                        .requestMatchers("/api/org/").hasAnyRole("ORG_ADMIN", "HR_STAFF", "EMPLOYEE")
                        .requestMatchers("/api/employee/").hasRole("EMPLOYEE")
                        .requestMatchers("/api/hr/").hasAnyRole("ORG_ADMIN", "HR_STAFF")
                        .requestMatchers("/api/payroll/").hasRole("ORG_ADMIN")
                        .requestMatchers("/api/dashboard").authenticated() // Dashboard requires authentication

                        // Any other request needs authentication
                        .anyRequest().authenticated()
                )

                // JWT authentication entry point
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))

                // Add JWT filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS Configuration
     * Allow API calls from React frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific origins
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:3000",      // React development server
                "http://localhost:3001",      // Alternative port
                "https://corehive-frontend-app-cmbucjbga2e6amey.southeastasia-01.azurewebsites.net" // production frontend url
        ));

        // Allow specific HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Allow specific headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Pre-flight request cache duration
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}