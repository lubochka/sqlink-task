##############################################################################
# Transaction Workflow Engine - Full Test Suite v2
# Tests all 3 approaches: A (Vanilla), B (Multi-Tenant DNA), D (Strategic Hybrid)
# Fixes: Migrate->EnsureCreated, using placement, B's entity-type routes
# Usage: .\testAll.ps1
##############################################################################

$ErrorActionPreference = "Continue"
$BASE = "C:\Users\lubao\Documents\sqlink task"
$API_PORT = 5000
$results = @()

function Write-Header($text) { Write-Host "`n$('='*60)" -ForegroundColor Magenta; Write-Host "  $text" -ForegroundColor Magenta; Write-Host "$('='*60)" -ForegroundColor Magenta }
function Write-Test($name, $pass, $detail) {
    $icon = if ($pass) { "PASS" } else { "FAIL" }
    $color = if ($pass) { "Green" } else { "Red" }
    Write-Host "  [$icon] $name" -ForegroundColor $color
    if ($detail) { Write-Host "        $detail" -ForegroundColor DarkGray }
    return [PSCustomObject]@{ Test=$name; Pass=$pass; Detail=$detail }
}

function Wait-ForApi($port, $maxWait) {
    Write-Host "  Waiting for API on port $port..." -ForegroundColor Yellow
    $elapsed = 0
    while ($elapsed -lt $maxWait) {
        try {
            $null = Invoke-RestMethod -Uri "http://localhost:$port/swagger/index.html" -Method Get -TimeoutSec 2 -ErrorAction Stop
            Write-Host "  API is UP after ${elapsed}s" -ForegroundColor Green
            return $true
        } catch { Start-Sleep -Seconds 3; $elapsed += 3 }
    }
    Write-Host "  API did not start within ${maxWait}s" -ForegroundColor Red
    return $false
}

function Fix-SourceCode($dir) {
    $programCs = Join-Path $dir "TransactionWorkflow.API\Program.cs"
    if (Test-Path $programCs) {
        # Fix 1: Migrate() -> EnsureCreated()
        $content = Get-Content $programCs -Raw
        if ($content -match "db\.Database\.Migrate\(\)") {
            $content = $content -replace "db\.Database\.Migrate\(\);", "db.Database.EnsureCreated();"
            Set-Content $programCs $content
            Write-Host "  [FIX] Migrate() -> EnsureCreated()" -ForegroundColor Yellow
        }

        # Fix 2: Misplaced 'using' statement
        $lines = Get-Content $programCs
        $hasBug = $lines | Select-String "^using TransactionWorkflow\.API\.Middleware;" | Where-Object { $_.LineNumber -gt 10 }
        if ($hasBug) {
            $lines = $lines | Where-Object { $_ -ne "using TransactionWorkflow.API.Middleware;" }
            $lines = @("using TransactionWorkflow.API.Middleware;") + $lines
            Set-Content $programCs $lines
            Write-Host "  [FIX] Moved misplaced 'using' to top" -ForegroundColor Yellow
        }
    }
}

