# 🔴 URGENT: Google OAuth Console Configuration

## Problem
```
Error: Uncaught TypeError: Failed to establish the WebSocket connection: 
expected server to reply with HTTP status code 101 (switching protocols), 
but received 403 instead.
```

**This error is happening at GOOGLE'S SIDE, not our backend!**

## Root Cause
❌ **Google OAuth Console has WRONG redirect URI configured**
❌ The redirect URI in Google Console doesn't match what we're sending
❌ Google is rejecting the OAuth flow before it even reaches our callback

## Required Google Console Configuration

### Step-by-Step Fix:

#### 1. Go to Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

#### 2. Find Your OAuth 2.0 Client ID
- Look for your OAuth 2.0 Client ID in the credentials list
- Click on it to edit

#### 3. Configure Authorized Redirect URIs

**MUST HAVE THESE EXACT URLs:**

```
Production:
✅ https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback

Development (if testing locally):
✅ http://localhost:8787/api/auth/sso/callback
✅ http://127.0.0.1:8787/api/auth/sso/callback
```

**REMOVE ANY OTHER redirect_uri that doesn't match!**

#### 4. Configure Authorized JavaScript Origins

```
Production:
✅ https://monea-webapp.pages.dev
✅ https://monea-api.seabkoeurn64.workers.dev

Preview/Staging (optional):
✅ https://*.pages.dev

Development:
✅ http://localhost:3001
✅ http://localhost:8787
```

#### 5. Save and Wait
- Click **Save**
- **Wait 1-5 minutes** for Google to propagate changes
- Changes are NOT instant!

## Verification Steps

### Check Current Configuration:

1. **In Google Console**, verify redirect URIs match EXACTLY:
   ```
   https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
   ```
   
2. **NO trailing slash** - must be exactly as shown
3. **NO http** - must be https for production
4. **NO www** - must match your actual domain

### Test OAuth Flow:

```bash
# 1. Check what we're sending
curl -I "https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/google"

# Should redirect to Google with redirect_uri parameter
# Look for: redirect_uri=https%3A%2F%2Fmonea-api.seabkoeurn64.workers.dev%2Fapi%2Fauth%2Fsso%2Fcallback

# 2. Test actual flow
# Open in browser:
https://monea-webapp.pages.dev/sign-in
# Click Google button
# Should NOT see WebSocket error
```

## Common Mistakes

### ❌ WRONG:
```
https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback/
https://monea-webapp.pages.dev/api/auth/sso/callback
http://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
https://monea-api.seabkoeurn64.workers.dev/auth/sso/callback
```

### ✅ CORRECT:
```
https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
```

## Debug Checklist

- [ ] Google Console has correct redirect URI (no typos!)
- [ ] Waited 1-5 minutes after saving
- [ ] Cleared browser cache
- [ ] Tried in incognito mode
- [ ] No other OAuth apps interfering
- [ ] GOOGLE_CLIENT_ID matches the console
- [ ] GOOGLE_CLIENT_SECRET is correct

## Expected Flow

### Correct OAuth Flow:
```
1. User clicks "Google" button
   ↓
2. Frontend redirects to: /api/auth/sso/google
   ↓
3. Worker redirects to Google with:
   redirect_uri=https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
   ↓
4. Google shows consent screen
   ↓
5. User accepts
   ↓
6. Google redirects to: 
   https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback?code=...
   ↓
7. Our worker processes callback
   ↓
8. Worker creates exchange ticket
   ↓
9. Worker redirects to:
   https://monea-webapp.pages.dev/auth/callback?code=...
   ↓
10. Frontend exchanges ticket for session
    ↓
11. User lands on /dashboard
```

### Current Broken Flow:
```
1. User clicks "Google" button
   ↓
2. Frontend redirects to: /api/auth/sso/google
   ↓
3. Worker redirects to Google
   ↓
4. ❌ Google rejects with 403 (redirect_uri mismatch)
   ↓
5. ❌ WebSocket error appears (misleading message)
   ↓
6. ❌ User redirected back with error
```

## Environment Variables to Check

### Worker (.env or wrangler.toml):
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_secret_here
NEXT_PUBLIC_APP_URL=https://monea-webapp.pages.dev
```

### Frontend (.env):
```env
VITE_API_URL=https://monea-api.seabkoeurn64.workers.dev
VITE_GOOGLE_CLIENT_ID=your_client_id_here  # Same as worker
```

## Testing After Fix

### 1. Clear Everything:
```bash
# Clear browser cache
Ctrl + Shift + Delete

# Clear cookies for:
- monea-webapp.pages.dev
- monea-api.seabkoeurn64.workers.dev
- accounts.google.com
```

### 2. Test in Incognito:
```bash
# Open incognito window
Ctrl + Shift + N

# Navigate to:
https://monea-webapp.pages.dev/sign-in

# Click Google button
# Should see Google consent screen
# Should NOT see WebSocket error
```

### 3. Check Worker Logs:
```bash
cd monea-api-worker
npx wrangler tail

# Click Google button and watch logs
# Should see:
[SSO Callback] Request URL: https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback?code=...
[SSO Callback] Getting Google tokens...
[SSO Callback] User authenticated: ...
```

## If Still Not Working

### Check Google Console Again:
1. OAuth 2.0 Client ID → Edit
2. Verify **Authorized redirect URIs** section
3. Should have EXACTLY this:
   ```
   https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
   ```
4. Click Save again
5. Wait 5 minutes
6. Try again in incognito

### Check OAuth Credentials:
```bash
# Verify client ID matches
echo $GOOGLE_CLIENT_ID

# Check it matches Google Console
# Go to: https://console.cloud.google.com/apis/credentials
# Copy Client ID and compare
```

### Enable Detailed Logging:
Add to worker code temporarily:
```typescript
// In lib/sso.ts
export function getGoogleAuthUrl(state: string, req?: Request) {
    const redirect_uri = getRedirectUri(req);
    console.log('🔍 Google Auth URL redirect_uri:', redirect_uri);
    // ... rest of code
}
```

## Success Criteria

✅ Click Google button → No errors
✅ See Google consent screen
✅ Accept → Redirect to dashboard
✅ No WebSocket errors in console
✅ User logged in successfully

## Support Resources

- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Google Console: https://console.cloud.google.com/apis/credentials
- Cloudflare Workers Logs: `npx wrangler tail`

---

**CRITICAL:** បញ្ហានេះគឺនៅ Google Console configuration!
**FIX:** ចូលទៅ Google Console ហើយបន្ថែម redirect URI ដែលត្រឹមត្រូវ!
**TIME:** រង់ចាំ 1-5 នាទីបន្ទាប់ពី save!

**Status:** Waiting for Google Console configuration fix
**Updated:** 2026-08-26
