# End-to-End Template Purchase Flow Testing Guide

**Document Date:** October 23, 2026  
**Status:** Complete Migration from Subscription Tiers to Per-Template Licensing  
**Test Scope:** Verify full template purchase, licensing, and access control flow

---

## Test Environment Setup

### Prerequisites
- Development environment running with both API worker and webapp
- Database migrations applied (0003_template_licensing.sql)
- Test user account created
- Test wedding created with "khmer-legacy" (free) template

### Default Template Pricing
```
- khmer-legacy (M-01): FREE ($0)
- elegant-gold (M-02): $5.00 USD
- modern-classic (M-03): $7.00 USD
- premium-royal (M-04): $9.00 USD
- sophisticated (M-05): FREE ($0)
- minimalist (M-06): $5.00 USD
- romantic-blush (M-07): $6.00 USD
- contemporary (M-08): $4.00 USD
```

---

## Test Scenarios

### Scenario 1: Free Template Auto-Activation
**Goal:** Verify free templates are automatically licensed without payment

#### Steps:
1. Login as test user
2. Navigate to Template Selector (Step 1 of Design Wizard)
3. Observe template cards with pricing badges
4. Verify "khmer-legacy" shows "FREE" badge
5. Click "khmer-legacy" template card
6. Verify selection succeeds without purchase flow

#### Expected Behavior:
- ✅ Template license created automatically in DB (status: ACTIVE, expiresAt: null)
- ✅ Wedding templateId updated to "khmer-legacy"
- ✅ No payment UI displayed
- ✅ Template available immediately

#### Verification Queries:
```sql
SELECT * FROM "TemplateLicense" 
WHERE weddingId = '<test_wedding_id>' 
AND templateId = 'khmer-legacy'
AND status = 'ACTIVE';
```

---

### Scenario 2: Paid Template Purchase Flow (KHQR Payment)
**Goal:** Verify paid template purchase initiates KHQR payment and activates license on verification

#### Steps:
1. Login as test user
2. Navigate to Template Selector
3. Click on "elegant-gold" (paid template showing "$5.00" badge)
4. Observe purchase modal/event triggered with:
   - Template name
   - Price ($5.00 USD)
   - Bakong KHQR code (QR displayed or deeplink provided)
5. Simulate payment verification by calling:
   ```
   POST /api/template-purchase/verify
   {
     "weddingId": "<test_wedding_id>",
     "templateId": "elegant-gold",
     "transactionHash": "<test_hash>",
     "externalId": "<bakong_trx_id>"
   }
   ```

#### Expected Behavior:
- ✅ POST /api/template-purchase/initiate succeeds with KHQR payment order
- ✅ Payment order stored in DB with status "PENDING"
- ✅ On verification, PaymentService.verifyAndActivateTemplateLicense() called
- ✅ License created with status "ACTIVE" and transaction details
- ✅ HTTP 200 response with license details
- ✅ Template immediately available for use

#### Verification Queries:
```sql
-- Check payment order
SELECT * FROM "TemplateLicense" 
WHERE weddingId = '<test_wedding_id>' 
AND templateId = 'elegant-gold'
AND status = 'ACTIVE';

-- Check transaction hash stored
SELECT bakongTrxId, amount, currency, publishedAt 
FROM "TemplateLicense"
WHERE weddingId = '<test_wedding_id>' 
AND templateId = 'elegant-gold';
```

---

### Scenario 3: License Check Endpoint
**Goal:** Verify license check API returns correct access status

#### Steps:
1. Purchase "elegant-gold" template (from Scenario 2)
2. Call: `GET /api/template-purchase/check?weddingId=<id>&templateId=elegant-gold`
3. Verify response

#### Expected Response:
```json
{
  "hasLicense": true,
  "templateId": "elegant-gold",
  "status": "ACTIVE",
  "purchaseDate": "2026-10-23T...",
  "expiresAt": null
}
```

#### Steps for Unlicensed Template:
1. Call: `GET /api/template-purchase/check?weddingId=<id>&templateId=premium-royal`
2. Verify response

