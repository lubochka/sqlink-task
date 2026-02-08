##############################################################################
# Transaction Workflow Engine - Full Test Suite v3
# Tests all 3 approaches: A, B, D
# All fixes baked into source - no runtime patching.
# Usage: powershell -ExecutionPolicy Bypass -File .\testAll.ps1
##############################################################################

$ErrorActionPreference = "Continue"
$BASE = "C:\Users\lubao\Documents\sqlink task"
$API_PORT = 5000

function Write-Header {
    param([string]$text)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host "  $text" -ForegroundColor Magenta
    Write-Host "============================================================" -ForegroundColor Magenta
}

function Write-Test {
    param([string]$name, [bool]$pass, [string]$detail)
    if ($pass) {
        Write-Host "  [PASS] $name" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $name" -ForegroundColor Red
    }
    if ($detail) { Write-Host "        $detail" -ForegroundColor DarkGray }
    return [PSCustomObject]@{ Test=$name; Pass=$pass; Detail=$detail }
}

function Wait-ForApi {
    param([int]$port, [int]$maxWait)
    Write-Host "  Waiting for API on port $port..." -ForegroundColor Yellow
    $elapsed = 0
    while ($elapsed -lt $maxWait) {
        try {
            $null = Invoke-RestMethod -Uri "http://localhost:${port}/swagger/index.html" -Method Get -TimeoutSec 2 -ErrorAction Stop
            Write-Host "  API is UP after ${elapsed}s" -ForegroundColor Green
            return $true
        } catch {
            Start-Sleep -Seconds 3
            $elapsed += 3
        }
    }
    Write-Host "  API did not start within ${maxWait}s" -ForegroundColor Red
    return $false
}

