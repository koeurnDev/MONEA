# 🚀 Quick Deployment Steps

## ✅ Pre-Flight Check
- [x] All 20/20 tasks complete
- [x] Migration file exists: `0003_template_licensing.sql`
- [x] API dependencies installed
- [ ] Database migration applied
- [ ] API worker deployed
- [ ] Frontend built and deployed

---

## Step 1: Apply Database Migration ⚡

```powershell
# Option A: Using Drizzle (Recommended)
cd monea-api-worker
npx drizzle-kit push

# Option B: Manual SQL (if Drizzle fails)
# Connect to your database and run:
# monea-api-worker/drizzle/migrations/0003_template_licensing.sql
```

---

## Step 2: Initialize Template Pricing 🎨

Run this SQL in your database:

```sql
UPDATE "SystemConfig" 
SET "templatePricing" = '{
  "khmer-legacy": {
    "name": "Khmer Legacy", 
    "price": 0, 
    "currency": "USD", 
    "description": "Classic Khmer-style wedding template",
    "isFree": true,
    "eventTypes": ["wedding", "anniversary"]
  },
  "elegant-gold": {
    "name": "Elegant Gold", 
    "price": 5.00, 
    "currency": "USD",
    "description": "Elegant gold-themed design",
    "eventTypes": ["wedding"]
  },
  "modern-classic": {
    "name": "Modern Classic", 
    "price": 7.00, 
    "currency": "USD",
    "description": "Modern and classic fusion",
    "eventTypes": ["wedding", "anniversary"]
  },
  "premium-royal": {
    "name": "Premium Royal", 
    "price": 9.00, 
    "currency": "USD",
    "description": "Royal and premium design",
    "eventTypes": ["wedding"]
  },
  "sophisticated": {
    "name": "Sophisticated", 
    "price": 0, 
    "currency": "USD",
    "description": "Sophisticated modern design",
    "isFree": true,
    "eventTypes": ["wedding", "anniversary"]
  },
  "minimalist": {
    "name": "Minimalist", 
    "price": 5.00, 
    "currency": "USD",
    "description": "Clean minimalist design",
    "eventTypes": ["wedding", "anniversary"]
  },
  "romantic-blush": {
    "name": "Romantic Blush", 
    "price": 6.00, 
    "currency": "USD",
    "description": "Romantic blush tones",
    "eventTypes": ["wedding"]
  },
  "contemporary": {
    "name": "Contemporary", 
    "price": 4.00, 
    "currency": "USD",
    "description": "Contemporary fresh design",
    "eventTypes": ["wedding", "anniversary"]
  }
}'::jsonb
WHERE id = 'GLOBAL';
```

---

## Step 3: Deploy API Worker 🔧

```powershell
cd monea-api-worker

# Deploy to Cloudflare Workers
npx wrangler deploy

# Check deployment
# Visit: https://your-api-domain.workers.dev/api/template-pricing
```

---

## Step 4: Deploy Frontend 🎯

```powershell
cd ..\monea-webapp

# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy ./dist
```

---

## Step 5: Quick Smoke Test 🧪

### Test 1: API Health
```powershell
curl https://your-api-domain/api/template-pricing
# Expected: JSON with 8 templates
```

### Test 2: Admin Panel
Visit: `https://your-domain/admin/master/template-pricing`
- Should show all templates with pricing
- Can edit prices
- Can toggle free/paid status

### Test 3: Template Purchase
1. Login as regular user
2. Create/edit wedding
3. Select a paid template (e.g., "Elegant Gold")
4. Should show price and "Purchase" button
5. Click purchase → should generate KHQR code

### Test 4: Free Template
1. Select "Khmer Legacy" or "Sophisticated"
2. Should auto-activate without payment

---

## Step 6: (Optional) Migrate Existing Users 📊

**Preview what will be migrated:**
```sql
SELECT 
  id,
  "groomName",
  "brideName",
  "packageType"
FROM "Wedding"
WHERE "packageType" IN ('PRO', 'PREMIUM');
```

**Run migration script:**
```powershell
cd monea-api-worker
npx tsx scripts/migrate-legacy-users.ts
```

This will auto-grant templates to existing PRO/PREMIUM users.

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ API responds at `/api/template-pricing`  
✅ Admin pricing UI loads without errors  
✅ Users can purchase paid templates  
✅ Free templates auto-activate  
✅ Export features check template licenses  
✅ No errors in Wrangler logs  

---

## 🆘 If Something Goes Wrong

### Database Connection Issues
```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'TemplateLicense';
```

### API Not Responding
```powershell
# Check Wrangler logs
wrangler tail

# Look for errors mentioning:
# - TemplateLicense
# - template-pricing
# - template-purchase
```

### Rollback if Needed
```powershell
# Just redeploy previous version
git checkout <previous-commit>
cd monea-api-worker
npx wrangler deploy
```

---

## 📞 Need Help?

1. Check full deployment guide: `docs/DEPLOYMENT_GUIDE.md`
2. Review migration status: `docs/MIGRATION_STATUS_FINAL.md`
3. See all bug fixes: `docs/BUG_FIXES_TEMPLATE_LICENSING.md`

---

**Ready to deploy? Start with Step 1! 🚀**
