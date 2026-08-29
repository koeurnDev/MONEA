-- Fix corrupted date columns in MONEA database
-- Run this directly in Neon SQL Editor: https://console.neon.tech

-- 1. Fix User table - set NULL createdAt/updatedAt to NOW()
UPDATE "User"
SET "createdAt" = NOW()
WHERE "createdAt" IS NULL OR "createdAt"::text = '{}';

UPDATE "User"
SET "updatedAt" = NOW()
WHERE "updatedAt" IS NULL OR "updatedAt"::text = '{}';

-- 2. Fix Wedding table - set NULL date to NOW() + 30 days (placeholder)
UPDATE "Wedding"
SET "date" = NOW() + INTERVAL '30 days'
WHERE "date" IS NULL OR "date"::text = '{}';

UPDATE "Wedding"
SET "createdAt" = NOW()
WHERE "createdAt" IS NULL OR "createdAt"::text = '{}';

UPDATE "Wedding"
SET "updatedAt" = NOW()
WHERE "updatedAt" IS NULL OR "updatedAt"::text = '{}';

-- 3. Fix other DateTime columns in Wedding
UPDATE "Wedding"
SET "expiresAt" = NOW() + INTERVAL '365 days'
WHERE "expiresAt" IS NULL OR "expiresAt"::text = '{}';

-- 4. Check for any remaining corrupt data
SELECT 
  'User' as table_name,
  COUNT(*) as corrupt_count
FROM "User"
WHERE "createdAt" IS NULL OR "updatedAt" IS NULL

UNION ALL

SELECT 
  'Wedding' as table_name,
  COUNT(*) as corrupt_count
FROM "Wedding"
WHERE "date" IS NULL OR "createdAt" IS NULL OR "updatedAt" IS NULL;

-- 5. Verify fix
SELECT 
  id, 
  name, 
  email, 
  "createdAt", 
  "updatedAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 5;

SELECT 
  id, 
  "groomName", 
  "brideName", 
  "date", 
  "createdAt", 
  "updatedAt"
FROM "Wedding"
ORDER BY "createdAt" DESC
LIMIT 5;