function Test-Approach($name, $folder, $isMultiTenant) {
    Write-Header "TESTING $name"
    $testResults = @()
    $dir = Join-Path $BASE $folder

    # --- STEP 1: Extract fresh ---
    Write-Host "`n  [1/6] Extracting from zip..." -ForegroundColor Cyan
    $zipFile = Join-Path $BASE "$folder.zip"
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
    Expand-Archive -Path $zipFile -DestinationPath $dir -Force

    # --- STEP 2: Fix known issues ---
    Write-Host "  Applying source code fixes..." -ForegroundColor Yellow
    Fix-SourceCode $dir

    # --- STEP 3: Docker Compose Up ---
    Write-Host "`n  [2/6] Starting Docker containers..." -ForegroundColor Cyan
    Push-Location $dir
    docker-compose down -v 2>&1 | Out-Null
    $buildOutput = docker-compose up --build -d 2>&1
    $buildOk = $LASTEXITCODE -eq 0
    $testResults += Write-Test "Docker Build" $buildOk ""

    if (-not $buildOk) {
        Write-Host ($buildOutput | Out-String) -ForegroundColor Red
        Pop-Location
        return $testResults
    }

    # --- STEP 4: Wait for API ---
    Write-Host "`n  [3/6] Waiting for API startup..." -ForegroundColor Cyan
    $apiUp = Wait-ForApi $API_PORT 90
    $testResults += Write-Test "API Startup" $apiUp ""

    if (-not $apiUp) {
        Write-Host "  Docker logs:" -ForegroundColor Yellow
        docker-compose logs --tail 40 api
        docker-compose down -v 2>&1 | Out-Null
        Pop-Location
        return $testResults
    }

    Start-Sleep -Seconds 3
    $base = "http://localhost:$API_PORT"
    $adminBase = if ($isMultiTenant) { "$base/admin/workflow/transaction" } else { "$base/admin/workflow" }

    # --- STEP 5: Happy Path ---
    Write-Host "`n  [4/6] Running Happy Path tests..." -ForegroundColor Cyan

    # T1: Create Transaction
    try {
        $body = '{"amount": 100.50, "currency": "USD", "description": "Test payment"}'
        $r = Invoke-RestMethod -Uri "$base/transactions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $txnId = $r.id
        $testResults += Write-Test "Create Transaction" ($txnId -gt 0) "ID=$txnId, Status=$($r.status)"
    } catch {
        $errBody = ""
        try { $errBody = $_.Exception.Response.GetResponseStream() | ForEach-Object { (New-Object System.IO.StreamReader($_)).ReadToEnd() } } catch {}
        $testResults += Write-Test "Create Transaction" $false "$($_.Exception.Message) $errBody"
        $txnId = 0
    }

    # T2: Get Transaction
    if ($txnId -gt 0) {
        try {
            $r = Invoke-RestMethod -Uri "$base/transactions/$txnId" -Method Get -ErrorAction Stop
            $testResults += Write-Test "Get Transaction" ($r.status -eq "CREATED") "Status=$($r.status)"
        } catch {
            $testResults += Write-Test "Get Transaction" $false $_.Exception.Message
        }
    }

    # T3: Available Transitions
    if ($txnId -gt 0) {
        try {
            $r = Invoke-RestMethod -Uri "$base/transactions/$txnId/available-transitions" -Method Get -ErrorAction Stop
            $names = ($r | ForEach-Object { $_.statusName }) -join ", "
            $hasValidated = $names -match "VALIDATED"
            $testResults += Write-Test "Available Transitions" $hasValidated "Found: $names"
        } catch {
            $testResults += Write-Test "Available Transitions" $false $_.Exception.Message
        }
    }

    # T4: Full transition chain
    foreach ($target in @("VALIDATED", "PROCESSING", "COMPLETED")) {
        if ($txnId -gt 0) {
            try {
                $body = "{`"targetStatus`": `"$target`", `"reason`": `"Test transition`"}"
                $r = Invoke-RestMethod -Uri "$base/transactions/$txnId/transition" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
                $actual = if ($r.status) { $r.status } else { $r.Status }
                $testResults += Write-Test "Transition to $target" ($actual -eq $target) "Status=$actual"
            } catch {
                $errBody = ""
                try { $errBody = $_.Exception.Response.GetResponseStream() | ForEach-Object { (New-Object System.IO.StreamReader($_)).ReadToEnd() } } catch {}
                $testResults += Write-Test "Transition to $target" $false "$($_.Exception.Message) $errBody"
            }
        }
    }

    # T5: History
    if ($txnId -gt 0) {
        try {
            $r = Invoke-RestMethod -Uri "$base/transactions/$txnId/history" -Method Get -ErrorAction Stop
            $count = if ($r -is [array]) { $r.Count } else { 1 }
            $testResults += Write-Test "Transaction History" ($count -ge 3) "History entries: $count"
        } catch {
            $testResults += Write-Test "Transaction History" $false $_.Exception.Message
        }
    }

    # --- STEP 6: Error Paths ---
    Write-Host "`n  [5/6] Running Error Path tests..." -ForegroundColor Cyan

    # T6: Invalid Input
    try {
        $body = '{"amount": -50, "currency": "usd1", "description": "bad"}'
        $r = Invoke-WebRequest -Uri "$base/transactions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $testResults += Write-Test "Validation: Bad Input -> 400" $false "Expected 400, got $($r.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $testResults += Write-Test "Validation: Bad Input -> 400" ($code -eq 400) "StatusCode=$code"
    }

    # T7: Invalid Transition
    try {
        $body = '{"amount": 50, "currency": "EUR", "description": "Skip test"}'
        $r = Invoke-RestMethod -Uri "$base/transactions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $skipId = $r.id
        $body = '{"targetStatus": "COMPLETED", "reason": "Skip"}'
        $r2 = Invoke-WebRequest -Uri "$base/transactions/$skipId/transition" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $testResults += Write-Test "Invalid Transition -> 400" $false "Expected 400, got $($r2.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $testResults += Write-Test "Invalid Transition -> 400" ($code -eq 400) "StatusCode=$code"
    }

    # T8: Not Found
    try {
        $r = Invoke-WebRequest -Uri "$base/transactions/99999" -Method Get -ErrorAction Stop
        $testResults += Write-Test "Not Found -> 404" $false "Expected 404, got $($r.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $testResults += Write-Test "Not Found -> 404" ($code -eq 404) "StatusCode=$code"
    }

    # --- STEP 7: Features ---
    Write-Host "`n  [6/6] Running Feature tests..." -ForegroundColor Cyan

    # T9: Workflow Visualization
    try {
        $r = Invoke-RestMethod -Uri "$adminBase/visualize" -Method Get -ErrorAction Stop
        $hasMermaid = ($r -match "graph" -or $r -match "CREATED" -or $r -match "-->")
        $testResults += Write-Test "Workflow Visualization" $hasMermaid "Mermaid graph returned"
    } catch {
        $testResults += Write-Test "Workflow Visualization" $false $_.Exception.Message
    }

    # T10: Admin - Get Statuses
    try {
        $r = Invoke-RestMethod -Uri "$adminBase/statuses" -Method Get -ErrorAction Stop
        $count = if ($r -is [array]) { $r.Count } else { 1 }
        $testResults += Write-Test "Admin: Get Statuses" ($count -ge 4) "Found $count statuses"
    } catch {
        $testResults += Write-Test "Admin: Get Statuses" $false $_.Exception.Message
    }

    # T11: Admin - Get Transitions
    try {
        $r = Invoke-RestMethod -Uri "$adminBase/transitions" -Method Get -ErrorAction Stop
        $count = if ($r -is [array]) { $r.Count } else { 1 }
        $testResults += Write-Test "Admin: Get Transitions" ($count -ge 4) "Found $count transitions"
    } catch {
        $testResults += Write-Test "Admin: Get Transitions" $false $_.Exception.Message
    }

    # --- Cleanup ---
    Write-Host "`n  Stopping containers..." -ForegroundColor Yellow
    docker-compose down -v 2>&1 | Out-Null
    Pop-Location

    return $testResults
}

##############################################################################
# MAIN
##############################################################################

Set-Location $BASE
$startTime = Get-Date

Write-Header "TRANSACTION WORKFLOW ENGINE - FULL TEST SUITE v2"
Write-Host "  Base: $BASE" -ForegroundColor DarkGray
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host "  Fixes: Migrate->EnsureCreated, using bug, B entity-type routes" -ForegroundColor DarkGray

$allResults = @{}
$approaches = @(
    @{Name="Approach A (Vanilla)"; Folder="TransactionWorkflow_ApproachA"; MultiTenant=$false},
    @{Name="Approach B (Multi-Tenant DNA)"; Folder="TransactionWorkflow_ApproachB"; MultiTenant=$true},
    @{Name="Approach D (Strategic Hybrid)"; Folder="TransactionWorkflow_ApproachD"; MultiTenant=$false}
)

foreach ($entry in $approaches) {
    $allResults[$entry.Name] = Test-Approach $entry.Name $entry.Folder $entry.MultiTenant
}

# === FINAL REPORT ===
Write-Header "FINAL REPORT"
$totalPass = 0; $totalFail = 0

foreach ($approach in @("Approach A (Vanilla)", "Approach B (Multi-Tenant DNA)", "Approach D (Strategic Hybrid)")) {
    if (-not $allResults.ContainsKey($approach)) { continue }
    Write-Host "`n  $approach" -ForegroundColor Cyan
    Write-Host "  $('-'*50)" -ForegroundColor DarkGray
    foreach ($t in $allResults[$approach]) {
        $icon = if ($t.Pass) { "PASS" } else { "FAIL" }
        $color = if ($t.Pass) { "Green" } else { "Red" }
        Write-Host "    [$icon] $($t.Test)" -ForegroundColor $color
        if (-not $t.Pass -and $t.Detail) { Write-Host "           $($t.Detail)" -ForegroundColor DarkGray }
        if ($t.Pass) { $totalPass++ } else { $totalFail++ }
    }
}

$elapsed = ((Get-Date) - $startTime).TotalMinutes
Write-Host "`n$('='*60)" -ForegroundColor Magenta
$color = if ($totalFail -eq 0) { "Green" } elseif ($totalFail -le 3) { "Yellow" } else { "Red" }
Write-Host "  TOTAL: $totalPass passed, $totalFail failed  |  Time: $([math]::Round($elapsed,1)) min" -ForegroundColor $color
Write-Host "$('='*60)`n" -ForegroundColor Magenta

# Save markdown report
$reportPath = Join-Path $BASE "TEST_REPORT.md"
$report = @(
    "# Test Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "",
    "## Fixes Applied Before Testing",
    "- Migrate() -> EnsureCreated() (no EF migration files existed)",
    "- Moved misplaced using statement to top of Program.cs (B, D)",
    "- Used entity-type routes for Approach B admin endpoints",
    "",
    "| Approach | Test | Result | Detail |",
    "|----------|------|--------|--------|"
)
foreach ($approach in @("Approach A (Vanilla)", "Approach B (Multi-Tenant DNA)", "Approach D (Strategic Hybrid)")) {
    if (-not $allResults.ContainsKey($approach)) { continue }
    foreach ($t in $allResults[$approach]) {
        $icon = if ($t.Pass) { "PASS" } else { "FAIL" }
        $detail = if ($t.Detail) { $t.Detail } else { "" }
        $report += "| $approach | $($t.Test) | $icon | $detail |"
    }
}
$report += "", "**Total: $totalPass passed, $totalFail failed in $([math]::Round($elapsed,1)) minutes**"
$report | Set-Content $reportPath -Encoding UTF8
Write-Host "  Report saved: $reportPath" -ForegroundColor Green