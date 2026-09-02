# Budget API Comprehensive Test Script
$baseUrl = "http://localhost:3001"
$passed = 0
$failed = 0
$results = @()

# Login first
$loginResp = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"budgettest3@test.com","password":"Test@1234"}' -UseBasicParsing
$loginData = $loginResp.Content | ConvertFrom-Json
$token = $loginData.data.tokens.accessToken
$headers = @{ Authorization = "Bearer $token" }

function Test-Api {
    param($Name, $Method, $Url, $Body, $ExpectedStatus)
    
    try {
        $params = @{
            Uri = "$baseUrl$Url"
            Method = $Method
            ContentType = "application/json"
            Headers = $headers
            UseBasicParsing = $true
        }
        if ($Body) { $params.Body = $Body }
        
        $resp = Invoke-WebRequest @params
        $status = $resp.StatusCode
        $content = $resp.Content | ConvertFrom-Json
        $success = ($status -eq $ExpectedStatus) -or ($ExpectedStatus -eq 0)
        
        if ($success) {
            Write-Host "[PASS] $Name (Status: $status)" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "[FAIL] $Name - Expected $ExpectedStatus, got $status" -ForegroundColor Red
            $script:failed++
        }
        return $content
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "[FAIL] $Name - Error $statusCode : $errBody" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

Write-Host "`n========== BUDGET API COMPREHENSIVE TEST ==========" -ForegroundColor Cyan

# TEST 1: Create Budget Profile
Write-Host "`n--- 1. Budget Profile ---" -ForegroundColor Yellow
$r = Test-Api "POST /api/budget (create profile)" "POST" "/api/budget" '{"monthlyIncome":50000,"currency":"PKR","savingsGoal":10000}' 201
if ($r) { Write-Host "  Response: monthlyIncome=$($r.data.monthlyIncome), currency=$($r.data.currency)" }

# TEST 2: Get Budget Profile + Summary
$r = Test-Api "GET /api/budget (profile+summary)" "GET" "/api/budget" $null 200
if ($r) { Write-Host "  Profile: $($r.data.profile | ConvertTo-Json -Compress)" }

# TEST 3: Get Categories
Write-Host "`n--- 2. Categories ---" -ForegroundColor Yellow
$r = Test-Api "GET /api/budget/categories" "GET" "/api/budget/categories" $null 200
$categories = $r.data
Write-Host "  Categories count: $($categories.Count)"
if ($categories.Count -gt 0) {
    Write-Host "  First category: $($categories[0].name)"
    $catId = $categories[0].id
    $catId2 = if ($categories.Count -gt 1) { $categories[1].id } else { $categories[0].id }
}

# TEST 4: Create Custom Category
$r = Test-Api "POST /api/budget/categories (custom)" "POST" "/api/budget/categories" '{"name":"Custom Cat","icon":"🎮"}' 201

# TEST 5: Add Income
Write-Host "`n--- 3. Income ---" -ForegroundColor Yellow
$r = Test-Api "POST /api/budget/income (salary)" "POST" "/api/budget/income" '{"source":"Salary","amount":50000,"frequency":"monthly"}' 201
$r = Test-Api "POST /api/budget/income (freelance)" "POST" "/api/budget/income" '{"source":"Freelance","amount":15000,"frequency":"biweekly"}' 201
$r = Test-Api "GET /api/budget/income" "GET" "/api/budget/income" $null 200
if ($r) { Write-Host "  Income records: $($r.data.Count)" }

# TEST 6: Add Expenses
Write-Host "`n--- 4. Expenses ---" -ForegroundColor Yellow
if ($catId) {
    $today = (Get-Date).ToString("yyyy-MM-dd")
    $r = Test-Api "POST /api/budget/expenses (food)" "POST" "/api/budget/expenses" "{`"categoryId`":`"$catId`",`"amount`":1500,`"description`":`"Groceries`",`"date`":`"$today`"}" 201
    $r = Test-Api "POST /api/budget/expenses (transport)" "POST" "/api/budget/expenses" "{`"categoryId`":`"$catId2`",`"amount`":500,`"description`":`"Uber`",`"date`":`"$today`",`"isRecurring`":true,`"recurringFrequency`":`"weekly`"}" 201
    
    # Add expense with missing fields (should fail validation)
    $r = Test-Api "POST /api/budget/expenses (missing fields - expect fail)" "POST" "/api/budget/expenses" '{"amount":100}' 400
} else {
    Write-Host "[SKIP] No categories available for expense tests" -ForegroundColor DarkYellow
}

# TEST 7: Get Expenses
$r = Test-Api "GET /api/budget/expenses" "GET" "/api/budget/expenses" $null 200
if ($r) { 
    Write-Host "  Expenses: total=$($r.data.total), page=$($r.data.page), data_count=$($r.data.data.Count)"
    if ($r.data.data.Count -gt 0) {
        Write-Host "  First expense: category=$($r.data.data[0].category), amount=$($r.data.data[0].amount)"
    }
}

# TEST 8: Get Expenses with pagination
$r = Test-Api "GET /api/budget/expenses?page=1&limit=1" "GET" "/api/budget/expenses?page=1&limit=1" $null 200
if ($r) { Write-Host "  Paginated: total=$($r.data.total), totalPages=$($r.data.totalPages), returned=$($r.data.data.Count)" }

# TEST 9: Spending Analysis
Write-Host "`n--- 5. Analysis ---" -ForegroundColor Yellow
$r = Test-Api "GET /api/budget/analysis" "GET" "/api/budget/analysis" $null 200
if ($r) { Write-Host "  Analysis months: $($r.data.Count)" }

# TEST 10: Set Budget
Write-Host "`n--- 6. Budgets ---" -ForegroundColor Yellow
if ($catId) {
    $r = Test-Api "POST /api/budget/budgets (set food budget)" "POST" "/api/budget/budgets" "{`"categoryId`":`"$catId`",`"amount`":5000,`"period`":`"monthly`"}" 201
    $r = Test-Api "GET /api/budget/budgets" "GET" "/api/budget/budgets" $null 200
    if ($r) { Write-Host "  Budgets count: $($r.data.Count)" }
}

