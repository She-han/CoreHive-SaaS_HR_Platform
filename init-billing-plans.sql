-- Initialize Billing Plans Table with Sample Data
-- Run this SQL script in your MySQL database to populate initial billing plans

USE corehive_db;

-- Insert initial billing plans
INSERT INTO billing_plans (name, price, period, description, employees, popular, active, created_at, updated_at) VALUES
('Starter', '2,500', '/month', 'Perfect for small teams getting started', 'Up to 25 employees', false, true, NOW(), NOW()),
('Professional', '5,500', '/month', 'Ideal for growing businesses', 'Up to 100 employees', true, true, NOW(), NOW()),
('Enterprise', 'Custom', '', 'For large organizations', 'Unlimited employees', false, true, NOW(), NOW());

-- Insert features for Starter plan (ID: 1)
INSERT INTO plan_features (billing_plan_id, feature) VALUES
(1, 'Employee Management'),
(1, 'Basic Payroll'),
(1, 'Leave Management'),
(1, 'Attendance Tracking'),
(1, 'Basic Reports'),
(1, 'Email Support');

-- Insert features for Professional plan (ID: 2)
INSERT INTO plan_features (billing_plan_id, feature) VALUES
(2, 'All Starter features'),
(2, 'Advanced Payroll'),
(2, 'Performance Tracking'),
(2, 'Employee Feedback'),
(2, 'Advanced Analytics'),
(2, 'Priority Support'),
(2, 'API Access');

-- Insert features for Enterprise plan (ID: 3)
INSERT INTO plan_features (billing_plan_id, feature) VALUES
(3, 'All Professional features'),
(3, 'Hiring Management'),
(3, 'Custom Integrations'),
(3, 'Advanced Security'),
(3, 'Dedicated Support'),
(3, 'Training & Onboarding');

-- Verify the data was inserted correctly
SELECT * FROM billing_plans;
SELECT * FROM plan_features;
