# 401 Unauthorized Error - Debugging Guide

## Error Symptoms
```
ERR_BLOCKED_BY_CLIENT
GET https://api.moneoez.com/api/auth/me 401 (Unauthorized)
```

## Root Causes & Solutions

### 1. **ERR_BLOCKED_BY_CLIENT** (Ad Blocker)
**Cause:** Browser extensions (ad blockers, privacy tools) are blocking the API request

**Solutions:**
- Disable ad blockers temporarily (uBlock Origin, AdBlock, Privacy Badger, etc.)
- Add `api.moneoez.com` to ad blocker whitelist
- Test in incognito mode with extensions disabled
- Check browser console for "blocked by" messages

### 2. **Cookie Not Being Sent**
**Cause:** Cross-origin cookie settings preventing credential transmission

**Check in Browser DevTools:**
1. Open DevTools → Application → Cookies
2. Look for domain: `api.moneoez.com`
3. Check if `token` or `staff_token` cookie exists
4. Verify cookie attributes:
   - ✅ `SameSite=None`
   - ✅ `Secure`
   - ✅ `HttpOnly`
   - ❌ NO `Partitioned` (removed in latest fix)

**If cookie is missing after signin:**
- Check signin response has `Set-Cookie` header
- Browser might be blocking third-party cookies
- Check browser settings: Privacy → Cookies → Allow all cookies

### 3. **Authorization Header Not Sent**
**Cause:** Token not being added to fetch requests

**Debug Steps:**
```javascript
// In browser console, check if token is in signin response:
fetch('https://api.moneoez.com/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  }),
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('Token in response:', data.token); // Should be present
  console.log('User:', data.user);
  
  // Test /me endpoint with token
  return fetch('https://api.moneoez.com/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${data.token}`
    },
    credentials: 'include'
  });
})
.then(r => r.json())
.then(data => console.log('/me response:', data));
```

### 4. **CORS Preflight Failure**
**Cause:** OPTIONS request failing before actual request

**Check:**
```bash
curl -X OPTIONS https://api.moneoez.com/api/auth/me \
  -H "Origin: https://moneoez.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization" \
  -v
```

**Expected response:**
- Status: 204 No Content
- `Access-Control-Allow-Origin: https://moneoez.com`
- `Access-Control-Allow-Credentials: true`

### 5. **Token Expired or Invalid**
**Cause:** JWT token has expired or is malformed

**Check Logs:**
Look in browser console for:
```
[Auth] Token verification failed: ...
[Auth] JWT expired
[Auth] Fingerprint mismatch
```

**Solution:**
- Sign out and sign in again
- Clear site data: DevTools → Application → Clear site data

### 6. **Infinite Retry Loop**
**Cause:** `monea:auth-expired` event triggering repeated /me calls

**Fix Applied:** 
✅ Updated `fetch-interceptor.ts` to only trigger event for `/api/auth/me` failures, not all auth endpoints

**Verify:**
- Check Network tab: should NOT see continuous /me requests
- Should NOT see repeated 401 errors

## Testing Checklist

### Step 1: Sign In
```javascript
// Test signin
fetch('https://api.moneoez.com/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Signin successful');
  console.log('Token in response:', !!data.token);
  console.log('User:', data.user);
  
  // Store token for testing
  window.__testToken = data.token;
});
```

### Step 2: Check Cookies
```javascript
// Check if cookie was set
const cookies = document.cookie;
console.log('Cookies:', cookies);

// Note: HttpOnly cookies won't be visible here
// Check DevTools → Application → Cookies instead
```

### Step 3: Test /me with Cookie
```javascript
// Test /me (should use cookie automatically)
fetch('https://api.moneoez.com/api/auth/me', {
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('/me with cookie:', data));
```

### Step 4: Test /me with Authorization Header
```javascript
// Test /me with explicit token (fallback)
fetch('https://api.moneoez.com/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${window.__testToken}`
  },
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('/me with Bearer token:', data));
```

## Changes Made

### 1. **Removed `Partitioned` Cookie Attribute**
**File:** `monea-api-worker/lib/auth.ts`
**Reason:** The `Partitioned` attribute can prevent cookies from being sent with `credentials: 'include'` in some browsers

**Before:**
```typescript
return `${name}=${value}; HttpOnly; Secure; Path=/; SameSite=None; Partitioned; Max-Age=${maxAgeSeconds}`;
```

**After:**
```typescript
return `${name}=${value}; HttpOnly; Secure; Path=/; SameSite=None; Max-Age=${maxAgeSeconds}`;
```

### 2. **Fixed Infinite Retry Loop**
**File:** `monea-webapp/src/lib/fetch-interceptor.ts`
**Reason:** `monea:auth-expired` was triggering on ALL 401s outside `/api/auth/*`, causing retry loops

**Before:**
```typescript
if (
  response.status === 401 &&
  (!apiPath.startsWith('/api/auth/') || apiPath === '/api/auth/me')
) {
  window.dispatchEvent(new CustomEvent('monea:auth-expired', { detail: { requestStartedAt } }));
}
```

**After:**
```typescript
// Only trigger auth-expired for /api/auth/me failures to avoid retry loops
if (response.status === 401 && apiPath === '/api/auth/me') {
  window.dispatchEvent(new CustomEvent('monea:auth-expired', { detail: { requestStartedAt } }));
}
```

### 3. **Enhanced Debug Logging**
**File:** `monea-api-worker/auth_handlers/me/handler.ts`
**Added:** Detailed logging of Authorization header and Cookie presence

## Next Steps

1. **Deploy the changes:**
   ```bash
   cd monea-api-worker
   npm run deploy
   
   cd ../monea-webapp
   npm run deploy
   ```

2. **Test in production:**
   - Open https://moneoez.com in incognito mode
   - Sign in
   - Check browser console for detailed auth logs
   - Verify /me endpoint returns user data

3. **If still failing:**
   - Check Cloudflare Workers logs (Cloudflare Dashboard → Workers → monea-api-worker → Logs)
   - Look for `[Auth]` prefixed messages
   - Share the logs for further debugging

## Browser-Specific Issues

### Chrome/Edge
- Check Settings → Privacy → Cookies → Allow all cookies
- Try disabling "Block third-party cookies"

### Firefox
- Check Settings → Privacy → Cookies and Site Data → Accept cookies and site data from websites
- Try disabling "Enhanced Tracking Protection" for moneoez.com

### Safari
- Check Settings → Privacy → Uncheck "Prevent cross-site tracking"
- Safari is strictest with cross-origin cookies

## Emergency Fallback

If cookies continue to fail, the API returns the token in the signin response body. The frontend can store it and use `Authorization: Bearer <token>` header instead of cookies.

This requires modifying the frontend auth state management to:
1. Store token from signin response
2. Add token to all API requests via Authorization header
3. Clear token on logout
