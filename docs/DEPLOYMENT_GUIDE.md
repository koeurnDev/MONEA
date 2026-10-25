# MONEA Template Licensing - Deployment Guide

**Date:** October 23, 2026  
**Version:** 2.0.0 - Template Licensing Release  
**Status:** Ready for Production Deployment

---

## Pre-Deployment Checklist

### ✅ Verify All Changes
- [ ] All 20 bug fixes completed
- [ ] Database migration file exists: `0003_template_licensing.sql`
- [ ] Template pricing API endpoints functional
- [ ] Template purchase flow tested
- [ ] Admin panel UI accessible
- [ ] Documentation complete

### ✅ Backup Current System
```bash
# Backup database
pg_dump $DATABASE_URL > monea_backup_$(date +%Y%m%d_%H%M%S).sql

# Backup current deployment (if using git)
git tag pre-template-licensing-$(date +%Y%m%d)
git push origin --tags
```

### ✅ Environment Variables Check
```bash
# Required environment variables
DATABASE_URL=<your-postgres-connection-string>
BAKONG_ACCOUNT_ID=<your-bakong-account>
BAKONG_MERCHANT_NAME=<your-merchant-name>

# Optional (recommended)
TEMPLATE_PRICING_ENABLED=true
```

---

## Deployment Steps

### Step 1: Database Migration

**Apply the TemplateLicense table migration:**

```bash
# Navigate to API worker directory
cd monea-api-worker

# Apply the base TemplateLicense migration only if the table does not exist yet
psql $DATABASE_URL < drizzle/migrations/0003_template_licensing.sql

# Apply additive migrations for existing installations
psql $DATABASE_URL < drizzle/migrations/0006_template_license_payment_hash.sql
psql $DATABASE_URL < drizzle/migrations/0007_template_license_receipt_review.sql
psql $DATABASE_URL < drizzle/migrations/0008_template_license_purchase_date.sql
psql $DATABASE_URL < drizzle/migrations/0009_template_license_schema_compatibility.sql
psql $DATABASE_URL < drizzle/migrations/0010_template_license_payment_qr.sql
```

Migration `0008_template_license_purchase_date.sql` is safe to re-run. It adds the missing
`purchaseDate` column with a current-time default, preserving existing license rows.
Migration `0009_template_license_schema_compatibility.sql` aligns older `TemplateLicense`
tables with the Prisma model. Existing rows with no recorded amount receive `0 USD`; their
license status and access are preserved.
Migration `0010_template_license_payment_qr.sql` stores active payment QR payloads so users
can close and reopen the purchase dialog without losing an unexpired five-minute QR.

**Verify migration:**
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'TemplateLicense';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'TemplateLicense';

-- Expected output:
-- idx_template_license_wedding
-- idx_template_license_status
-- idx_template_license_bakong
-- TemplateLicense_weddingId_templateId_key (UNIQUE)
```

### Step 2: Initialize Template Pricing

**Set default pricing in SystemConfig:**

```sql
UPDATE "SystemConfig" 
SET "templatePricing" = '{
  "khmer-legacy": {"name": "Khmer Legacy", "price": 0, "currency": "USD", "isFree": true},
  "elegant-gold": {"name": "Elegant Gold", "price": 5.00, "currency": "USD"},
  "modern-classic": {"name": "Modern Classic", "price": 7.00, "currency": "USD"},
  "premium-royal": {"name": "Premium Royal", "price": 9.00, "currency": "USD"},
  "sophisticated": {"name": "Sophisticated", "price": 0, "currency": "USD", "isFree": true},
  "minimalist": {"name": "Minimalist", "price": 5.00, "currency": "USD"},
  "romantic-blush": {"name": "Romantic Blush", "price": 6.00, "currency": "USD"},
  "contemporary": {"name": "Contemporary", "price": 4.00, "currency": "USD"}
}'::jsonb
WHERE id = 'GLOBAL';
```

**Verify:**
```sql
SELECT "templatePricing" FROM "SystemConfig" WHERE id = 'GLOBAL';
```

### Step 3: Deploy API Worker

**Option A: Cloudflare Workers (Wrangler)**

```bash
cd monea-api-worker

# Install dependencies (if needed)
npm install

# Deploy to production
npx wrangler deploy

# Verify deployment
curl https://your-api-domain.workers.dev/api/template-pricing
```

**Option B: Node.js/Docker**

```bash
cd monea-api-worker

# Build
npm run build

# Deploy (example using PM2)
pm2 restart monea-api-worker
pm2 logs monea-api-worker
```

### Step 4: Deploy Frontend

```bash
cd monea-webapp

# Install dependencies (if needed)
npm install

# Build production bundle
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy ./dist

