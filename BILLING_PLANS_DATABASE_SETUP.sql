-- ============================================================
-- Billing Plans System - Complete SQL Setup Script
-- ============================================================
-- This script creates all necessary tables and inserts sample data
-- for the Billing Plans management system

-- Ensure we're using the correct database
USE corehive_db;

-- ============================================================
-- 1. DROP EXISTING TABLES (if needed)
-- ============================================================
-- Uncomment these if you want to reset everything
-- DROP TABLE IF EXISTS plan_features;
-- DROP TABLE IF EXISTS billing_plans;

-- ============================================================
-- 2. CREATE billing_plans TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Plan name (Starter, Professional, etc)',
    price VARCHAR(50) NOT NULL COMMENT 'Price in LKR (2,500 or Custom)',
    period VARCHAR(50) NOT NULL COMMENT 'Billing period (/month, /year, etc)',
    description TEXT NOT NULL COMMENT 'Plan description for customers',
    employees VARCHAR(100) NOT NULL COMMENT 'Employee limit (e.g., Up to 25 employees)',
    popular BOOLEAN NOT NULL DEFAULT false COMMENT 'Mark as Most Popular plan',
    active BOOLEAN NOT NULL DEFAULT true COMMENT 'Plan is active/inactive',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    INDEX idx_active (active),
    INDEX idx_popular (popular),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Billing Plans';

-- ============================================================
-- 3. CREATE plan_features TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_features (
    billing_plan_id BIGINT NOT NULL COMMENT 'Foreign key to billing_plans',
    feature VARCHAR(255) NOT NULL COMMENT 'Feature name',
    FOREIGN KEY (billing_plan_id) REFERENCES billing_plans(id) ON DELETE CASCADE,
    INDEX idx_plan (billing_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Features for each billing plan';

-- ============================================================
-- 4. INSERT SAMPLE DATA - Plans
-- ============================================================
INSERT INTO billing_plans 
(name, price, period, description, employees, popular, active) 
VALUES
('Starter', '2,500', '/month', 'Perfect for small teams getting started', 'Up to 25 employees', false, true),
('Professional', '5,500', '/month', 'Ideal for growing businesses', 'Up to 100 employees', true, true),
('Enterprise', 'Custom', '', 'For large organizations', 'Unlimited employees', false, true);

-- ============================================================
-- 5. INSERT SAMPLE DATA - Features
-- ============================================================

-- Starter Plan Features (ID: 1)
INSERT INTO plan_features (billing_plan_id, feature) VALUES
(1, 'Employee Management'),
(1, 'Basic Payroll'),
(1, 'Leave Management'),
(1, 'Attendance Tracking'),
(1, 'Basic Reports'),
(1, 'Email Support');

-- Professional Plan Features (ID: 2)
INSERT INTO plan_features (billing_plan_id, feature) VALUES
(2, 'All Starter features'),
(2, 'Advanced Payroll'),
(2, 'Performance Tracking'),
(2, 'Employee Feedback'),
(2, 'Advanced Analytics'),
(2, 'Priority Support'),
(2, 'API Access');

-- Enterprise Plan Features (ID: 3)
INSERT INTO plan_features (billing_plan_id, feature) VALUES
(3, 'All Professional features'),
(3, 'Hiring Management'),
(3, 'Custom Integrations'),
(3, 'Advanced Security'),
(3, 'Dedicated Support'),
(3, 'Training & Onboarding');

-- ============================================================
-- 6. VERIFY DATA
-- ============================================================

-- Show all plans
SELECT '--- BILLING PLANS ---' AS 'Result';
SELECT * FROM billing_plans ORDER BY id;

-- Show all features
SELECT '--- PLAN FEATURES ---' AS 'Result';
SELECT bp.id, bp.name, GROUP_CONCAT(pf.feature SEPARATOR ', ') as features
FROM billing_plans bp
LEFT JOIN plan_features pf ON bp.id = pf.billing_plan_id
GROUP BY bp.id, bp.name
ORDER BY bp.id;

-- Count statistics
SELECT '--- STATISTICS ---' AS 'Result';
SELECT 
    COUNT(DISTINCT bp.id) as total_plans,
    SUM(CASE WHEN bp.popular = true THEN 1 ELSE 0 END) as popular_plans,
    SUM(CASE WHEN bp.active = true THEN 1 ELSE 0 END) as active_plans,
    COUNT(pf.feature) as total_features
FROM billing_plans bp
LEFT JOIN plan_features pf ON bp.id = pf.billing_plan_id;

-- ============================================================
-- 7. TABLE STRUCTURE INFORMATION
-- ============================================================
DESCRIBE billing_plans;
DESCRIBE plan_features;

-- ============================================================
-- 8. CLEANUP (Optional - Uncomment if you want to reset)
-- ============================================================
-- DELETE FROM plan_features;
-- DELETE FROM billing_plans;
-- ALTER TABLE billing_plans AUTO_INCREMENT = 1;

-- ============================================================
-- 9. USEFUL QUERIES FOR TESTING
-- ============================================================

-- Get active plans only
-- SELECT * FROM billing_plans WHERE active = true;

-- Get popular plans
-- SELECT * FROM billing_plans WHERE popular = true;

-- Get plan with its features
-- SELECT bp.*, GROUP_CONCAT(pf.feature) as features 
-- FROM billing_plans bp 
-- LEFT JOIN plan_features pf ON bp.id = pf.billing_plan_id 
-- WHERE bp.id = 1 
-- GROUP BY bp.id;

-- Update plan (example)
-- UPDATE billing_plans SET price = '3,000', updated_at = NOW() WHERE id = 1;

-- Delete plan (example - this will also delete its features due to CASCADE)
-- DELETE FROM billing_plans WHERE id = 1;

-- ============================================================
-- Setup Complete!
-- ============================================================
-- Your Billing Plans system is now ready to use
-- Backend: http://localhost:8080/api/billing-plans
-- Frontend: http://localhost:3000/admin/billing-plans
