# Fix hono.ts - Add template router imports and routes
Write-Host "Fixing hono.ts to add template routers..." -ForegroundColor Cyan

$filePath = "hono.ts"
$content = Get-Content $filePath -Raw

# Check if already fixed
if ($content -match "templatePricingRouter") {
    Write-Host "Template routers already added!" -ForegroundColor Green
    exit 0
}

Write-Host "Adding imports..." -ForegroundColor Yellow

# Add imports - simpler approach
$oldImport = "import telegramWebhookRouter from './routers/telegram/webhook';"
$newImports = @"
import telegramWebhookRouter from './routers/telegram/webhook';
import templatePricingRouter from './routers/template-pricing';
import templatePurchaseRouter from './routers/template-purchase';
"@

$content = $content.Replace($oldImport, $newImports)

Write-Host "Adding routes..." -ForegroundColor Yellow

# Add routes - simpler approach  
$oldRoute = "app.route('/telegram/webhook', telegramWebhookRouter);"
$newRoutes = @"
app.route('/telegram/webhook', telegramWebhookRouter);
app.route('/template-pricing', templatePricingRouter);
app.route('/template-purchase', templatePurchaseRouter);
"@

$content = $content.Replace($oldRoute, $newRoutes)

# Write back
Set-Content $filePath -Value $content -NoNewline

Write-Host "Successfully patched hono.ts!" -ForegroundColor Green
Write-Host ""
Write-Host "Changes:" -ForegroundColor Cyan
Write-Host "  - Added templatePricingRouter import"
Write-Host "  - Added templatePurchaseRouter import"
Write-Host "  - Added /template-pricing route"
Write-Host "  - Added /template-purchase route"
Write-Host ""
Write-Host "Next: npx wrangler deploy" -ForegroundColor Yellow