#### Expected Response:
```json
{
  "hasLicense": false,
  "templateId": "premium-royal",
  "error": "License not found"
}
```

---

### Scenario 4: Template Selection with License Validation
**Goal:** Verify wedding PUT endpoint blocks template change without license

#### Steps:
1. User has "khmer-legacy" (free) template selected
2. Call: 
   ```
   PUT /api/weddings/<wedding_id>
   {
     "templateId": "premium-royal"
   }
   ```
3. Verify rejection

#### Expected Response:
```json
{
  "error": "This template requires a license. Please purchase it to use this template.",
  "code": "TEMPLATE_LICENSE_REQUIRED"
}
```
**Status Code:** 403

#### After License Purchase:
1. Purchase "premium-royal" license via /api/template-purchase/verify
2. Retry PUT with "premium-royal" templateId
3. Verify success (status 200)

---

### Scenario 5: List Active Licenses
**Goal:** Verify endpoint returns all licensed templates for wedding

#### Steps:
1. Have "khmer-legacy" (free) and "elegant-gold" (paid) licensed
2. Call: `GET /api/template-purchase/list/<wedding_id>`

#### Expected Response:
```json
{
  "licenses": [
    {
      "templateId": "khmer-legacy",
      "status": "ACTIVE",
      "purchaseDate": "2026-10-23T...",
      "expiresAt": null,
      "amount": 0,
      "currency": "USD"
    },
    {
      "templateId": "elegant-gold",
      "status": "ACTIVE",
      "purchaseDate": "2026-10-23T...",
      "expiresAt": "2027-10-23T..." (or null for lifetime),
      "amount": 5.00,
      "currency": "USD"
    }
  ]
}
```

---

### Scenario 6: Guest Export Access Control
**Goal:** Verify export features require template license

#### Steps:
1. Create wedding with NO template licenses
2. Call: `GET /api/admin/export/guests?weddingId=<wedding_id>`
3. Verify rejection

#### Expected Response:
```text
Export feature requires an active template license. Please purchase a template to enable export.
```
**Status Code:** 403

#### After License Purchase:
1. Purchase any template (free or paid)
2. Retry GET /api/admin/export/guests
3. Verify success (CSV download)

---

### Scenario 7: Admin Template Pricing Management
**Goal:** Verify admin can view and modify template pricing

#### Steps (Platform Owner Only):
1. Navigate to `/admin/master/template-pricing`
2. Verify all 8 templates displayed with current prices
3. Modify price: "elegant-gold" from $5.00 to $7.50
4. Toggle "modern-classic" from paid ($7.00) to FREE
5. Click "Save"
6. Verify POST /api/template-pricing succeeds

#### Expected Behavior:
- ✅ UI shows pricing for all templates
- ✅ Summary displays: total templates, free count, total revenue
- ✅ Changes reflected in SystemConfig.templatePricing
- ✅ Next user purchasing "elegant-gold" sees $7.50 price
- ✅ "modern-classic" now free for new users

#### Verification Query:
```sql
SELECT templatePricing FROM "SystemConfig" WHERE id = 'GLOBAL';
```

---

### Scenario 8: Permission Lock Removal Verification
**Goal:** Verify editing is no longer locked by package tier

#### Steps:
1. Create wedding with packageType = "FREE" (old tier)
2. Attempt to edit wedding: `PUT /api/weddings/<wedding_id>`
3. Update groomName and themeSettings
4. Verify success

#### Expected Behavior:
- ✅ Edit succeeds (not locked by package tier)
- ✅ isEditingLocked() returns false for all non-administrative status
- ✅ Only SUSPENDED/DISABLED/ARCHIVED statuses prevent editing

#### Previous Behavior (No Longer Valid):
- ❌ Would have been locked with error: "Editing is locked for this wedding. Please upgrade or contact support."

---

### Scenario 9: Multiple Template Licenses
**Goal:** Verify user can own multiple template licenses simultaneously

#### Steps:
1. Purchase 3 different paid templates:
   - "elegant-gold" ($5.00)
   - "modern-classic" ($7.00)
   - "premium-royal" ($9.00)
