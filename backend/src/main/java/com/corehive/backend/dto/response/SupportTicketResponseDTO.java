package com.corehive.backend.dto.response;

import com.corehive.backend.model.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketResponseDTO {
    private Long id;
    private String organizationUuid;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String organizationName;
    private SupportTicket.TicketType ticketType;
    private SupportTicket.Priority priority;
    private SupportTicket.Status status;
    private String subject;
    private String description;
    private Boolean isRead;
    private String adminReply;
    private Long repliedBy;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
