-- Fix existing system_user records to set is_password_change_required to false by default
-- Run this in your MySQL database

USE corehive_db;

-- Update existing system_user records where is_password_change_required is NULL
UPDATE system_user 
SET is_password_change_required = FALSE 
WHERE is_password_change_required IS NULL;

-- Verify the update
SELECT id, username, email, is_password_change_required 
FROM system_user;
