package com.corehive.backend.service;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.model.Subscription;
import com.corehive.backend.model.SubscriptionStatus;
import com.corehive.backend.model.PaymentTransaction;
import com.corehive.backend.repository.PaymentTransactionRepository;
import com.corehive.backend.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionManagementServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @InjectMocks
    private SubscriptionManagementService subscriptionManagementService;

    private Subscription activeSubscription;
    private final String ORG_UUID = "test-org-uuid";

    @BeforeEach
    void setUp() {
        // Setup initial expected data for the tests
        activeSubscription = new Subscription();
        activeSubscription.setId(1L);
        activeSubscription.setOrganizationUuid(ORG_UUID);
        activeSubscription.setPlanName("Professional");
        activeSubscription.setStatus(SubscriptionStatus.ACTIVE);
        activeSubscription.setPlanPrice(new java.math.BigDecimal("599.00"));
        activeSubscription.setIsTrial(false);
    }

    @Test
    void testCheckSubscription_Active() {
        // Arrange - mock an existing active subscription
        when(subscriptionRepository.findByOrganizationUuid(ORG_UUID))
                .thenReturn(Optional.of(activeSubscription));

        // Act - call the service method
        ApiResponse<Map<String, Object>> response = subscriptionManagementService.checkSubscription(ORG_UUID);

        // Assert - verify the response structure and values
        assertTrue(response.isSuccess(), "Response should be success");
        assertNotNull(response.getData(), "Data should not be null");
        
        Map<String, Object> data = response.getData();
        assertTrue((Boolean) data.get("hasSubscription"), "Should return true for hasSubscription");
        assertEquals("Professional", data.get("planName"));
        assertEquals(SubscriptionStatus.ACTIVE, data.get("status"));
        
        // Verify repository interaction
        verify(subscriptionRepository, times(1)).findByOrganizationUuid(ORG_UUID);
    }

    @Test
    void testCheckSubscription_NoSubscription() {
        // Arrange - mock scenario where no subscription exists for the organization
        when(subscriptionRepository.findByOrganizationUuid("empty-org"))
                .thenReturn(Optional.empty());

        // Act
        ApiResponse<Map<String, Object>> response = subscriptionManagementService.checkSubscription("empty-org");

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        
        Map<String, Object> data = response.getData();
        assertFalse((Boolean) data.get("hasSubscription"), "Should return false if no subscription found");
    }

    @Test
    void testCancelSubscription_Success() {
        // Arrange - mock finding the subscription to cancel
        when(subscriptionRepository.findByOrganizationUuid(ORG_UUID))
                .thenReturn(Optional.of(activeSubscription));
                
        // Mock save operation (just return the modified subscription)
        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(activeSubscription);

        // Act - execute cancellation
        ApiResponse<String> response = subscriptionManagementService.cancelSubscription(ORG_UUID);

        // Assert
        assertTrue(response.isSuccess(), "Should successfully cancel");
        assertEquals("Subscription cancelled successfully", response.getMessage());
        assertNull(response.getData());
        
        // Verify that status changed to CANCELED before saving
        assertEquals(SubscriptionStatus.CANCELED, activeSubscription.getStatus());
        verify(subscriptionRepository, times(1)).save(activeSubscription);
    }

    @Test
    void testCancelSubscription_NotFound() {
        // Arrange - Mock not finding the subscription
        when(subscriptionRepository.findByOrganizationUuid("invalid-uuid"))
                .thenReturn(Optional.empty());

        // Act - attempt cancel
        ApiResponse<String> response = subscriptionManagementService.cancelSubscription("invalid-uuid");

        // Assert - should return error response
        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Subscription not found"));
        
        // Ensure save is never called if not found
        verify(subscriptionRepository, never()).save(any());
    }
}
