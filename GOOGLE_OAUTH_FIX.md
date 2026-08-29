# 🔧 Google OAuth Fix - WebSocket 403 Error

## Problem
```
ការចូលប្រើប្រាស់តាម Google បរាជ័យ: 
Uncaught TypeError: Failed to establish the WebSocket connection: 
expected server to reply with HTTP status code 101 (switching protocols), 
but received 403 instead.
```

## Root Cause

**NOT a WebSocket issue!** This is a misleading error message from the browser.

The real issue:
1. Google OAuth callback URL mismatch
2. Missing `NEXT_PUBLIC_APP_URL` environment variable in worker
3. Callback redirect using wrong domain

## Solution

### 1. **Fixed `lib/sso.ts`**
- Added proper fallback for `NEXT_PUBLIC_APP_URL`
- Improved redirect URL handling
- Better hostname detection

### 2. **Fixed `auth_handlers/sso/callback/handler.ts`**
- Added detailed logging
- Proper error handling for Google OAuth errors
- Explicit 302 redirect with proper headers
- Better error messages with `error_description`

### 3. **Updated `wrangler.toml`**
- Added `NEXT_PUBLIC_APP_URL` environment variable
- Set to production frontend URL

## Changes Made

### File: `monea-api-worker/lib/sso.ts`
```typescript
// Added better fallback logic
const appUrl = isLocal
    ? (process.env.VITE_APP_URL || 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://monea-webapp.pages.dev');

// Improved redirect URI with actual hostname
return `https://${url.hostname}/api/auth/sso/callback`;
```

### File: `monea-api-worker/auth_handlers/sso/callback/handler.ts`
```typescript
// Added request URL logging
console.log('[SSO Callback] Request URL:', req.url);

// Handle Google error_description
const errorDescription = searchParams.get("error_description");

// Explicit 302 redirect with headers
return new Response(null, {
    status: 302,
    headers: {
        'Location': redirectUrl.toString(),
        'Cache-Control': 'no-store',
    },
});
```

### File: `monea-api-worker/wrangler.toml`
```toml
[vars]
ENVIRONMENT = "production"
NEXT_PUBLIC_APP_URL = "https://monea-webapp.pages.dev"
```

## Google OAuth Console Configuration

### Required Redirect URIs:
```
✅ https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
✅ http://localhost:8787/api/auth/sso/callback (for local dev)
```

### Authorized JavaScript Origins:
```
✅ https://monea-webapp.pages.dev
✅ https://*.pages.dev (for preview deployments)
✅ http://localhost:3001 (for local dev)
```

## Testing

### Before Deployment:
```bash
cd monea-api-worker
npm run build
```

### Deploy:
```bash
npx wrangler deploy
```

### Test Flow:
1. Go to: https://monea-webapp.pages.dev/sign-in
2. Click "Google" button
3. Should redirect to Google OAuth
4. After auth, should redirect back to callback
5. Should show loading screen
6. Should redirect to /dashboard

### Debug Logs:
Check Cloudflare Workers logs:
```bash
npx wrangler tail
```

Look for:
```
[SSO Callback] Request hostname: monea-api.seabkoeurn64.workers.dev
[SSO Callback] App URL: https://monea-webapp.pages.dev
[SSO Callback] Redirecting to: https://monea-webapp.pages.dev/auth/callback?code=...
```

## Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"
**Cause:** Google Console doesn't have the correct redirect URI

**Solution:**
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Edit OAuth 2.0 Client
4. Add: `https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback`

### Issue 2: Still getting WebSocket error
**Cause:** Browser caching old response

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Try incognito mode

### Issue 3: "no_code" error
**Cause:** User denied OAuth permission

**Solution:** User needs to accept Google permissions

### Issue 4: "session_failed" error
**Cause:** Exchange ticket expired or invalid

**Solution:** Check if CSRF/auth token generation is working

## Verification Checklist

After deployment, verify:

- [ ] Google OAuth button redirects to Google
- [ ] After Google auth, redirects back to worker
- [ ] Worker logs show callback processing
- [ ] User is created/updated in database
- [ ] Exchange ticket is generated
- [ ] Frontend receives code parameter
- [ ] Session API sets auth cookie
- [ ] User lands on /dashboard
- [ ] No WebSocket errors in console

## Environment Variables Required

### Worker (monea-api-worker):
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=https://monea-webapp.pages.dev
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
```

### Frontend (monea-webapp):
```env
VITE_API_URL=https://monea-api.seabkoeurn64.workers.dev
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://monea-webapp.pages.dev |
| API Worker | https://monea-api.seabkoeurn64.workers.dev |
| OAuth Callback | https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback |
| Frontend Callback | https://monea-webapp.pages.dev/auth/callback |

---

**Fixed by:** MONEA Development Team  
**Date:** 2026-08-26  
**Status:** Ready to deploy
