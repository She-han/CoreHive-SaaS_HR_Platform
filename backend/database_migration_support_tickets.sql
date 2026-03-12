-- Migration script for Support Tickets System
-- Add organizationName column and remove attachmentUrl column

-- Add organization_name column
ALTER TABLE support_tickets
ADD COLUMN organization_name VARCHAR(255) AFTER user_role;

-- Drop attachment_url column
ALTER TABLE support_tickets
DROP COLUMN attachment_url;

-- Update existing records to have organization name (optional - if you have existing data)
-- UPDATE support_tickets st
-- JOIN organizations o ON st.organization_uuid = o.organization_uuid
-- SET st.organization_name = o.name
-- WHERE st.organization_name IS NULL;
