package com.corehive.backend.service;

import com.corehive.backend.dto.response.ApiResponse;
import com.corehive.backend.dto.response.OrganizationSummaryResponse;
import com.corehive.backend.model.Organization;
import com.corehive.backend.model.OrganizationStatus;
import com.corehive.backend.repository.OrganizationRepository;
import com.corehive.backend.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization pendingOrg1;
    private Organization pendingOrg2;

    @BeforeEach
    void setUp() {
        pendingOrg1 = new Organization();
        pendingOrg1.setOrganizationUuid("uuid-1");
        pendingOrg1.setName("Org 1");
        pendingOrg1.setStatus(OrganizationStatus.PENDING_APPROVAL);

        pendingOrg2 = new Organization();
        pendingOrg2.setOrganizationUuid("uuid-2");
        pendingOrg2.setName("Org 2");
        pendingOrg2.setStatus(OrganizationStatus.PENDING_APPROVAL);
    }

    @Test
    void testGetPendingApprovals_Success() {
        // Arrange
        List<Organization> expectedList = Arrays.asList(pendingOrg1, pendingOrg2);
        when(organizationRepository.findPendingApprovals()).thenReturn(expectedList);
        
        // Mock the user count calculation that happens inside convertToSummaryResponse
        when(appUserRepository.countByOrganizationUuid(anyString())).thenReturn(5);

        // Act
        ApiResponse<List<OrganizationSummaryResponse>> response = organizationService.getPendingApprovals();

        // Assert
        assertTrue(response.isSuccess(), "Expected success but was false. Message: " + response.getMessage());
        assertNotNull(response.getData());
        assertEquals(2, response.getData().size());
        assertEquals("Org 1", response.getData().get(0).getName());
        assertEquals(5, response.getData().get(0).getUserCount());
        assertEquals("Org 2", response.getData().get(1).getName());
        
        // Verify mock interaction
        verify(organizationRepository, times(1)).findPendingApprovals();
        verify(appUserRepository, times(2)).countByOrganizationUuid(anyString());
    }

    @Test
    void testGetPendingApprovals_EmptyList() {
        // Arrange
        when(organizationRepository.findPendingApprovals()).thenReturn(Arrays.asList());

        // Act
        ApiResponse<List<OrganizationSummaryResponse>> response = organizationService.getPendingApprovals();

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertTrue(response.getData().isEmpty());

        verify(organizationRepository, times(1)).findPendingApprovals();
    }

    @Test
    void testGetPendingApprovals_ExceptionHandling() {
        // Arrange
        when(organizationRepository.findPendingApprovals()).thenThrow(new RuntimeException("Database error"));

        // Act
        ApiResponse<List<OrganizationSummaryResponse>> response = organizationService.getPendingApprovals();

        // Assert
        assertFalse(response.isSuccess());
        assertEquals("Failed to retrieve pending approvals", response.getMessage());
        assertNull(response.getData());
    }
}
