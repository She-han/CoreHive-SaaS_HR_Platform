# Organization Status Column Fix - PowerShell Script
# This script will attempt to fix the database column size issue

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Organization Status Column Fix" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Database credentials
$dbHost = "localhost"
$dbPort = "3306"
$dbName = "corehive_db"
$dbUser = "root"

Write-Host "This script will fix the organization.status column size issue" -ForegroundColor Yellow
Write-Host ""
Write-Host "Problem: Column too small for 'APPROVED_PENDING_PAYMENT' (24 chars)" -ForegroundColor Red
Write-Host "Solution: Increase column size to VARCHAR(30)" -ForegroundColor Green
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL installation..." -ForegroundColor Cyan
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if ($null -eq $mysqlPath) {
    Write-Host "❌ MySQL command not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please use one of these methods instead:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1 - MySQL Workbench:" -ForegroundColor White
    Write-Host "  1. Open MySQL Workbench" -ForegroundColor Gray
    Write-Host "  2. Connect to corehive_db database" -ForegroundColor Gray
    Write-Host "  3. File → Open SQL Script → FIX_STATUS_COLUMN_NOW.sql" -ForegroundColor Gray
    Write-Host "  4. Execute the script" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Method 2 - Copy/Paste SQL:" -ForegroundColor White
    Write-Host "  Open any MySQL client and run:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  USE corehive_db;" -ForegroundColor Green
    Write-Host "  ALTER TABLE organization MODIFY COLUMN status VARCHAR(30) NOT NULL;" -ForegroundColor Green
    Write-Host ""
    Write-Host "See FIX_COMPLETE_GUIDE.md for detailed instructions" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "✅ MySQL found at: $($mysqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Prompt for password
$dbPassword = Read-Host "Enter MySQL root password" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

Write-Host ""
Write-Host "Executing SQL fix..." -ForegroundColor Cyan

# SQL to execute
$sql = @"
USE corehive_db;
ALTER TABLE organization MODIFY COLUMN status VARCHAR(30) NOT NULL;
SELECT 'SUCCESS: Column altered successfully' AS Result;
SHOW COLUMNS FROM organization WHERE Field = 'status';
"@

# Execute SQL
try {
    $sql | mysql -h $dbHost -P $dbPort -u $dbUser -p$plainPassword 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host " ✅ FIX APPLIED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. ✅ Database column fixed" -ForegroundColor Green
        Write-Host "2. 🔄 Restart Spring Boot server" -ForegroundColor Yellow
        Write-Host "3. ✅ Test organization approval" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error executing SQL" -ForegroundColor Red
        Write-Host "Please run the SQL manually using MySQL Workbench" -ForegroundColor Yellow
        Write-Host "See FIX_COMPLETE_GUIDE.md for instructions" -ForegroundColor Cyan
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run the SQL manually:" -ForegroundColor Yellow
    Write-Host "USE corehive_db;" -ForegroundColor Green
    Write-Host "ALTER TABLE organization MODIFY COLUMN status VARCHAR(30) NOT NULL;" -ForegroundColor Green
}

Write-Host ""
Read-Host "Press Enter to exit"
