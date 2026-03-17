package com.corehive.backend.service;

import com.corehive.backend.dto.request.LoginRequest;
import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.LoginResponse;
import com.corehive.backend.model.SystemUser;
import com.corehive.backend.repository.*;
import com.corehive.backend.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // 1. Arrange: Mocks objects (DB, Utils)
    @Mock
    private SystemUserRepository systemUserRepository;
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private EmailService emailService;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private ExtendedModuleRepository extendedModuleRepository;
    @Mock
    private OrganizationModuleRepository organizationModuleRepository;
    @Mock
    private BillingPlanRepository billingPlanRepository;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private SubscriptionRepository subscriptionRepository;

    // 2. Arrange: create instance of service with @InjectMocks
    @InjectMocks
    private AuthService authService;

    private LoginRequest validLoginRequest;
    private SystemUser mockSystemAdmin;

    @BeforeEach
    void setUp() {
        // setup before run
        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail("admin@corehive.com");
        validLoginRequest.setPassword("password123");

        mockSystemAdmin = new SystemUser();
        mockSystemAdmin.setId(1L);
        mockSystemAdmin.setEmail("admin@corehive.com");
        mockSystemAdmin.setPasswordHash("hashed_password123");
        mockSystemAdmin.setIsActive(true);
        mockSystemAdmin.setIsPasswordChangeRequired(false);
    }

    @Test
    void testLogin_SuccessForSystemAdmin() {
        // Arrange - Define mock behaviors
        // Return mockSystemAdmin when searched by email
        when(systemUserRepository.findByEmailIgnoreCase("admin@corehive.com"))
                .thenReturn(Optional.of(mockSystemAdmin));
        
        // Mock password matching
        when(passwordEncoder.matches("password123", "hashed_password123"))
                .thenReturn(true);
        
        // Mock JWT token generation
        when(jwtUtil.generateToken(any(), eq("SYSTEM")))
                .thenReturn("mocked-jwt-token");

        // Act - Call the actual method
        ApiResponse<LoginResponse> response = authService.login(validLoginRequest);

        // Assert - Verify the expected state
        assertTrue(response.isSuccess(), "Response should be successful");
        assertNotNull(response.getData(), "Login response data shouldn't be null");
        assertEquals("mocked-jwt-token", response.getData().getToken(), "Token should match");
        assertEquals("SYS_ADMIN", response.getData().getRole(), "Role should be SYS_ADMIN");
        
        // Verify - Ensure repository was called
        verify(systemUserRepository, times(1)).findByEmailIgnoreCase("admin@corehive.com");
    }

    @Test
    void testLogin_FailureWithInvalidPassword() {
        // Arrange - Mock incorrect password scenario
        when(systemUserRepository.findByEmailIgnoreCase("admin@corehive.com"))
                .thenReturn(Optional.of(mockSystemAdmin));
        
        when(passwordEncoder.matches("password123", "hashed_password123"))
                .thenReturn(false); // Password mismatch

        // Act - Call the service method
        ApiResponse<LoginResponse> response = authService.login(validLoginRequest);

        // Assert - Response should fail
        assertFalse(response.isSuccess(), "Response should fail for invalid password");
        assertEquals("Invalid email or password", response.getMessage(), "Error message should match");
        assertNull(response.getData(), "Data should be null when failed");

        // Verify token generation was never called
        verify(jwtUtil, never()).generateToken(any(), anyString());
    }

    @Test
    void testLogin_FailureWithInactiveAccount() {
        // Arrange - Create an inactive admin
        mockSystemAdmin.setIsActive(false);
        when(systemUserRepository.findByEmailIgnoreCase("admin@corehive.com"))
                .thenReturn(Optional.of(mockSystemAdmin));
        
        when(passwordEncoder.matches("password123", "hashed_password123"))
                .thenReturn(true);

        // Act
        ApiResponse<LoginResponse> response = authService.login(validLoginRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Account is deactivated", response.getMessage());
    }
}