# OR deploy to your hosting provider
# Example: Vercel
# vercel --prod
```

### Step 5: Smoke Test Critical Paths

**Test 1: Public Pricing Endpoint**
```bash
curl https://your-api-domain/api/template-pricing
# Expected: JSON with 8 template prices
```

**Test 2: Free Template Auto-Activation**
```bash
# Login as test user, select "khmer-legacy" template
# Expected: Immediate selection without payment
```

**Test 3: Paid Template Purchase Flow**
```bash
POST https://your-api-domain/api/template-purchase/initiate
{
  "weddingId": "test_wedding_id",
  "templateId": "elegant-gold"
}
# Expected: KHQR code returned
```

**Test 4: Admin Pricing Management**
```bash
# Navigate to: https://your-domain/admin/master/template-pricing
# Expected: UI shows all 8 templates with pricing
```

**Test 5: Export Access Control**
```bash
GET https://your-api-domain/api/admin/export/guests?weddingId=test_id
# Expected: 403 if no license, CSV download if licensed
```

### Step 6: Optional - Migrate Existing Users

**Run migration script for PRO/PREMIUM users:**

```bash
# Option A: Via admin endpoint (if implemented)
POST https://your-api-domain/api/admin/master/migrate-legacy-users
Authorization: Bearer <admin-token>

# Option B: Via direct script execution
cd monea-api-worker
npx tsx scripts/migrate-legacy-users.ts
```

**Preview before migrating:**
```bash
# Dry run to see what would be migrated
curl -X POST https://your-api-domain/api/admin/master/migrate-legacy-users/preview \
  -H "Authorization: Bearer <admin-token>"
```

---

## Post-Deployment Verification

### Monitor API Health

```bash
# Check API status
curl https://your-api-domain/api/ping

# Check template pricing cache
curl https://your-api-domain/api/template-pricing

# Check database connectivity
curl https://your-api-domain/api/admin/health
```

### Monitor Logs

**Cloudflare Workers:**
```bash
wrangler tail
```

**Node.js/PM2:**
```bash
pm2 logs monea-api-worker --lines 100
```

**Look for:**
- ✅ No errors loading template pricing
- ✅ License checks completing successfully
- ✅ No database connection issues
- ⚠️ Any migration warnings

### Verify Database State

```sql
-- Check template licenses created
SELECT COUNT(*) as total_licenses FROM "TemplateLicense";

-- Check active licenses
SELECT 
  status, 
  COUNT(*) as count 
FROM "TemplateLicense" 
GROUP BY status;

-- Check revenue
SELECT 
  currency, 
  SUM(amount) as total_revenue,
  COUNT(*) as sales_count
FROM "TemplateLicense"
WHERE status = 'ACTIVE' AND amount > 0
GROUP BY currency;
```

---

## Rollback Procedure

### If Issues Occur After Deployment:

**Option 1: Quick Rollback (Code Only)**
```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Redeploy previous version
cd monea-api-worker
npx wrangler deploy

cd ../monea-webapp
npx wrangler pages deploy ./dist
```

**Option 2: Database Rollback (If Needed)**
```bash
# Restore database backup
psql $DATABASE_URL < monea_backup_YYYYMMDD_HHMMSS.sql

# Note: TemplateLicense table can remain without breaking old code
```

**Option 3: Disable New Features**
```bash
# Temporarily disable template purchase routes in hono.ts
# Comment out these lines:
# app.route('/api/template-pricing', templatePricingRouter)
# app.route('/api/template-purchase', templatePurchaseRouter)

# Redeploy API worker
npx wrangler deploy
```

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Template Purchase Conversion Rate**
   ```sql
   SELECT 
     COUNT(DISTINCT "weddingId") as unique_buyers,
     COUNT(*) as total_purchases
   FROM "TemplateLicense"
   WHERE status = 'ACTIVE' AND amount > 0;
   ```

2. **Revenue by Template**
   ```sql
   SELECT 
     "templateId",
     COUNT(*) as sales,
     SUM(amount) as revenue
   FROM "TemplateLicense"
   WHERE status = 'ACTIVE' AND amount > 0
   GROUP BY "templateId"
   ORDER BY revenue DESC;
   ```

3. **Free vs Paid Template Usage**
   ```sql
   SELECT 
     CASE WHEN amount = 0 THEN 'FREE' ELSE 'PAID' END as type,
     COUNT(*) as count
   FROM "TemplateLicense"
   WHERE status = 'ACTIVE'
   GROUP BY type;
   ```

4. **Failed Purchase Attempts**
   ```sql
   SELECT COUNT(*) 
   FROM "TemplateLicense"
   WHERE status = 'PENDING' 
   AND "createdAt" < NOW() - INTERVAL '1 hour';
   ```

### Set Up Alerts

**Cloudflare Workers:**
- Enable Logpush to send logs to external service
- Set up alerts for 5xx errors
- Monitor memory/CPU usage

**Database:**
- Set up slow query alerts (> 1 second)
- Monitor connection pool usage
- Track table size growth

---

## Common Issues & Solutions

### Issue 1: "Template not found in pricing config"
**Cause:** Template ID mismatch  
**Solution:** 
```sql
-- Check configured templates
SELECT jsonb_object_keys("templatePricing") as template_ids
FROM "SystemConfig" WHERE id = 'GLOBAL';

