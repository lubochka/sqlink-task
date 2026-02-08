cd "C:\Users\lubao\Documents\sqlink task"

# === UNZIP ===
Write-Host "`n=== EXTRACTING ZIPS ===" -ForegroundColor Magenta
Remove-Item -Recurse -Force TransactionWorkflow_ApproachA -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force TransactionWorkflow_ApproachB -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force TransactionWorkflow_ApproachD -ErrorAction SilentlyContinue
Expand-Archive -Path "TransactionWorkflow_ApproachA.zip" -DestinationPath "TransactionWorkflow_ApproachA" -Force
Expand-Archive -Path "TransactionWorkflow_ApproachB.zip" -DestinationPath "TransactionWorkflow_ApproachB" -Force
Expand-Archive -Path "TransactionWorkflow_ApproachD.zip" -DestinationPath "TransactionWorkflow_ApproachD" -Force
Write-Host "Extracted all 3" -ForegroundColor Green

# === FIX KNOWN BUGS ===
Write-Host "`n=== FIXING Program.cs USING PLACEMENT ===" -ForegroundColor Magenta
foreach ($approach in @("TransactionWorkflow_ApproachB", "TransactionWorkflow_ApproachD")) {
    $f = "$approach\TransactionWorkflow.API\Program.cs"
    if (Test-Path $f) {
        $lines = Get-Content $f
        $lines = $lines | Where-Object { $_ -ne "using TransactionWorkflow.API.Middleware;" }
        $lines = @("using TransactionWorkflow.API.Middleware;") + $lines
        Set-Content $f $lines
        Write-Host "Fixed $approach" -ForegroundColor Green
    }
}

# === BUILD ===
foreach ($name in @("TransactionWorkflow_ApproachA", "TransactionWorkflow_ApproachB", "TransactionWorkflow_ApproachD")) {
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    $sln = "$name\TransactionWorkflow.sln"
    dotnet restore $sln 2>&1 | Select-Object -Last 2
    $output = dotnet build $sln --no-restore 2>&1
    $summary = $output | Select-Object -Last 3
    $errors = $output | Select-String "error CS"
    $summary | Write-Host
    if ($errors) {
        Write-Host "ERRORS FOUND:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    } else {
        Write-Host "BUILD OK" -ForegroundColor Green
    }
}

Write-Host "`n=== DONE ===" -ForegroundColor Green