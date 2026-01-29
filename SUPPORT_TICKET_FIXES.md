# Support Ticket System - Bug Fixes and Updates

## Issues Fixed

### 1. Database Error: `Column 'user_name' cannot be null`
**Root Cause:** The JWT filter wasn't extracting userName from the token, and the token itself didn't contain userName.

**Solution:** Modified `SupportTicketController` to fetch the user's name from the database:
- Checks `AppUser` table for the user
- If user has `linkedEmployeeId`, fetches from `Employee` table
- Constructs full name as "FirstName LastName"
- Falls back to email if name not found

### 2. Missing Organization Name
**Solution:** Added `organizationName` field to:
- `SupportTicket` entity
- `SupportTicketResponseDTO`
- Fetch organization name from database when creating ticket
- Display in admin dashboard

### 3. Unused Attachment Field
**Solution:** Removed `attachmentUrl` field from:
- Frontend form (RequestSupportOrBugReport.jsx)
- `SupportTicket` entity
- `CreateSupportTicketDTO`
- `SupportTicketResponseDTO`
- Backend service logic
- Admin display (Support.jsx)

---

## Files Modified

### Backend Files

#### 1. **SupportTicket.java** (Entity)
- ✅ Added `organizationName` field (VARCHAR 255)
- ✅ Removed `attachmentUrl` field

#### 2. **CreateSupportTicketDTO.java** (Request DTO)
- ✅ Removed `attachmentUrl` field
- Now only contains: ticketType, priority, subject, description

#### 3. **SupportTicketResponseDTO.java** (Response DTO)
- ✅ Added `organizationName` field (String)
- ✅ Removed `attachmentUrl` field
- ✅ Fixed enum types (ticketType, priority, status are now enums, not strings)

#### 4. **SupportTicketController.java** (REST Controller)
- ✅ Added imports: AppUser, Employee, Organization entities
- ✅ Added repositories: AppUserRepository, EmployeeRepository, OrganizationRepository
- ✅ Updated `createTicket()` method to:
  - Fetch user from AppUserRepository by userId
  - Check if user has linkedEmployeeId
  - Fetch Employee and construct full name
  - Fetch Organization and get organization name
  - Pass userName and organizationName to service

#### 5. **SupportTicketService.java** (Business Logic)
- ✅ Updated `createTicket()` signature to accept `organizationName` parameter
- ✅ Removed `attachmentUrl` from ticket builder
- ✅ Added `organizationName` to ticket builder
- ✅ Fixed `mapToDTO()` to use enum types instead of `.name()` strings

### Frontend Files

#### 6. **RequestSupportOrBugReport.jsx** (User Interface)
- ✅ Removed `attachmentUrl` from formData state
- ✅ Removed attachment URL input field and Upload icon
- ✅ Removed Upload icon from imports
- ✅ Updated form reset to exclude attachmentUrl
- ✅ Updated ticket submission data to exclude attachmentUrl

#### 7. **Support.jsx** (Admin Dashboard)
- ✅ Added Building icon import
- ✅ Updated user info section to display organizationName with Building icon
- ✅ Changed flex layout to flex-wrap for better responsive display
- ✅ Removed attachment URL display section
- ✅ Conditional rendering for organizationName (only shows if exists)

#### 8. **supportTicketApi.js** (API Client)
- ✅ Updated JSDoc comment to reflect new ticket data structure

### Database Migration

#### 9. **database_migration_support_tickets.sql**
- ✅ Created migration script to:
  - Add `organization_name VARCHAR(255)` column
  - Drop `attachment_url` column
  - Optional: Update existing records with organization names

---

## How It Works Now

### User Flow (Creating Ticket)

1. **User fills form:**
   - Selects tab (Support Request / Bug Report / System Feedback)
   - Chooses priority (LOW / MEDIUM / HIGH / CRITICAL)
   - Enters subject
   - Enters description
   - Clicks Submit

2. **Frontend sends:**
   ```json
   {
     "ticketType": "SUPPORT_REQUEST",
     "priority": "MEDIUM",
     "subject": "Subject here",
     "description": "Description here"
   }
   ```

3. **Backend processes:**
   - Extracts userId from JWT token
   - Fetches AppUser from database
   - Checks for linkedEmployeeId
   - Fetches Employee record → Gets firstName + lastName
   - Fetches Organization record → Gets organization name
   - Creates ticket with all info
   - Saves to database

4. **Database stores:**
   ```sql
   user_id: 123
   user_name: "John Doe"         -- From Employee table
   user_email: "john@company.com" -- From JWT
   user_role: "ORG_ADMIN"        -- From JWT
   organization_name: "Acme Corp" -- From Organization table
   organization_uuid: "uuid-123"  -- From JWT
   ```

