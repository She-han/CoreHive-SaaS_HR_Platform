-- Quick Fix Script for Attendance Status Issue
-- Run this in MySQL Workbench or any MySQL client

USE corehive_db;

-- Step 1: Backup the current data (optional but recommended)
CREATE TABLE IF NOT EXISTS attendance_backup_20260106 AS SELECT * FROM attendance;

-- Step 2: Check what status values are causing the issue
SELECT 
    status,
    COUNT(*) as count
FROM attendance 
GROUP BY status
ORDER BY status;

-- Step 3: Check specifically for invalid values
SELECT 
    id,
    employee_id,
    attendance_date,
    status,
    check_in_time,
    check_out_time
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME')
ORDER BY id;

-- Step 4: Fix the invalid status values
-- This will set all invalid statuses to 'PRESENT'
UPDATE attendance 
SET status = 'PRESENT' 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- Step 5: Verify the fix
SELECT 
    'Invalid records remaining:' as message,
    COUNT(*) as count
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- Step 6: Show the final status distribution
SELECT 
    status,
    COUNT(*) as count
FROM attendance 
GROUP BY status
ORDER BY status;

-- If everything looks good, you can restart the backend application
