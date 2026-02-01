-- Fix organization status column size to accommodate APPROVED_PENDING_PAYMENT (24 chars)
-- Current column is likely VARCHAR(20), which is truncating the enum value

USE corehive_db;

-- Check current column definition
DESCRIBE organization;

-- Alter the status column to be large enough for all enum values
-- The longest value is APPROVED_PENDING_PAYMENT (24 characters)
-- Setting to VARCHAR(30) for safety
ALTER TABLE organization 
MODIFY COLUMN status VARCHAR(30) NOT NULL;

-- Verify the change
DESCRIBE organization;

-- Show organizations with their current status
SELECT 
    id,
    organization_uuid,
    name,
    status,
    created_at
FROM organization
ORDER BY created_at DESC
LIMIT 10;