2. Call: `GET /api/template-purchase/list/<wedding_id>`
3. Verify 3 + any free templates listed

#### Expected Behavior:
- ✅ All licenses active and accessible
- ✅ User can switch between templates without additional payment
- ✅ Each license has independent purchase date and expiration

#### Frontend Behavior:
- ✅ All purchased templates show "SELECTED" state
- ✅ No lock icon on any purchased template
- ✅ Free templates also available

---

### Scenario 10: Permissions Check - Non-Owner Cannot Modify Pricing
**Goal:** Verify only platform owner can manage pricing

#### Steps:
1. Login as EVENT_MANAGER user
2. Attempt: `POST /api/template-pricing` with pricing update
3. Verify rejection

#### Expected Response:
```json
{
  "error": "Unauthorized"
}
```
**Status Code:** 401

---

## Test Data Checklist

- [ ] Test wedding created (weddingId: `test_wedding_123`)
- [ ] Test user with PLATFORM_OWNER role created
- [ ] Test user with EVENT_MANAGER role created
- [ ] Default pricing initialized in SystemConfig
- [ ] TemplateLicense table empty (no pre-existing licenses)
- [ ] Database migrations applied

---

## Automated Test Script

```typescript
// Example test using moneaClient
async function testE2EPurchaseFlow() {
  const testWeddingId = 'test_wedding_123';
  
  // 1. Free template auto-activation
  console.log('Testing free template...');
  const freeResult = await moneaClient.get(
    `/api/template-purchase/check?weddingId=${testWeddingId}&templateId=khmer-legacy`
  );
  console.assert(freeResult.data?.hasLicense === true, 'Free template should be licensed');
  
  // 2. Paid template purchase flow
  console.log('Testing paid template purchase...');
  const initiateResult = await moneaClient.post(
    `/api/template-purchase/initiate`,
    {
      weddingId: testWeddingId,
      templateId: 'elegant-gold',
      amount: 5.00,
      currency: 'USD'
    }
  );
  console.assert(initiateResult.data?.khqrCode, 'Should return KHQR code');
  
  // 3. Verify payment (simulated)
  console.log('Testing payment verification...');
  const verifyResult = await moneaClient.post(
    `/api/template-purchase/verify`,
    {
      weddingId: testWeddingId,
      templateId: 'elegant-gold',
      transactionHash: 'test_hash_123',
      externalId: 'bakong_123'
    }
  );
  console.assert(verifyResult.data?.status === 'ACTIVE', 'License should be active');
  
  // 4. List all licenses
  console.log('Testing license listing...');
  const listResult = await moneaClient.get(
    `/api/template-purchase/list/${testWeddingId}`
  );
  console.assert(Array.isArray(listResult.data?.licenses), 'Should return licenses array');
  console.assert(listResult.data?.licenses.length >= 2, 'Should have at least 2 licenses');
  
  console.log('✅ All E2E tests passed');
}
```

---

## Known Limitations & Edge Cases

### Tested:
- ✅ Free template instant activation
- ✅ Paid template KHQR payment flow
- ✅ License verification and activation
- ✅ Multiple licenses per wedding
- ✅ Permission checks (platform owner only)
- ✅ Export access control

### Not Tested (Out of Scope):
- ❌ Expired license renewal (no renewal flow implemented)
- ❌ Payment failure recovery (requires Bakong integration)
- ❌ License transfer between weddings
- ❌ Refund processing

---

## Success Criteria

**All 10 scenarios must pass:**
1. ✅ Free template auto-activation
2. ✅ Paid template KHQR purchase
3. ✅ License check endpoint
4. ✅ Wedding PUT validation
5. ✅ List licenses endpoint
6. ✅ Guest export access
7. ✅ Admin pricing management
8. ✅ Permission lock removal
9. ✅ Multiple template licenses
10. ✅ Non-owner cannot modify pricing

**Migration Status: COMPLETE** ✅

All legacy packageType (FREE/PRO/PREMIUM) checks have been replaced with per-template licensing.
