# 🔍 Authentication Diagnostic Guide

**Issue:** User can sign in but immediately gets 401 on `/api/auth/me`, preventing dashboard access.

**Status:** Debug logging deployed to backend. We need to check what's happening.

---

## Step 1: Check Cloudflare Worker Logs

### Option A: Command Line
```bash
cd d:\MONEO\monea-api-worker
wrangler tail
```

This shows real-time logs from the backend.

### Option B: Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select your worker "monea-api"
3. Click "Logs" tab
4. Filter for recent requests

---

## Step 2: Reproduce the Issue

1. Go to: https://moneoez.com/sign-in
2. Enter email: `test@example.com`
3. Enter password: `your-password`
4. Click "ចូលប្រើប្រាស់" (Sign In)
5. **Watch the console** - you should see error about 401

---

## Step 3: Read the Debug Logs

When you try to access dashboard, look for logs like:

### ✅ If working:
```
[Auth /me] Starting GET request from Hono router
[Auth /me] Request headers: {
  cookie: 'present',
  authorization: 'missing',
  origin: 'https://moneoez.com'
}
[Auth /me] Attempting to get server user...
[Auth /me] User found: user-123, type: user
[Auth /me] Querying database for user: user-123
[Auth /me] Database queries successful for user: user-123
[Auth /me] User authenticated successfully: user-123, role: USER
```

### ❌ If broken:
```
[Auth /me] Starting GET request from Hono router
[Auth /me] Request headers: {
  cookie: 'missing',  ← THIS IS THE PROBLEM
  authorization: 'missing',
  origin: 'https://moneoez.com'
}
[Auth /me] Attempting to get server user...
[Auth /me] No valid user session found
→ Returns 401
```

---

## Diagnostic Checklist

### Browser Side
- [ ] Open DevTools → Application → Cookies
- [ ] Look for `.moneoez.com` domain
- [ ] Check if `token` cookie exists after signin
- [ ] Check cookie properties:
  - [ ] Domain should be empty or match current domain
  - [ ] Path: `/`
  - [ ] HttpOnly: checked
  - [ ] Secure: checked
  - [ ] SameSite: `None`

### Network Side
- [ ] Open DevTools → Network tab
- [ ] Look at `signin` request → Response tab
- [ ] Check for `Set-Cookie` header
- [ ] Look at `auth/me` request → Request Headers
- [ ] Check for `Cookie:` header (should contain `token=...`)

### Server Side
- [ ] Run `wrangler tail` to watch logs
- [ ] Sign in again
- [ ] Look for `[Auth /me]` messages
- [ ] Check if `cookie: 'present'` or `'missing'`

---

## Common Issues & Solutions

### Issue 1: Cookie Shows "missing" in Logs
**Problem:** Browser not sending cookie to API

**Check:**
1. Is cookie stored in browser?
2. Is cookie domain correct?
3. Are you using https:// (not http://)
4. Are you using correct API endpoint?

**Solution:**
- Clear all cookies
- Sign out completely
- Close browser
- Reopen and try signing in again
- Check if cookie appears in DevTools

### Issue 2: Cookie Shows "present" but Still 401
**Problem:** Cookie is sent but token validation fails

**Check Backend Logs:**
- Look for token validation errors
- Check if JWT signature verification failing
- Check if database lookup failing
- Check if user account is locked/deleted

**Possible Causes:**
1. JWT_SECRET changed between sessions
2. User account deleted
3. Token revoked
4. Database connection error

### Issue 3: ERR_BLOCKED_BY_CLIENT
**This is NOT a backend issue** - it's a browser extension

**Solution:**
1. Use incognito/private browsing mode
2. Disable ad blocker for moneoez.com
3. Try different browser
4. Check which extension is blocking

---

## Debug Information to Collect

**If you still can't sign in, please provide:**

1. **Browser Console Error:**
   ```
   Copy the full error message from F12 → Console
   ```

2. **Network Tab Response:**
   ```
   F12 → Network → auth/me request
   Copy the full response body
   ```

3. **Wrangler Logs:**
   ```
   Run: wrangler tail
   Try signing in
   Copy the [Auth /me] log lines
   ```

4. **Cookie Information:**
   ```
   F12 → Application → Cookies → .moneoez.com
   Copy the token cookie details
   ```

5. **Request Headers:**
   ```
   F12 → Network → auth/me
   Look at Request Headers tab
   Copy the Cookie header value
   ```

---

## Quick Test Command

After signing in, open browser console and run:

```javascript
// Check if cookie is stored
document.cookie
// Should output: token=xyz...

// Check if API is accessible
fetch('https://api.moneoez.com/api/auth/me', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data))

// Should either:
// ✅ Return user object (success)
// ❌ Return {"error":"Unauthorized"} (cookie not sent)
```

---

## Workaround for Testing

If cookies aren't working, you can test auth by passing token manually:

```javascript
// Get the token from signin response
const signinResponse = await fetch('https://api.moneoez.com/api/auth/signin', {
  method: 'POST',
  body: JSON.stringify({email: 'test@example.com', password: 'password'}),
  credentials: 'include'
})

const signinData = await signinResponse.json()
console.log('Signin response:', signinData)

// Then use token in Authorization header
fetch('https://api.moneoez.com/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${signinData.token}`  // If returned in response
  }
})
```

---

## Next Steps

1. **Try signing in again**
2. **Check Cloudflare logs** - run `wrangler tail`
3. **Look for cookie presence** in the `[Auth /me]` log messages
4. **Share the log output** so I can diagnose the issue

---

**Waiting for logs to diagnose the issue!** 🔍
