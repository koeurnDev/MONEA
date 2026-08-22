# Set Cloudflare Worker Secrets
# Run this script to push all secrets to the Worker
# IMPORTANT: Replace all placeholder values with your actual secrets before running

Write-Host "Setting Cloudflare Worker secrets..." -ForegroundColor Cyan

# Database
Write-Output "YOUR_DATABASE_URL" | npx wrangler secret put DATABASE_URL

# Security
Write-Output "YOUR_JWT_SECRET" | npx wrangler secret put JWT_SECRET
Write-Output "YOUR_SECURITY_PEPPER" | npx wrangler secret put SECURITY_PEPPER
Write-Output "YOUR_ENCRYPTION_KEY" | npx wrangler secret put ENCRYPTION_KEY
Write-Output "YOUR_CSRF_SECRET" | npx wrangler secret put CSRF_SECRET

# Bakong Payment
Write-Output "YOUR_BAKONG_ACCOUNT_ID" | npx wrangler secret put BAKONG_ACCOUNT_ID
Write-Output "YOUR_BAKONG_MERCHANT_NAME" | npx wrangler secret put BAKONG_MERCHANT_NAME
Write-Output "YOUR_BAKONG_API_TOKEN" | npx wrangler secret put BAKONG_API_TOKEN

# Cloudinary
Write-Output "YOUR_CLOUDINARY_API_SECRET" | npx wrangler secret put CLOUDINARY_API_SECRET
Write-Output "YOUR_CLOUDINARY_API_KEY" | npx wrangler secret put NEXT_PUBLIC_CLOUDINARY_API_KEY
Write-Output "YOUR_CLOUDINARY_CLOUD_NAME" | npx wrangler secret put NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

# Upstash Redis
Write-Output "YOUR_UPSTASH_REDIS_REST_URL" | npx wrangler secret put UPSTASH_REDIS_REST_URL
Write-Output "YOUR_UPSTASH_REDIS_REST_TOKEN" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN

# Cloudflare Turnstile
Write-Output "YOUR_TURNSTILE_SECRET_KEY" | npx wrangler secret put TURNSTILE_SECRET_KEY
Write-Output "YOUR_TURNSTILE_SITE_KEY" | npx wrangler secret put NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Telegram
Write-Output "YOUR_TELEGRAM_BOT_TOKEN" | npx wrangler secret put TELEGRAM_BOT_TOKEN
Write-Output "YOUR_TELEGRAM_CHAT_ID" | npx wrangler secret put TELEGRAM_CHAT_ID

# Google SSO
Write-Output "YOUR_GOOGLE_CLIENT_ID" | npx wrangler secret put GOOGLE_CLIENT_ID
Write-Output "YOUR_GOOGLE_CLIENT_SECRET" | npx wrangler secret put GOOGLE_CLIENT_SECRET

# SMTP Email
Write-Output "YOUR_SMTP_HOST" | npx wrangler secret put SMTP_HOST
Write-Output "YOUR_SMTP_PORT" | npx wrangler secret put SMTP_PORT
Write-Output "YOUR_SMTP_SECURE" | npx wrangler secret put SMTP_SECURE
Write-Output "YOUR_SMTP_USER" | npx wrangler secret put SMTP_USER
Write-Output "YOUR_SMTP_PASS" | npx wrangler secret put SMTP_PASS
Write-Output "YOUR_SMTP_FROM" | npx wrangler secret put SMTP_FROM

# Sentry
Write-Output "YOUR_SENTRY_DSN" | npx wrangler secret put NEXT_PUBLIC_SENTRY_DSN

Write-Host "`nAll secrets set successfully! ✅" -ForegroundColor Green
Write-Host "Worker URL: https://monea-api.YOUR_ACCOUNT.workers.dev" -ForegroundColor Cyan