# TEST 11: Savings Goals
Write-Host "`n--- 7. Savings Goals ---" -ForegroundColor Yellow
$r = Test-Api "POST /api/budget/savings (emergency fund)" "POST" "/api/budget/savings" '{"title":"Emergency Fund","targetAmount":100000,"monthlyContribution":5000,"deadline":"2026-12-31"}' 201
$savingsGoalId = $r.data.id
Write-Host "  Goal ID: $savingsGoalId"

$r = Test-Api "POST /api/budget/savings (laptop)" "POST" "/api/budget/savings" '{"title":"New Laptop","targetAmount":200000,"monthlyContribution":10000,"deadline":"2027-06-30"}' 201

$r = Test-Api "GET /api/budget/savings" "GET" "/api/budget/savings" $null 200
if ($r) { Write-Host "  Goals count: $($r.data.Count)" }

# TEST 12: Update Savings Goal
if ($savingsGoalId) {
    $r = Test-Api "PATCH /api/budget/savings/$savingsGoalId (update)" "PATCH" "/api/budget/savings/$savingsGoalId" '{"currentAmount":15000,"title":"Emergency Fund Updated"}' 200
    if ($r) { Write-Host "  Updated: title=$($r.data.title), current=$($r.data.currentAmount)" }
    
    # TEST 13: Delete (soft) Savings Goal
    $r = Test-Api "DELETE /api/budget/savings/$savingsGoalId" "DELETE" "/api/budget/savings/$savingsGoalId" $null 200
}

# TEST 14: AI Apply
Write-Host "`n--- 8. AI Apply ---" -ForegroundColor Yellow
if ($catId -and $catId2) {
    $catName1 = ($categories | Where-Object { $_.id -eq $catId }).name
    $catName2 = ($categories | Where-Object { $_.id -eq $catId2 }).name
    $allocJson = "{`"allocations`":[{`"category`":`"$catName1`",`"amount`":8000},{`"category`":`"$catName2`",`"amount`":3000}],`"period`":`"monthly`"}"
    $r = Test-Api "POST /api/budget/ai-apply" "POST" "/api/budget/ai-apply" $allocJson 200
    if ($r) { Write-Host "  Applied: $($r.data.applied), Skipped: $($r.data.skipped)" }
}

# TEST 15: Validation tests
Write-Host "`n--- 9. Validation Tests ---" -ForegroundColor Yellow
$r = Test-Api "POST /api/budget (missing income)" "POST" "/api/budget" '{"currency":"PKR"}' 400
$r = Test-Api "POST /api/budget/savings (missing title)" "POST" "/api/budget/savings" '{"targetAmount":5000}' 400
$r = Test-Api "POST /api/budget/income (missing source)" "POST" "/api/budget/income" '{"amount":5000,"frequency":"monthly"}' 400

# TEST 16: Auth test (no token)
Write-Host "`n--- 10. Auth Test ---" -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/api/budget" -UseBasicParsing
    Write-Host "[FAIL] GET /api/budget without auth should fail" -ForegroundColor Red
    $failed++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "[PASS] Auth required returns 401" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "[FAIL] Expected 401, got $statusCode" -ForegroundColor Red
        $failed++
    }
}

# Summary
Write-Host "`n========== TEST SUMMARY ==========" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Total: $($passed + $failed)" -ForegroundColor Cyan
