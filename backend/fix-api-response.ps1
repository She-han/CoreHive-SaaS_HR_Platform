# PowerShell script to fix ApiResponse.success() parameter order
# Changes from: ApiResponse.success("message", data)
# To: ApiResponse.success(data, "message")

Write-Host "Starting to fix ApiResponse.success() calls..." -ForegroundColor Green

$javaFiles = Get-ChildItem -Path "src/main/java" -Filter "*.java" -Recurse

$totalFixed = 0

foreach ($file in $javaFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern to match: ApiResponse.success("message", data)
    # This regex captures the message and data parts
    $pattern = 'ApiResponse\.success\("([^"]+)",\s*([^)]+)\)'
    
    # Replace with: ApiResponse.success(data, "message")
    $replacement = 'ApiResponse.success($2, "$1")'
    
    $content = $content -replace $pattern, $replacement
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Yellow
        $totalFixed++
    }
}

Write-Host "`nTotal files fixed: $totalFixed" -ForegroundColor Green
Write-Host "Done! Now run: ./mvnw clean compile" -ForegroundColor Cyan
