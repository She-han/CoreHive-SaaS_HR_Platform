# Support Ticket System Implementation

## Overview
Comprehensive support ticket system for users to request support, report bugs, and submit system feedback. System admins can view, manage, reply to, and track all tickets.

---

## Backend Components

### 1. Entity: `SupportTicket.java`
**Location:** `backend/src/main/java/com/corehive/backend/model/SupportTicket.java`

**Enums:**
- `TicketType`: SUPPORT_REQUEST, BUG_REPORT, SYSTEM_FEEDBACK
- `Priority`: LOW, MEDIUM, HIGH, CRITICAL
- `Status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED

**Fields:**
- Basic: id, organizationUuid, userId, userName, userEmail, userRole
- Ticket Data: ticketType, priority, status, subject, description, attachmentUrl
- Admin Actions: isRead, adminReply, repliedBy, repliedAt
- Timestamps: createdAt, updatedAt, resolvedAt

**Annotations:** 
- @Entity, @Builder, @CreationTimestamp, @UpdateTimestamp

---

### 2. DTOs

#### `CreateSupportTicketDTO.java`
**Location:** `backend/src/main/java/com/corehive/backend/dto/request/CreateSupportTicketDTO.java`
- ticketType (required)
- priority (required)
- subject (required)
- description (required)
- attachmentUrl (optional)

#### `SupportTicketResponseDTO.java`
**Location:** `backend/src/main/java/com/corehive/backend/dto/response/SupportTicketResponseDTO.java`
- All entity fields mapped to DTO
- Used for API responses

---

### 3. Repository: `SupportTicketRepository.java`
**Location:** `backend/src/main/java/com/corehive/backend/repository/SupportTicketRepository.java`

**Methods:**
- `findAllByOrderByCreatedAtDesc(Pageable)` - Get all tickets paginated
- `findByTicketTypeOrderByCreatedAtDesc(TicketType)` - Filter by type
- `findByStatusOrderByCreatedAtDesc(Status)` - Filter by status
- `findByUserIdOrderByCreatedAtDesc(String)` - Get user's tickets
- `findByOrganizationUuidOrderByCreatedAtDesc(String, Pageable)` - Org tickets
- `countByIsReadFalse()` - Count unread tickets
- `searchTickets(String, Pageable)` - Search by subject/description

---

### 4. Service: `SupportTicketService.java`
**Location:** `backend/src/main/java/com/corehive/backend/service/SupportTicketService.java`

**Methods:**
- `createTicket()` - Create new ticket with user details
- `getAllTickets()` - Get all with pagination
- `getTicketsByType()` - Filter by type
- `getTicketsByStatus()` - Filter by status
- `getUserTickets()` - Get user's own tickets
- `searchTickets()` - Search functionality
- `getTicketById()` - Get single ticket
- `markAsRead()` - Mark ticket as read
- `replyToTicket()` - Admin reply with timestamp and name
- `updateTicketStatus()` - Change ticket status (auto-resolve timestamp)
- `getUnreadCount()` - Get count of unread tickets
- `deleteTicket()` - Remove ticket
- `mapToDTO()` - Entity to DTO conversion

**Transaction:** All write operations use @Transactional

---

### 5. Controller: `SupportTicketController.java`
**Location:** `backend/src/main/java/com/corehive/backend/controller/SupportTicketController.java`

**Endpoints:**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/support-tickets` | Authenticated | Create ticket |
| GET | `/api/support-tickets` | SYSTEM_ADMIN | Get all (paginated) |
| GET | `/api/support-tickets/type/{type}` | SYSTEM_ADMIN | Filter by type |
| GET | `/api/support-tickets/status/{status}` | SYSTEM_ADMIN | Filter by status |
| GET | `/api/support-tickets/my-tickets` | Authenticated | User's tickets |
| GET | `/api/support-tickets/search` | SYSTEM_ADMIN | Search tickets |
| GET | `/api/support-tickets/{id}` | Authenticated | Get single ticket |
| PUT | `/api/support-tickets/{id}/mark-read` | SYSTEM_ADMIN | Mark as read |
| PUT | `/api/support-tickets/{id}/reply` | SYSTEM_ADMIN | Reply to ticket |
| PUT | `/api/support-tickets/{id}/status` | SYSTEM_ADMIN | Update status |
| GET | `/api/support-tickets/unread-count` | SYSTEM_ADMIN | Get unread count |
| DELETE | `/api/support-tickets/{id}` | SYSTEM_ADMIN | Delete ticket |

**Security:**
- User info extracted from JWT authentication
- Role-based access control with @PreAuthorize
- Users can only view their own tickets
- System admins have full access

---

## Frontend Components

### 1. API Client: `supportTicketApi.js`
**Location:** `frontend/src/api/supportTicketApi.js`

