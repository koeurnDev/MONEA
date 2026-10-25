# Manual Deployment Steps Required

## ⚠️ File Editing Issue Detected

The automated file editing encountered issues. Please complete these manual steps:

---

## Step 1: Edit `monea-api-worker/hono.ts`

### Add imports (line 31, after telegram webhook import):
```typescript
import telegramWebhookRouter from './routers/telegram/webhook';
import templatePricingRouter from './routers/template-pricing';
import templatePurchaseRouter from './routers/template-purchase';
import { cors } from 'hono/cors';
```

### Add routes (line 190, after telegram webhook route):
```typescript
app.route('/telegram/webhook', telegramWebhookRouter);
app.route('/template-pricing', templatePricingRouter);
app.route('/template-purchase', templatePurchaseRouter);

// Global Error Handler - simplified for better performance
```

---

## Step 2: Deploy API Worker

```powershell
cd monea-api-worker
npx wrangler deploy
```

---

## Step 3: Test Deployment

```powershell
curl https://monea-api.seabkoeurn64.workers.dev/api/template-pricing
```

Should return JSON with template pricing.

---

## Step 4: Initialize Database (if not done)

Run this SQL in your production database:

```sql
-- Create TemplateLicense table
CREATE TABLE IF NOT EXISTS "TemplateLicense" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "weddingId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "paymentOrderId" TEXT,
  "bakongTrxId" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TemplateLicense_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TemplateLicense_weddingId_templateId_key" ON "TemplateLicense"("weddingId", "templateId");
CREATE INDEX "idx_template_license_wedding" ON "TemplateLicense"("weddingId");
CREATE INDEX "idx_template_license_status" ON "TemplateLicense"("status");
CREATE INDEX "idx_template_license_bakong" ON "TemplateLicense"("bakongTrxId");

-- Initialize template pricing
UPDATE "SystemConfig" 
SET "templatePricing" = '{
  "khmer-legacy": {"name": "Khmer Legacy", "price": 0, "currency": "USD", "isFree": true, "eventTypes": ["wedding", "anniversary"]},
  "elegant-gold": {"name": "Elegant Gold", "price": 5.00, "currency": "USD", "eventTypes": ["wedding"]},
  "modern-classic": {"name": "Modern Classic", "price": 7.00, "currency": "USD", "eventTypes": ["wedding", "anniversary"]},
  "premium-royal": {"name": "Premium Royal", "price": 9.00, "currency": "USD", "eventTypes": ["wedding"]},
  "sophisticated": {"name": "Sophisticated", "price": 0, "currency": "USD", "isFree": true, "eventTypes": ["wedding", "anniversary"]},
  "minimalist": {"name": "Minimalist", "price": 5.00, "currency": "USD", "eventTypes": ["wedding", "anniversary"]},
  "romantic-blush": {"name": "Romantic Blush", "price": 6.00, "currency": "USD", "eventTypes": ["wedding"]},
  "contemporary": {"name": "Contemporary", "price": 4.00, "currency": "USD", "eventTypes": ["wedding", "anniversary"]}
}'::jsonb
WHERE id = 'GLOBAL';
```

---

## Step 5: Deploy Frontend (Optional)

```powershell
cd monea-webapp
npm install --legacy-peer-deps
npm run build
npx wrangler pages deploy ./dist
```

---

## What's Already Complete ✅

- ✅ Template licensing module (`lib/template-licensing.ts`)
- ✅ Template pricing module (`lib/template-pricing.ts`)
- ✅ Template pricing setup (`lib/template-pricing-setup.ts`)
- ✅ Template pricing router (`routers/template-pricing.ts`)  
- ✅ Template purchase router (`routers/template-purchase.ts`)
- ✅ Payment Service license activation methods
- ✅ Wedding validation using canUseTemplate()
- ✅ Export access control via template licenses
- ✅ Admin pricing management UI
- ✅ Frontend template selector with pricing
- ✅ Migration script (`scripts/migrate-legacy-users.ts`)
- ✅ SQL queries and documentation

---

## What's Missing (Just the Router Registration)

- ⚠️ Template routers not registered in `hono.ts` (manual edit needed)

---

## After Manual Edit & Deploy

Test these endpoints:

1. **Template Pricing:** `GET /api/template-pricing`
2. **Purchase Initiate:** `POST /api/template-purchase/initiate`
3. **Admin Pricing UI:** `/admin/master/template-pricing`
4. **Template Selection:** `/dashboard/design`

---

## Need Help?

See full documentation:
- `docs/DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOY_NOW.md` - Quick deployment checklist
- `docs/BUG_FIXES_TEMPLATE_LICENSING.md` - All completed tasks

---

**Current Status:**
- Code: ✅ 100% Complete (20/20 tasks)
- Routing: ⚠️ Manual edit required
- Database: ⏳ Pending initialization
- Deployment: ⏳ Pending after routing fix
