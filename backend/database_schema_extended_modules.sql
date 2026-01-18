-- ==================================================
-- CoreHive Extended Modules & Organization Modules
-- Database Schema and Initial Seed Data
-- ==================================================

-- Drop existing tables if they exist (for development/testing)
DROP TABLE IF EXISTS organization_modules;
DROP TABLE IF EXISTS extended_modules;

-- ==================================================
-- Extended Modules Table
-- Stores available modules that organizations can subscribe to
-- ==================================================
CREATE TABLE extended_modules (
    module_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    module_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_module_key (module_key),
    INDEX idx_is_active (is_active),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- Organization Modules Junction Table
-- Many-to-many relationship between organizations and extended modules
-- ==================================================
CREATE TABLE organization_modules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    module_id BIGINT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES extended_modules(module_id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_org_module (organization_id, module_id),
    INDEX idx_org_id (organization_id),
    INDEX idx_module_id (module_id),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- Seed Extended Modules
-- Initial modules available in the CoreHive platform
-- ==================================================

INSERT INTO extended_modules (name, module_key, description, icon, category, price, is_active) VALUES
(
    'QR Code Attendance Marking',
    'moduleQrAttendanceMarking',
    'Enable employees to mark attendance using QR code scanning. Quick, contactless, and efficient attendance tracking.',
    'QrCode',
    'Attendance',
    199.99,
    TRUE
),
(
    'Face Recognition Attendance',
    'moduleFaceRecognitionAttendanceMarking',
    'AI-powered facial recognition for automated attendance tracking. Secure, fast, and accurate biometric authentication.',
    'ScanFace',
    'Attendance',
    499.99,
    TRUE
),
(
    'Employee Feedback System',
    'moduleEmployeeFeedback',
    'Collect and analyze employee feedback, conduct surveys, and track employee satisfaction scores.',
    'MessageSquare',
    'Engagement',
    149.99,
    TRUE
),
(
    'Hiring Management System',
    'moduleHiringManagement',
    'Complete recruitment workflow management. Track applicants, schedule interviews, and manage the hiring pipeline.',
    'Users',
    'Recruitment',
    299.99,
    TRUE
),
(
    'Performance Reviews',
    'modulePerformanceReviews',
    'Comprehensive performance evaluation system with 360-degree feedback and goal tracking.',
    'TrendingUp',
    'Performance',
    349.99,
    FALSE
),
(
    'Leave Management Pro',
    'moduleLeaveManagementPro',
    'Advanced leave management with automated approval workflows, leave balance tracking, and calendar integration.',
    'Calendar',
    'Leave',
    249.99,
    FALSE
),
(
    'Payroll Integration',
    'modulePayrollIntegration',
    'Seamless payroll processing with automated salary calculations, tax deductions, and compliance reporting.',
    'DollarSign',
    'Finance',
    599.99,
    FALSE
),
(
    'Training & Development',
    'moduleTrainingDevelopment',
    'Employee training programs, course management, and skill development tracking.',
    'GraduationCap',
    'Learning',
    279.99,
    FALSE
);

-- ==================================================
-- Verification Queries
-- ==================================================

-- Check extended modules
SELECT 
    module_id,
    name,
    module_key,
    category,
    price,
    is_active,
    created_at
FROM extended_modules
ORDER BY category, name;

-- Check if tables exist
SHOW TABLES LIKE '%modules%';

-- Verify table structures
DESCRIBE extended_modules;
DESCRIBE organization_modules;

-- ==================================================
-- Sample Queries for Testing
-- ==================================================

-- Get active modules only
SELECT * FROM extended_modules WHERE is_active = TRUE;

-- Get modules by category
SELECT * FROM extended_modules WHERE category = 'Attendance';

-- Count modules by status
SELECT 
    is_active,
    COUNT(*) as module_count,
    SUM(price) as total_value
FROM extended_modules
GROUP BY is_active;

-- ==================================================
-- Notes
-- ==================================================
-- 1. The organization_modules table will be populated when org_admins configure modules
-- 2. Module keys match the boolean field names in the Organization entity
-- 3. When a module's is_active is set to FALSE, org_admins won't see it in the configuration UI
-- 4. The junction table allows for subscription dates and expiration tracking
-- 5. Prices are stored for future billing/subscription features