**Functions:**
- `createSupportTicket(ticketData)` - Create new ticket
- `getAllTickets(page, size)` - Get all tickets (admin)
- `getTicketsByType(type, page, size)` - Filter by type
- `getTicketsByStatus(status, page, size)` - Filter by status
- `getMyTickets()` - Get user's own tickets
- `searchTickets(query, page, size)` - Search functionality
- `getTicketById(id)` - Get single ticket
- `markTicketAsRead(id)` - Mark as read
- `replyToTicket(id, reply)` - Submit admin reply
- `updateTicketStatus(id, status)` - Change status
- `getUnreadCount()` - Get unread count
- `deleteTicket(id)` - Delete ticket

All functions use axios with automatic JWT token injection.

---

### 2. User Component: `RequestSupportOrBugReport.jsx`
**Location:** `frontend/src/pages/support/RequestSupportOrBugReport.jsx`

**Features:**
- **3 Tabs:** Support Request, Bug Report, System Feedback
- **Tab Design:** Color-coded with icons (MessageCircle, Bug, FileText)
- **Form Fields:**
  - Priority selector (LOW, MEDIUM, HIGH, CRITICAL)
  - Subject input (required)
  - Description textarea (required)
  - Attachment URL input (optional)
- **Submission:** SweetAlert confirmation, form reset on success
- **My Tickets Section:**
  - Auto-refresh capability
  - Status and priority badges
  - Admin reply display (green highlighted box)
  - Unread indicator
  - Ticket type badges
  - Date formatting
- **Loading States:** Spinner for submission and ticket fetching

