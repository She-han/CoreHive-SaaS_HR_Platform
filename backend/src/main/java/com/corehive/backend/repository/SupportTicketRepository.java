package com.corehive.backend.repository;

import com.corehive.backend.model.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    // Get all tickets (for sys admin)
    Page<SupportTicket> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Get tickets by type
    Page<SupportTicket> findByTicketTypeOrderByCreatedAtDesc(
            SupportTicket.TicketType ticketType, 
            Pageable pageable
    );

    // Get tickets by status
    Page<SupportTicket> findByStatusOrderByCreatedAtDesc(
            SupportTicket.Status status, 
            Pageable pageable
    );

    // Get tickets by user (for user to see their own tickets)
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Get unread tickets count
    long countByIsReadFalse();

    // Get tickets by organization
    Page<SupportTicket> findByOrganizationUuidOrderByCreatedAtDesc(
            String organizationUuid, 
            Pageable pageable
    );
    
    // Delete by organization UUID (for cascading deletes)
    int deleteByOrganizationUuid(String organizationUuid);

    // Search tickets
    @Query("SELECT t FROM SupportTicket t WHERE " +
           "LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.userName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.userEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY t.createdAt DESC")
    Page<SupportTicket> searchTickets(@Param("search") String search, Pageable pageable);
}
