# 🔧 Fix: 401 Retry Loop - Stop Repeated Fetch Calls

**Issue:** Frontend kept calling `/api/auth/me` repeatedly even after getting 401, causing console spam

**Root Cause:** `useAuth.tsx` had a pending retry mechanism that would keep retrying silent fetches without proper backoff

---

## What Was Fixed

### Changes to `useAuth.tsx`

**Problem:**
```typescript
// Old code - would keep retrying
finally {
    setIsLoading(false);
    fetchingRef.current = false;
    if (pendingSilentFetchRef.current) {
        setTimeout(() => { void fetchUser({ silent: true }) }, 0)  // ← No delay, instant retry!
    }
}
```

**Solution:**
```typescript
// New code - proper handling
finally {
    // ... existing code ...
    if (pendingSilentFetchRef.current) {
        pendingSilentFetchRef.current = false
        const publicPaths = ['/', '/templates', '/contact', '/support', ...];
        if (!publicPaths.includes(window.location.pathname)) {
            setTimeout(() => { void fetchUser({ silent: true }) }, 5000);  // ← 5 second backoff
        }
    }
}
```

### Additional Improvements

1. **Reset retry counter on 401**
   ```typescript
   if (res.status === 401) {
       setUser(null);
       retryCountRef.current = 0;  // ← Don't keep retrying
       setIsLoading(false);
       return;
   }
   ```

2. **Ensure isLoading is always set**
   - Set `setIsLoading(false)` explicitly in each status handler
   - Prevents loading state from getting stuck

3. **Skip retries on public pages**
   - Check if user is on public path
   - Don't retry auth checks on homepage, templates, etc.

---

## Result

### Before ❌
```
GET /api/auth/me 401
GET /api/auth/me 401
GET /api/auth/me 401
GET /api/auth/me 401  ← Repeats constantly, console spam
```

### After ✅
```
GET /api/auth/me 401
→ Sets user to null
→ Stops retrying
→ Redirects to sign-in (if needed)
→ Clean console
```

---

## What's Correct Now

✅ **401 response** → User not logged in (correct, no retry)  
✅ **No console spam** → Auth check runs once per page load  
✅ **User redirected** → Goes to /sign-in if not authenticated  
✅ **Silent fetches** → Only retry on actual server errors (5xx)  
✅ **5 second backoff** → Prevents network spam  

---

## Testing

1. Visit https://moneoez.com (not logged in)
2. Open DevTools → Console
3. **Expected:**
   - ✅ One or two `GET /api/auth/me 401` calls
   - ✅ No infinite spam
   - ✅ Redirects to /sign-in
   - ✅ Clean console

4. **Log in with credentials**
5. **Expected:**
   - ✅ Redirects to /dashboard
   - ✅ If Platform Owner: 2FA modal shows
   - ✅ Button "សរសេរ 2FA ឥឡូវ" works
   - ✅ Clean console

---

## Deployed

✅ **Live:** October 25, 2026  
✅ **URL:** https://moneoez.com  
✅ **Status:** 401 retry loop fixed

---

**No more console spam!** 🎉
