# Deployment script for 401 Authentication Fix
# Run this script to deploy both API and frontend changes

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Deploying 401 Authentication Fix" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (!(Test-Path "monea-api-worker") -or !(Test-Path "monea-webapp")) {
    Write-Host "❌ Error: This script must be run from the MONEO root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found project directories" -ForegroundColor Green
Write-Host ""

# Deploy API Worker
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Step 1: Deploying API Worker" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "monea-api-worker"
Write-Host "Running: npm run worker:deploy" -ForegroundColor Yellow
npm run worker:deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ API Worker deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "✅ API Worker deployed successfully!" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Build and Deploy Frontend
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Step 2: Building and Deploying Frontend" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "monea-webapp"

Write-Host "Running: npm run build" -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Running: npm run deploy:pages" -ForegroundColor Yellow
npm run deploy:pages

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
Write-Host ""

Set-Location ..

# Success message
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Changes deployed:" -ForegroundColor Cyan
Write-Host "  ✅ Removed Partitioned cookie attribute" -ForegroundColor White
Write-Host "  ✅ Fixed infinite retry loop" -ForegroundColor White
Write-Host "  ✅ Added Authorization header fallback" -ForegroundColor White
Write-Host "  ✅ Enhanced debug logging" -ForegroundColor White
Write-Host "  ✅ Token cleanup on logout" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test sign-in at https://moneoez.com/sign-in" -ForegroundColor Yellow
Write-Host "  2. Check browser console for [Auth] and [FetchInterceptor] logs" -ForegroundColor Yellow
Write-Host "  3. Verify /api/auth/me returns 200 OK" -ForegroundColor Yellow
Write-Host "  4. Test with ad blocker enabled (uBlock Origin)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "  - See AUTH_401_DEBUGGING_GUIDE.md for detailed debugging" -ForegroundColor White
Write-Host "  - See FIX_401_AUTH_COMPLETE.md for implementation details" -ForegroundColor White
Write-Host ""