-- Add missing template
UPDATE "SystemConfig"
SET "templatePricing" = "templatePricing" || 
  '{"new-template": {"name": "New Template", "price": 5.00, "currency": "USD"}}'::jsonb
WHERE id = 'GLOBAL';
```

### Issue 2: "Export feature requires license" even with license
**Cause:** Cache or query issue  
**Solution:**
```sql
-- Verify license exists
SELECT * FROM "TemplateLicense"
WHERE "weddingId" = '<wedding_id>' AND status = 'ACTIVE';

-- If exists but not working, check expiration
SELECT 
  "weddingId",
  "templateId",
  status,
  "expiresAt",
  CASE 
    WHEN "expiresAt" IS NULL THEN 'NEVER'
    WHEN "expiresAt" > NOW() THEN 'VALID'
    ELSE 'EXPIRED'
  END as expiry_status
FROM "TemplateLicense"
WHERE "weddingId" = '<wedding_id>';
```

### Issue 3: Payment verification fails
**Cause:** Bakong API configuration  
**Solution:**
```sql
-- Check Bakong config
SELECT "bakongConfig" FROM "SystemConfig" WHERE id = 'GLOBAL';

-- Verify required fields:
-- - accountID
-- - merchantName
-- - token (optional but recommended)
```

---

## Performance Optimization

### Database Indexes (Already Applied)
```sql
-- Verify indexes exist
\di TemplateLicense*

-- If missing, recreate:
CREATE INDEX IF NOT EXISTS idx_template_license_wedding 
  ON "TemplateLicense"("weddingId");
CREATE INDEX IF NOT EXISTS idx_template_license_status 
  ON "TemplateLicense"(status);
CREATE INDEX IF NOT EXISTS idx_template_license_bakong 
  ON "TemplateLicense"("bakongTrxId");
```

### Query Optimization
```sql
-- Add composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_template_license_wedding_active 
  ON "TemplateLicense"("weddingId", status) 
  WHERE status = 'ACTIVE';
```

### Caching Strategy
- Template pricing: Cached in SystemConfig (read once per request)
- License checks: Direct database query (< 5ms with indexes)
- Admin analytics: Consider caching for 5 minutes

---

## Support & Troubleshooting

### Debug Mode

**Enable verbose logging:**
```bash
# Cloudflare Workers
wrangler tail --format pretty

# Node.js
DEBUG=monea:* npm start
```

**Check specific operations:**
```typescript
// Add to template-licensing.ts for debugging
console.log('[Template License Check]', {
  weddingId,
  templateId,
  hasLicense,
  licenses: activeLicenses.length
});
```

### Contact Information

**For Technical Issues:**
- Review logs first
- Check database state
- Consult documentation in `/docs`

**For Business/Pricing Issues:**
- Review `MIGRATION_STATUS_FINAL.md`
- Check analytics queries
- Review revenue calculations

---

## Success Criteria

✅ **Deployment is successful when:**
- [ ] API responds to `/api/template-pricing`
- [ ] Frontend loads without errors
- [ ] Users can purchase templates
- [ ] Free templates auto-activate
- [ ] Export requires license
- [ ] Admin pricing UI accessible
- [ ] Analytics show template revenue
- [ ] No critical errors in logs
- [ ] Database queries < 100ms
- [ ] All existing features still work

---

## Next Steps After Deployment

1. **Week 1:**
   - Monitor conversion rates
   - Gather user feedback
   - Track any bugs or issues
   - Optimize pricing if needed

2. **Week 2-4:**
   - Run migration script for existing users
   - Analyze revenue data
   - Consider promotional pricing
   - Update documentation based on feedback

3. **Month 2+:**
   - Remove deprecated legacy endpoints
   - Optimize payment list query with UNION
   - Add template license history UI
   - Consider subscription options

---

**Deployment Approved By:** Ready for Production  
**Rollback Plan:** Documented above  
**Emergency Contact:** Check logs + database state first  
**Documentation:** Complete in `/docs` directory

🚀 **Ready to Deploy!**
