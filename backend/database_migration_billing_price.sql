-- Migration: Add billing_price_per_user_per_month column to organization table
-- Date: 2026-01-17
-- Description: Adds a column to store the monthly price per user for each organization

-- Add the new column to the organization table
ALTER TABLE organization
ADD COLUMN billing_price_per_user_per_month DECIMAL(10, 2) NULL
COMMENT 'Monthly billing price per user for this organization';

-- Optional: Update existing records with default values if needed
-- UPDATE organization SET billing_price_per_user_per_month = 0.00 WHERE billing_price_per_user_per_month IS NULL;

-- Verify the change
DESCRIBE organization;

-- Sample query to see the new column
SELECT 
    organization_uuid, 
    name, 
    billing_plan, 
    billing_price_per_user_per_month 
FROM organization 
LIMIT 5;