function Test-Approach {
    param([string]$name, [string]$folder, [bool]$isMultiTenant)

    Write-Header "TESTING $name"
    $testResults = @()
    $dir = Join-Path $BASE $folder

    # --- STEP 1: Extract fresh ---
    Write-Host ""
    Write-Host "  [1/5] Extracting from zip..." -ForegroundColor Cyan
    $zipFile = Join-Path $BASE "${folder}.zip"
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
    Expand-Archive -Path $zipFile -DestinationPath $dir -Force

    # --- STEP 2: Docker Compose Up ---
    Write-Host ""
    Write-Host "  [2/5] Starting Docker containers..." -ForegroundColor Cyan
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

    # --- STEP 3: Wait for API ---
    Write-Host ""
    Write-Host "  [3/5] Waiting for API startup..." -ForegroundColor Cyan
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
    $baseUrl = "http://localhost:${API_PORT}"
    if ($isMultiTenant) {
        $adminBase = "${baseUrl}/admin/workflow/transaction"
    } else {
        $adminBase = "${baseUrl}/admin/workflow"
    }

    # --- STEP 4: Happy Path ---
    Write-Host ""
    Write-Host "  [4/5] Running Happy Path tests..." -ForegroundColor Cyan

    # T1: Create Transaction
    $txnId = 0
    try {
        $body = '{"amount": 100.50, "currency": "USD", "description": "Test payment"}'
        $r = Invoke-RestMethod -Uri "${baseUrl}/transactions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $txnId = $r.id
        $testResults += Write-Test "Create Transaction" ($txnId -gt 0) "ID=$txnId, Status=$($r.status)"
    } catch {
        $errBody = ""
        try { $errBody = $_.Exception.Response.GetResponseStream() | ForEach-Object { (New-Object System.IO.StreamReader($_)).ReadToEnd() } } catch {}
        $testResults += Write-Test "Create Transaction" $false "$($_.Exception.Message) $errBody"
    }

    # T2: Get Transaction
    if ($txnId -gt 0) {
        try {
            $r = Invoke-RestMethod -Uri "${baseUrl}/transactions/${txnId}" -Method Get -ErrorAction Stop
            $testResults += Write-Test "Get Transaction" ($r.status -eq "CREATED") "Status=$($r.status)"
        } catch {
            $testResults += Write-Test "Get Transaction" $false $_.Exception.Message
        }
    }

    # T3: Available Transitions
    if ($txnId -gt 0) {
        try {
            $r = Invoke-RestMethod -Uri "${baseUrl}/transactions/${txnId}/available-transitions" -Method Get -ErrorAction Stop
            $names = ($r | ForEach-Object { $_.statusName }) -join ", "
            $hasValidated = $names -match "VALIDATED"
            $testResults += Write-Test "Available Transitions" $hasValidated "Found: $names"
        } catch {
            $testResults += Write-Test "Available Transitions" $false $_.Exception.Message
        }
    }

    # T4: Full transition chain
    $transitions = @("VALIDATED", "PROCESSING", "COMPLETED")
    foreach ($target in $transitions) {
        if ($txnId -gt 0) {
            try {
                $body = "{`"targetStatus`": `"$target`", `"reason`": `"Test transition`"}"
                $r = Invoke-RestMethod -Uri "${baseUrl}/transactions/${txnId}/transition" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
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
            $r = Invoke-RestMethod -Uri "${baseUrl}/transactions/${txnId}/history" -Method Get -ErrorAction Stop
            $count = if ($r -is [array]) { $r.Count } else { 1 }
            $testResults += Write-Test "Transaction History" ($count -ge 3) "History entries: $count"
        } catch {
            $testResults += Write-Test "Transaction History" $false $_.Exception.Message
        }
    }

    # --- STEP 5: Error Paths & Features ---
    Write-Host ""
    Write-Host "  [5/5] Running Error Path & Feature tests..." -ForegroundColor Cyan

    # T6: Invalid Input
    try {
        $body = '{"amount": -50, "currency": "usd1", "description": "bad"}'
        $r = Invoke-WebRequest -Uri "${baseUrl}/transactions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $testResults += Write-Test "Validation: Bad Input -> 400" $false "Expected 400, got $($r.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $testResults += Write-Test "Validation: Bad Input -> 400" ($code -eq 400) "StatusCode=$code"
    }

    # T7: Invalid Transition
    try {
        $body = '{"amount": 50, "currency": "EUR", "description": "Skip test"}'
        $r = Invoke-RestMethod -Uri "${baseUrl}/transactions" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $skipId = $r.id
        $body = '{"targetStatus": "COMPLETED", "reason": "Skip"}'
        $r2 = Invoke-WebRequest -Uri "${baseUrl}/transactions/${skipId}/transition" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        $testResults += Write-Test "Invalid Transition -> 400" $false "Expected 400, got $($r2.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $testResults += Write-Test "Invalid Transition -> 400" ($code -eq 400) "StatusCode=$code"
    }

    # T8: Not Found
    try {
        $r = Invoke-WebRequest -Uri "${baseUrl}/transactions/99999" -Method Get -ErrorAction Stop
        $testResults += Write-Test "Not Found -> 404" $false "Expected 404, got $($r.StatusCode)"
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $testResults += Write-Test "Not Found -> 404" ($code -eq 404) "StatusCode=$code"
    }

    # T9: Workflow Visualization
    try {
        $r = Invoke-RestMethod -Uri "${adminBase}/visualize" -Method Get -ErrorAction Stop
        $hasMermaid = ($r -match "graph" -or $r -match "CREATED" -or $r -match "-->")
        $testResults += Write-Test "Workflow Visualization" $hasMermaid "Mermaid graph returned"
    } catch {
        $testResults += Write-Test "Workflow Visualization" $false $_.Exception.Message
    }

    # T10: Admin - Get Statuses
    try {
        $r = Invoke-RestMethod -Uri "${adminBase}/statuses" -Method Get -ErrorAction Stop
        $count = if ($r -is [array]) { $r.Count } else { 1 }
        $testResults += Write-Test "Admin: Get Statuses" ($count -ge 4) "Found $count statuses"
    } catch {
        $testResults += Write-Test "Admin: Get Statuses" $false $_.Exception.Message
    }

    # T11: Admin - Get Transitions
    try {
        $r = Invoke-RestMethod -Uri "${adminBase}/transitions" -Method Get -ErrorAction Stop
        $count = if ($r -is [array]) { $r.Count } else { 1 }
        $testResults += Write-Test "Admin: Get Transitions" ($count -ge 4) "Found $count transitions"
    } catch {
        $testResults += Write-Test "Admin: Get Transitions" $false $_.Exception.Message
    }

    # --- Cleanup ---
    Write-Host ""
    Write-Host "  Stopping containers..." -ForegroundColor Yellow
    docker-compose down -v 2>&1 | Out-Null
    Pop-Location

    return $testResults
}

##############################################################################
# MAIN
##############################################################################

Set-Location $BASE
$startTime = Get-Date

Write-Header "TRANSACTION WORKFLOW ENGINE - FULL TEST SUITE v3"
Write-Host "  Base: $BASE" -ForegroundColor DarkGray
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host "  Mode: Clean test - all fixes baked into source" -ForegroundColor DarkGray

$allResults = [ordered]@{}

$aName = "Approach A - Vanilla"
$bName = "Approach B - Multi-Tenant DNA"
$dName = "Approach D - Strategic Hybrid"

$allResults[$aName] = Test-Approach $aName "TransactionWorkflow_ApproachA" $false
$allResults[$bName] = Test-Approach $bName "TransactionWorkflow_ApproachB" $true
$allResults[$dName] = Test-Approach $dName "TransactionWorkflow_ApproachD" $false

# === FINAL REPORT ===
Write-Header "FINAL REPORT"
$totalPass = 0
$totalFail = 0

foreach ($approach in $allResults.Keys) {
    Write-Host ""
    Write-Host "  $approach" -ForegroundColor Cyan
    Write-Host "  --------------------------------------------------" -ForegroundColor DarkGray
    foreach ($t in $allResults[$approach]) {
        if ($t.Pass) {
            Write-Host "    [PASS] $($t.Test)" -ForegroundColor Green
            $totalPass++
        } else {
            Write-Host "    [FAIL] $($t.Test)" -ForegroundColor Red
            if ($t.Detail) { Write-Host "           $($t.Detail)" -ForegroundColor DarkGray }
            $totalFail++
        }
    }
}

$elapsed = ((Get-Date) - $startTime).TotalMinutes
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
if ($totalFail -eq 0) {
    Write-Host "  TOTAL: $totalPass passed, $totalFail failed  |  Time: $([math]::Round($elapsed,1)) min" -ForegroundColor Green
} elseif ($totalFail -le 3) {
    Write-Host "  TOTAL: $totalPass passed, $totalFail failed  |  Time: $([math]::Round($elapsed,1)) min" -ForegroundColor Yellow
} else {
    Write-Host "  TOTAL: $totalPass passed, $totalFail failed  |  Time: $([math]::Round($elapsed,1)) min" -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor Magenta

# Save markdown report
$reportPath = Join-Path $BASE "TEST_REPORT.md"
$report = @()
$report += "# Test Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += ""
$report += "## V2 Improvements - baked into source"
$report += "- API Key authentication with dev-bypass"
$report += "- Authorize on all controllers, AdminOnly policy on admin"
$report += "- CORS configuration with configurable allowed origins"
$report += "- Environment-aware exception middleware"
$report += "- XML documentation in Swagger UI"
$report += "- EnsureCreated with migration upgrade path documented"
$report += "- All original bug fixes: AsNoTracking, FK-only nav, entity reload"
$report += ""
$report += "| Approach | Test | Result | Detail |"
$report += "|----------|------|--------|--------|"
foreach ($approach in $allResults.Keys) {
    foreach ($t in $allResults[$approach]) {
        $icon = "FAIL"
        if ($t.Pass) { $icon = "PASS" }
        $detail = ""
        if ($t.Detail) { $detail = $t.Detail }
        $report += "| $approach | $($t.Test) | $icon | $detail |"
    }
}
$report += ""
$report += "**Total: $totalPass passed, $totalFail failed in $([math]::Round($elapsed,1)) minutes**"
$report | Set-Content $reportPath -Encoding UTF8
Write-Host "  Report saved: $reportPath" -ForegroundColor Green

# === Cleanup extracted folders ===
Write-Host ""
Write-Host "  Cleaning up extracted folders..." -ForegroundColor Yellow
$folders = @("TransactionWorkflow_ApproachA", "TransactionWorkflow_ApproachB", "TransactionWorkflow_ApproachD")
foreach ($f in $folders) {
    $dir = Join-Path $BASE $f
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "    Removed $f" -ForegroundColor DarkGray
    }
}
Write-Host "  Cleanup complete." -ForegroundColor Green
