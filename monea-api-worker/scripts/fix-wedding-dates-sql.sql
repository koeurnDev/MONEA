-- Fix corrupted Wedding.date fields in database
-- This script converts JSON objects and invalid values to valid date strings

-- First, let's see what we're dealing with
SELECT id, "groomName", "brideName", date, pg_typeof(date) as date_type
FROM "Wedding"
WHERE date IS NOT NULL
LIMIT 10;

-- Fix strategy:
-- 1. For rows where date is a JSON object {}, set to NULL or a default date
-- 2. For rows where date is a valid timestamp string, keep it

-- Update corrupted dates to NULL (will need manual fix later)
-- Note: PostgreSQL stores the column as text/varchar, so we need to check the value
UPDATE "Wedding"
SET date = NULL
WHERE date::text = '{}'
   OR date::text = ''
   OR date::text = 'null';

-- Alternative: Set to a default date instead of NULL
-- UPDATE "Wedding"
-- SET date = '2026-01-01T00:00:00.000Z'
-- WHERE date::text = '{}'
--    OR date::text = ''
--    OR date::text = 'null';

-- Verify the fix
SELECT id, "groomName", "brideName", date
FROM "Wedding"
WHERE date IS NULL OR date::text = '{}';
