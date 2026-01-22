# Fix for Backend Startup Errors

## Issues Identified

### 1. ClassNotFoundException: DepartmentDTO
**Root Cause**: Stale compiled classes referencing a `DepartmentMapperImpl` that doesn't exist in the current codebase.

**Solution**: Clean and recompile the project (COMPLETED ✓)
```bash
./mvnw.cmd clean compile
```

### 2. Data Truncation Error for Attendance Status
**Root Cause**: The database table `attendance` has rows with invalid `status` values that don't match the enum definition.

**Error Message**: 
```
Data truncated for column 'status' at row 7
```

**Valid Status Values**:
- PRESENT
- ABSENT
- LATE
- HALF_DAY
- ON_LEAVE
- WORK_FROM_HOME

## Steps to Fix the Database Issue

### Step 1: Connect to MySQL
Open MySQL Workbench or command line and connect to your database:
```sql
mysql -u root -p
-- Enter password: 1234
USE corehive_db;
```

### Step 2: Identify Invalid Data
Run this query to find rows with invalid status values:
```sql
SELECT id, employee_id, attendance_date, status 
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');
```

Also check all distinct status values:
```sql
SELECT DISTINCT status FROM attendance ORDER BY status;
```

### Step 3: Fix the Invalid Data

**Option A: Set invalid statuses to a default value**
```sql
-- Update all invalid status values to 'PRESENT'
UPDATE attendance 
SET status = 'PRESENT' 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');
```

**Option B: Delete rows with invalid status (if data is not critical)**
```sql
DELETE FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');
```

**Option C: Map specific invalid values to valid ones**
If you know what the invalid values are, you can map them specifically:
```sql
-- Example: if status is 'checked_in', change to 'PRESENT'
UPDATE attendance SET status = 'PRESENT' WHERE status = 'checked_in';
-- Add more mappings as needed
```

### Step 4: Verify the Fix
```sql
-- Should return 0
SELECT COUNT(*) as invalid_count 
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');
```

### Step 5: Restart the Backend
After fixing the database:
1. Stop the backend if running
2. Run the backend application again

## Quick Fix Commands (Run in MySQL)

```sql
USE corehive_db;

-- Check the problem
SELECT DISTINCT status FROM attendance;

-- Fix by setting invalid values to PRESENT (safest option)
UPDATE attendance 
SET status = 'PRESENT' 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- Verify fix
SELECT COUNT(*) FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');
```

## Alternative: Temporary Workaround (Not Recommended)

If you want to temporarily bypass the strict schema validation:

1. Open `backend/src/main/resources/application.properties`
2. Change:
   ```properties
   spring.jpa.hibernate.ddl-auto=update
   ```
   to:
   ```properties
   spring.jpa.hibernate.ddl-auto=none
   ```

**Warning**: This will prevent Hibernate from updating your schema automatically. You'll need to manage schema changes manually.

## After Fixing

1. The backend should start successfully
2. Check the logs for any remaining errors
3. Test the attendance functionality to ensure everything works

## Prevention

To prevent this issue in the future:
1. Always use the enum constants when inserting attendance records
2. Add database constraints to enforce enum values
3. Validate data before inserting into the database
