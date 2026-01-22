-- Fix attendance status data truncation issue
-- This script checks for invalid status values and provides options to fix them

USE corehive_db;

-- 1. First, check what invalid status values exist
SELECT id, employee_id, attendance_date, status 
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- 2. Show all status values to identify the issue
SELECT DISTINCT status FROM attendance ORDER BY status;

-- 3. Option A: Update invalid status values to a default (PRESENT)
-- Uncomment the line below to execute
-- UPDATE attendance SET status = 'PRESENT' WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- 4. Option B: Delete rows with invalid status values (if they are not important)
-- Uncomment the line below to execute
-- DELETE FROM attendance WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- 5. After fixing the data, verify no invalid values remain
-- SELECT COUNT(*) as invalid_count FROM attendance WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');
