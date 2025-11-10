package com.corehive.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())// disable CSRF for API use
                //.cors(cors -> {})             // enable CORS from WebConfig
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/employees/**").permitAll() // allow employee endpoints
                        .anyRequest().authenticated()                      // other endpoints need login
                )
                .formLogin(login -> login.disable())  // disable default login form
                .httpBasic(httpBasic -> httpBasic.disable()); // disable basic auth (optional)
        return http.build();
    }
}
