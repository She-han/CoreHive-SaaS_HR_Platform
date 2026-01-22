# PowerShell script to fix attendance status using MySQL
# Make sure MySQL bin directory is in your PATH

$mysqlPath = "mysql"
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "corehive_db"
$dbUser = "root"
$dbPassword = "1234"

Write-Host "Fixing Attendance Status Issue..." -ForegroundColor Cyan

# SQL commands to fix the issue
$sqlCommands = @"
USE corehive_db;

-- Check for invalid values
SELECT 'Checking for invalid status values...' as message;
SELECT status, COUNT(*) as count 
FROM attendance 
GROUP BY status 
ORDER BY status;

SELECT CHAR(10) as '';
SELECT 'Invalid records:' as message;
SELECT id, employee_id, attendance_date, status 
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME')
LIMIT 10;

-- Fix the invalid status values
SELECT CHAR(10) as '';
SELECT 'Fixing invalid records...' as message;
UPDATE attendance 
SET status = 'PRESENT' 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

-- Verify the fix
SELECT CHAR(10) as '';
SELECT 'Verification:' as message;
SELECT COUNT(*) as remaining_invalid_count
FROM attendance 
WHERE status NOT IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME');

SELECT CHAR(10) as '';
SELECT 'Current status distribution:' as message;
SELECT status, COUNT(*) as count 
FROM attendance 
GROUP BY status 
ORDER BY status;
"@

# Try to run MySQL command
try {
    # Check if mysql is available
    $mysqlExists = Get-Command mysql -ErrorAction SilentlyContinue
    
    if (-not $mysqlExists) {
        Write-Host "`nMySQL command-line tool not found in PATH." -ForegroundColor Yellow
        Write-Host "Please do one of the following:" -ForegroundColor Yellow
        Write-Host "1. Add MySQL bin directory to your PATH" -ForegroundColor White
        Write-Host "   Example: C:\Program Files\MySQL\MySQL Server 8.0\bin" -ForegroundColor Gray
        Write-Host "2. Run the SQL commands manually in MySQL Workbench" -ForegroundColor White
        Write-Host "   File: fix_attendance_quick.sql" -ForegroundColor Gray
        Write-Host "3. Run the Java utility:" -ForegroundColor White
        Write-Host "   .\mvnw.cmd compile exec:java -Dexec.mainClass=`"com.corehive.backend.util.FixAttendanceStatus`"" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "`nConnecting to database..." -ForegroundColor Green
    
    # Save SQL to temp file
    $tempSql = [System.IO.Path]::GetTempFileName() + ".sql"
    $sqlCommands | Out-File -FilePath $tempSql -Encoding UTF8
    
    # Execute SQL using Get-Content and pipe
    Get-Content $tempSql | & mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPassword
    
    # Clean up
    Remove-Item $tempSql -Force
    
    Write-Host "`n Database fix completed!" -ForegroundColor Green
    Write-Host "You can now restart the backend application" -ForegroundColor Green
    
} catch {
    Write-Host "`n Error executing MySQL commands:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nPlease run fix_attendance_quick.sql manually in MySQL Workbench" -ForegroundColor Yellow
    exit 1
}
