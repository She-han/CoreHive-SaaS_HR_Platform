-- =====================================================
-- CRITICAL FIX FOR ORGANIZATION APPROVAL ERROR
-- =====================================================
-- Problem: status column too small for APPROVED_PENDING_PAYMENT (24 chars)
-- Solution: Increase column size to VARCHAR(30)
-- Run this NOW before starting the server
-- =====================================================

USE corehive_db;

-- Show current column definition (likely VARCHAR(20) or similar)
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'corehive_db' 
  AND TABLE_NAME = 'organization' 
  AND COLUMN_NAME = 'status';

-- Fix the status column size
ALTER TABLE organization 
MODIFY COLUMN status VARCHAR(30) NOT NULL;

-- Verify the fix
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'corehive_db' 
  AND TABLE_NAME = 'organization' 
  AND COLUMN_NAME = 'status';

-- Show current organizations
SELECT 
    id,
    organization_uuid,
    name,
    status,
    created_at
FROM organization
ORDER BY created_at DESC;

-- =====================================================
-- DONE! Now you can start the Spring Boot server
-- =====================================================
