# Fix Google SSO WebSocket 403 Error

## Problem
```
Failed to establish the WebSocket connection: expected server to reply 
with HTTP status code 101 (switching protocols), but received 403 instead.
```

## Root Cause
The `DATABASE_URL` secret in Cloudflare Workers is using a **WebSocket pooled connection string** instead of an **HTTP connection string**. Cloudflare Workers runtime **blocks WebSocket connections** with HTTP 403.

## Solution
Update the `DATABASE_URL` secret to use **Neon HTTP endpoint** instead of pooled connection.

---

## Step-by-Step Fix

### 1. Get Neon HTTP Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project `MONEA`
3. Go to **Connection Details**
4. **IMPORTANT**: Select connection method as **"HTTP"** or **"Serverless"** (NOT "Pooled" or "Direct")
5. Copy the HTTP connection string - it should look like:
   ```
   postgresql://user:pass@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Update Cloudflare Worker Secret

Run this command to update the DATABASE_URL:

```bash
cd monea-api-worker
npx wrangler secret put DATABASE_URL
```

When prompted, paste the **HTTP connection string** from step 1.

### 3. Verify the Fix

After updating the secret:

```bash
# Deploy the worker
npx wrangler deploy

# Test Google SSO login
# Go to https://monea-webapp.pages.dev/sign-in
# Click "Google" button
# Should now work without WebSocket error
```

---

## Alternative: Check Current DATABASE_URL Format

To check what type of connection string you're using (cannot see the actual value):

```bash
cd monea-api-worker
npx wrangler secret list
```

Look for `DATABASE_URL` - if the error persists, it's definitely using the wrong format.

---

## Technical Details

### Why HTTP Instead of WebSocket?

**Cloudflare Workers Runtime:**
- ✅ Supports HTTP/HTTPS fetch requests
- ❌ Blocks WebSocket connections with 403 Forbidden
- ❌ Cannot use `?pgbouncer=true` pooled connections

**Neon Serverless Driver:**
```typescript
import { neon } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

// Uses fetch() under the hood - works on Cloudflare Workers
const sql = neon(DATABASE_URL);
const adapter = new PrismaNeonHTTP(sql);
```

### Code is Already Correct

The `lib/prisma.ts` already uses the HTTP adapter:
- ✅ Uses `@neondatabase/serverless` 
- ✅ Uses `PrismaNeonHTTP` adapter
- ✅ Routes through `sql.query()` instead of WebSocket

**The only issue is the DATABASE_URL secret value!**

---

## Verification Checklist

After updating DATABASE_URL:

- [ ] Deploy worker: `npx wrangler deploy`
- [ ] Test email/password login (should work - no SSO)
- [ ] Test Google SSO login (should work - no WebSocket error)
- [ ] Check browser console - no 403 errors
- [ ] Check worker logs: `npx wrangler tail --env production`

---

## If Still Not Working

1. **Wait 2-5 minutes** after updating the secret (Cloudflare propagation time)
2. **Clear browser cache** and try in incognito mode
3. **Check worker logs** while testing:
   ```bash
   npx wrangler tail --env production
   ```
4. **Verify Google OAuth Console** has correct redirect URI:
   ```
   https://monea-api.seabkoeurn64.workers.dev/api/auth/sso/callback
   ```

---

## Contact

If the issue persists after following all steps:
1. Share worker logs from `npx wrangler tail`
2. Share browser console errors
3. Confirm DATABASE_URL was updated successfully