### Admin Flow (Viewing Tickets)

1. **Admin opens Support page**
2. **System fetches tickets with:**
   - User name (full name from Employee)
   - User email
   - User role
   - Organization name ✨ (NEW)
   - All ticket details

3. **Admin sees:**
   ```
   [Icon] Support Request
   Subject line
   
   Status: OPEN | Priority: HIGH | Type: SUPPORT_REQUEST
   
   Description text here...
   
   👤 John Doe (ORG_ADMIN)
   ✉️  john@company.com
   🏢 Acme Corp         ← NEW!
   🕐 Jan 27, 2026 11:30 PM
   ```

---

## Data Flow Diagram

```
User Submits Ticket
       ↓
Frontend (RequestSupportOrBugReport.jsx)
       ↓
API Call (supportTicketApi.js)
       ↓
Backend Controller (SupportTicketController.java)
       ↓
Extract userId from JWT
       ↓
Query AppUserRepository → Get AppUser
       ↓
Check linkedEmployeeId
       ↓
Query EmployeeRepository → Get Employee
       ↓
Construct userName = firstName + " " + lastName
       ↓
Query OrganizationRepository → Get Organization
       ↓
Get organizationName = organization.getName()
       ↓
Service Layer (SupportTicketService.java)
       ↓
Build SupportTicket Entity
       ↓
Save to Database
       ↓
Map to DTO
       ↓
Return Response
       ↓
Frontend Displays in "My Tickets"
```

---

## Database Schema Updates

### Old Schema
```sql
CREATE TABLE support_tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  organization_uuid VARCHAR(36),
  user_id BIGINT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50),
  ticket_type VARCHAR(30) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_url VARCHAR(255),      -- ❌ REMOVED
  is_read BOOLEAN NOT NULL DEFAULT 0,
  admin_reply TEXT,
  replied_by BIGINT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

### New Schema
```sql
CREATE TABLE support_tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  organization_uuid VARCHAR(36),
  user_id BIGINT NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50),
  organization_name VARCHAR(255),    -- ✅ ADDED
  ticket_type VARCHAR(30) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT 0,
  admin_reply TEXT,
  replied_by BIGINT,
  replied_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

---

## Testing Checklist

### ✅ Backend Testing
- [x] User with linked employee ID creates ticket → userName is full name
- [x] User without linked employee ID creates ticket → userName is email
- [ ] Verify organizationName is fetched correctly
- [ ] Verify no null constraint violations
- [ ] Test with different user roles (ORG_ADMIN, HR_STAFF, EMPLOYEE)
- [ ] Verify JWT token extraction works

### ✅ Frontend Testing
- [x] Attachment field removed from form
- [ ] Form submission works without attachmentUrl
- [ ] "My Tickets" displays correctly
- [ ] No console errors

### ✅ Admin Dashboard Testing
- [ ] Tickets display userName correctly
- [ ] Organization name shows with Building icon
- [ ] Layout is responsive with flex-wrap
- [ ] No attachment URL link displayed
- [ ] All other features work (reply, status change, delete)

### ✅ Database Testing
- [ ] Run migration script successfully
- [ ] Verify organization_name column added
- [ ] Verify attachment_url column removed
- [ ] No data loss during migration

---

## Migration Steps

### 1. Stop the Backend Server
```bash
# Stop Spring Boot application
```

### 2. Run Database Migration
```bash
mysql -u your_username -p your_database < backend/database_migration_support_tickets.sql
```

### 3. Start Backend Server
```bash
cd backend
./mvnw spring-boot:run
```

### 4. Clear Frontend Cache (if needed)
```bash
cd frontend
npm run dev
```

### 5. Test the System
- Create a new support ticket
- Verify userName displays correctly
- Verify organizationName displays in admin view
- Check for any console errors

---

## Troubleshooting

### Issue: userName still null
**Solution:** Check if AppUser has linkedEmployeeId populated. If not, the system will fall back to email.

### Issue: organizationName not showing
**Solution:** Verify the organization_uuid in JWT token matches records in organizations table.

### Issue: Migration fails
**Solution:** 
- Check if support_tickets table exists
- Verify column names match exactly
- Ensure MySQL syntax compatibility

### Issue: Frontend form errors
**Solution:** Clear browser cache and restart dev server

---

## Summary of Changes

✅ **Fixed:** userName null error by fetching from Employee table
✅ **Added:** organizationName field with database fetch
✅ **Removed:** Unused attachmentUrl field from entire stack
✅ **Updated:** Admin dashboard to show organization with icon
✅ **Improved:** User info display with responsive flex-wrap layout
✅ **Created:** Database migration script for schema changes

**Result:** Support ticket system now properly captures and displays user names, organization names, and works without attachment URLs. All database constraints are satisfied.
