package com.corehive.backend.service;

import com.corehive.backend.dto.request.CreateSupportTicketDTO;
import com.corehive.backend.dto.response.SupportTicketResponseDTO;
import com.corehive.backend.model.SupportTicket;
import com.corehive.backend.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;

    /**
     * Create a new support ticket
     */
    public SupportTicketResponseDTO createTicket(
            CreateSupportTicketDTO dto,
            Long userId,
            String userName,
            String userEmail,
            String userRole,
            String organizationUuid,
            String organizationName
    ) {
        SupportTicket ticket = SupportTicket.builder()
                .organizationUuid(organizationUuid)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .userRole(userRole)
                .organizationName(organizationName)
                .ticketType(dto.getTicketType())
                .priority(dto.getPriority())
                .status(SupportTicket.Status.OPEN)
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .isRead(false)
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToDTO(saved);
    }

    /**
     * Get all tickets (for sys admin) with pagination
     */
    public Page<SupportTicketResponseDTO> getAllTickets(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get tickets by type
     */
    public Page<SupportTicketResponseDTO> getTicketsByType(
            SupportTicket.TicketType type, 
            int page, 
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketRepository.findByTicketTypeOrderByCreatedAtDesc(type, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get tickets by status
     */
    public Page<SupportTicketResponseDTO> getTicketsByStatus(
            SupportTicket.Status status, 
            int page, 
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Get user's own tickets
     */
    public List<SupportTicketResponseDTO> getUserTickets(Long userId) {
        return supportTicketRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Search tickets
     */
    public Page<SupportTicketResponseDTO> searchTickets(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return supportTicketRepository.searchTickets(search, pageable)
                .map(this::mapToDTO);
    }

    /**
     * Mark ticket as read
     */
    public SupportTicketResponseDTO markAsRead(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setIsRead(true);
        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToDTO(saved);
    }

    /**
     * Reply to ticket
     */
    public SupportTicketResponseDTO replyToTicket(
            Long ticketId, 
            String reply, 
            Long adminId
    ) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setAdminReply(reply);
        ticket.setRepliedBy(adminId);
        ticket.setRepliedAt(LocalDateTime.now());
        ticket.setIsRead(true);
        ticket.setStatus(SupportTicket.Status.IN_PROGRESS);
        
        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToDTO(saved);
    }

    /**
     * Update ticket status
     */
    public SupportTicketResponseDTO updateTicketStatus(
            Long ticketId, 
            SupportTicket.Status status
    ) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(status);
        
        if (status == SupportTicket.Status.RESOLVED || status == SupportTicket.Status.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        
        SupportTicket saved = supportTicketRepository.save(ticket);
        return mapToDTO(saved);
    }

    /**
     * Get unread tickets count
     */
    public long getUnreadCount() {
        return supportTicketRepository.countByIsReadFalse();
    }

    /**
     * Get ticket by ID
     */
    public SupportTicketResponseDTO getTicketById(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToDTO(ticket);
    }

    /**
     * Delete ticket
     */
    public void deleteTicket(Long ticketId) {
        supportTicketRepository.deleteById(ticketId);
    }

    // Helper method to map entity to DTO
    private SupportTicketResponseDTO mapToDTO(SupportTicket ticket) {
        return SupportTicketResponseDTO.builder()
                .id(ticket.getId())
                .organizationUuid(ticket.getOrganizationUuid())
                .userId(ticket.getUserId())
                .userName(ticket.getUserName())
                .userEmail(ticket.getUserEmail())
                .userRole(ticket.getUserRole())
                .organizationName(ticket.getOrganizationName())
                .ticketType(ticket.getTicketType())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .isRead(ticket.getIsRead())
                .adminReply(ticket.getAdminReply())
                .repliedBy(ticket.getRepliedBy())
                .repliedAt(ticket.getRepliedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .build();
    }
}
