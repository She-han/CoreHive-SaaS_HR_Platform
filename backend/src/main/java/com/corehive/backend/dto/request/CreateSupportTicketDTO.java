package com.corehive.backend.dto.request;

import com.corehive.backend.model.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupportTicketDTO {
    private SupportTicket.TicketType ticketType;
    private SupportTicket.Priority priority;
    private String subject;
    private String description;
}
