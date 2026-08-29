# Fix Database Date Column Corruption

## Problem
```
Prisma Error P2023:
Inconsistent column data: Conversion failed: 
expected a string in column 'createdAt', found {}
expected a string in column 'date', found {}
```

## Root Cause
Database tables have **empty objects `{}`** in DateTime columns instead of valid timestamps. This likely happened due to:
- Migration issues
- Data import problems
- Invalid manual data entry

---

## ✅ Solution: Fix Database Data Directly

### Option 1: Run SQL Script in Neon Console (Recommended)

1. Go to [Neon SQL Editor](https://console.neon.tech)
2. Select your **MONEA** project
3. Select **neondb** database
4. Open SQL Editor
5. Copy and paste the SQL from `fix-corrupted-dates.sql`
6. Click **"Run"**

The script will:
- Set NULL/corrupt `createdAt` to NOW()
- Set NULL/corrupt `updatedAt` to NOW()
- Set NULL/corrupt `date` to NOW() + 30 days (placeholder - you can edit weddings later)
- Set NULL/corrupt `expiresAt` to NOW() + 365 days

---

### Option 2: Run via Prisma (Alternative)

If you have local access to database:

```bash
cd monea-api-worker

# Connect to database and run raw SQL
npx prisma db execute --file fix-corrupted-dates.sql --schema prisma/schema.prisma
```

---

## After Fix

1. **Test Google SSO again** - should work without P2023 errors
2. **Check wedding data** - dates might be placeholder values, need to edit in admin panel
3. **Monitor logs** - `npx wrangler tail` to verify no more date errors

---

## Verification

Run this query in Neon SQL Editor to check if fix worked:

```sql
-- Count corrupt records (should return 0 after fix)
SELECT 
  'User' as table_name,
  COUNT(*) as corrupt_count
FROM "User"
WHERE "createdAt" IS NULL 
   OR "createdAt"::text = '{}'
   OR "updatedAt" IS NULL 
   OR "updatedAt"::text = '{}'

UNION ALL

SELECT 
  'Wedding' as table_name,
  COUNT(*) as corrupt_count
FROM "Wedding"
WHERE "date" IS NULL 
   OR "date"::text = '{}'
   OR "createdAt" IS NULL 
   OR "createdAt"::text = '{}'
   OR "updatedAt" IS NULL 
   OR "updatedAt"::text = '{}';
```

**Expected result:** Both rows show `corrupt_count = 0`

---

## Prevention

To prevent this in future:

1. **Always use Prisma migrations** - don't manually edit database schema
2. **Use default values** in schema: `@default(now())`
3. **Validate data** before import
4. **Test migrations** in development before production

---

## If Still Not Working

If errors persist after running SQL fix:

1. Check if there are other tables with corrupt dates
2. Check Prisma schema matches database schema
3. Regenerate Prisma client: `npx prisma generate`
4. Redeploy worker: `npx wrangler deploy`
5. Clear Prisma cache: delete `node_modules/.prisma` folder and regenerate

---

## Summary

**Problem:** Database has `{}` in DateTime columns  
**Solution:** Run SQL UPDATE to fix corrupt data  
**File:** `fix-corrupted-dates.sql`  
**Where:** Neon Console SQL Editor  
**Time:** ~1 minute to execute