**Icons Used:** Lucide-react icons for consistent design
**Styling:** Theme colors (#02C39A, #05668D, #0C397A)

---

### 3. Admin Component: `Support.jsx`
**Location:** `frontend/src/pages/admin/Support.jsx`

**Features:**
- **Header:**
  - Title and description
  - Unread count badge (red, prominent)
  
- **Filters Section:**
  - Search bar (queries subject/description)
  - Ticket type dropdown (ALL, SUPPORT_REQUEST, BUG_REPORT, SYSTEM_FEEDBACK)
  - Status dropdown (ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED)
  - Refresh button with loading state

- **Tickets List:**
  - Card-based layout
  - Green border for unread tickets
  - Type-specific icons (color-coded)
  - Status and priority badges (color-coded)
  - "NEW" badge for unread tickets
  - User information display (name, email, role, timestamp)
  - Admin reply display (green box with timestamp and admin name)
  - Attachment links (if present)
  
- **Action Buttons (per ticket):**
  - Mark as Read (only visible for unread)
  - Reply (opens modal)
  - Status dropdown (inline update)
  - Delete (with confirmation)

- **Reply Modal:**
  - Shows original message
  - Rich textarea for reply
  - Cancel/Send buttons
  - Pre-fills existing reply (for editing)

- **Pagination:**
  - Previous/Next buttons
  - Current page indicator
  - Disabled states

**Color Coding:**
- Status: OPEN (blue), IN_PROGRESS (yellow), RESOLVED (green), CLOSED (gray)
- Priority: LOW (blue), MEDIUM (yellow), HIGH (orange), CRITICAL (red)
- Ticket Types: Support (teal), Bug (red), Feedback (blue)

---

## User Flows

### User Flow (All authenticated users)
1. Navigate to Support/Feedback page
2. Select ticket type (tab)
3. Choose priority level
4. Enter subject and description
5. Optionally add attachment URL
6. Submit ticket
7. View submitted tickets in "My Tickets" section
8. See admin replies when available
9. Track ticket status

### Admin Flow (SYSTEM_ADMIN only)
1. Navigate to Support Tickets admin page
2. View unread count in header
3. Use filters to find specific tickets:
   - Search by keywords
   - Filter by type
   - Filter by status
4. View ticket details (user info, description, timestamps)
5. Mark tickets as read
6. Reply to tickets (users receive notification)
7. Update ticket status (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
8. Delete closed/spam tickets
9. Use pagination for large datasets

---

## Integration Notes

### Database Migration Required
Create table `support_tickets` with columns:
- id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- organization_uuid (VARCHAR)
- user_id (VARCHAR)
- user_name (VARCHAR)
- user_email (VARCHAR)
- user_role (VARCHAR)
- ticket_type (VARCHAR) - enum
- priority (VARCHAR) - enum
- status (VARCHAR) - enum
- subject (VARCHAR)
- description (TEXT)
- attachment_url (VARCHAR)
- is_read (BOOLEAN, default false)
- admin_reply (TEXT)
- replied_by (VARCHAR)
- replied_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- resolved_at (TIMESTAMP)

**Indexes:**
- organization_uuid
- user_id
- ticket_type
- status
- is_read
- created_at (DESC)

---

## Routing Setup

Add these routes to your React Router:

```jsx
// User routes (all authenticated users)
<Route path="/support/request" element={<RequestSupportOrBugReport />} />

// Admin routes (SYSTEM_ADMIN only)
<Route path="/admin/support" element={<Support />} />
```

---

## Security Considerations

1. **Authentication:** JWT token required for all endpoints
2. **Authorization:** Role-based access control
   - All authenticated users can create and view own tickets
   - Only SYSTEM_ADMIN can view all tickets and take actions
3. **User Context:** User details extracted from JWT, not client input
4. **Organization Isolation:** Tickets filtered by organization UUID
5. **Input Validation:** Required fields enforced on frontend and backend
6. **XSS Protection:** All user inputs sanitized before display

---

## Testing Checklist

### User Testing
- [ ] Create support request ticket
- [ ] Create bug report ticket
- [ ] Create system feedback ticket
- [ ] Submit with all priority levels
- [ ] Submit with attachment URL
- [ ] View own tickets list
- [ ] See admin reply when received
- [ ] Verify ticket status updates reflect

### Admin Testing
- [ ] View all tickets with pagination
- [ ] Search tickets by keywords
- [ ] Filter by ticket type
- [ ] Filter by status
- [ ] Mark ticket as read (unread count decreases)
- [ ] Reply to ticket
- [ ] Update ticket status (all transitions)
- [ ] Delete ticket (with confirmation)
- [ ] Verify unread count badge
- [ ] Test with multiple organizations

### Edge Cases
- [ ] Empty ticket list
- [ ] Very long subject/description
- [ ] Special characters in input
- [ ] Invalid attachment URLs
- [ ] Concurrent updates
- [ ] Network errors handling

---

## Future Enhancements

1. **Email Notifications:**
   - Notify users when admin replies
   - Notify admins of new tickets
   - Daily digest of unread tickets

2. **File Upload:**
   - Replace URL input with actual file upload
   - Store in S3/cloud storage
   - Support multiple attachments

3. **Ticket Assignment:**
   - Assign tickets to specific admins
   - Track workload distribution
   - Assignment history

4. **Analytics Dashboard:**
   - Ticket volume trends
   - Average resolution time
   - Priority distribution
   - User satisfaction ratings

5. **Categories/Tags:**
   - Allow custom categorization
   - Tag-based filtering
   - Related ticket suggestions

6. **SLA Management:**
   - Define response time SLAs by priority
   - Track SLA compliance
   - Escalation workflows

7. **Internal Notes:**
   - Admin-only notes on tickets
   - Private communication between admins
   - Audit trail

---

## Theme Colors Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Teal) | #02C39A | Buttons, links, active states |
| Secondary (Blue) | #05668D | Feedback icon, secondary elements |
| Dark (Navy) | #0C397A | Headers, titles, text |
| Success (Green) | #1ED292 | Success messages, approved |
| Background (Mint) | #F1FDF9 | Hover states, backgrounds |
| Error (Red) | #EF4444 | Delete buttons, critical priority |
| Warning (Yellow) | #F59E0B | Medium priority, in-progress |
| Info (Blue) | #3B82F6 | Low priority, open status |
| Orange | #F97316 | High priority |

---

## Component Dependencies

**Lucide-react icons:**
- MessageCircle, Bug, FileText (ticket types)
- Search, Filter (filtering)
- Mail, User, Clock (user info)
- AlertCircle, CheckCircle, XCircle (status icons)
- RefreshCw (loading/refresh)
- Send (submit/reply)
- Trash2 (delete)
- Eye, EyeOff (read status)
- Upload (attachment)
- ChevronRight (navigation)

**Libraries:**
- SweetAlert2 (confirmations and alerts)
- Axios (API calls)
- Redux (user authentication state)

---

## API Error Handling

All API calls wrapped in try-catch blocks with SweetAlert error messages:
- Network errors
- 404 Not Found
- 403 Forbidden (permission denied)
- 500 Server errors
- Validation errors

User-friendly error messages displayed with appropriate icons and colors.

---

## Accessibility Features

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- High contrast text
- Loading states with spinners
- Clear error messages
- Disabled state indicators

---

## Performance Optimizations

1. **Pagination:** Limit 10 tickets per page
2. **Lazy Loading:** Only fetch when filters change
3. **Debounced Search:** Prevent excessive API calls
4. **Memoization:** Use React.memo for expensive components
5. **Conditional Rendering:** Hide/show modals efficiently
6. **Index Optimization:** Database indexes on frequently queried fields

---

## Documentation Complete
System is production-ready with comprehensive features for user support, bug reporting, and system feedback collection.
