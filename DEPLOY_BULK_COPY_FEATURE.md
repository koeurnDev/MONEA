# Deployment Instructions - Bulk Copy Demo Data Feature

**Date:** 2026-10-27
**Feature:** Bulk copy demo data from M2 to other templates

## Changes Summary

### Backend (API Worker)
- ✅ Added bulk copy endpoint in `monea-api-worker/routers/template-preview.ts`
- ✅ TypeScript compilation passes

### Frontend (Webapp)
- ✅ Added bulk copy UI in `monea-webapp/src/app/admin/master/templates/page.tsx`
- ✅ TypeScript compilation passes

## Deployment Steps

### 1. Backend Deployment (API Worker)

```powershell
# Navigate to API worker
cd monea-api-worker

# Install dependencies (if needed)
npm install

# Build and deploy
npm run deploy
# or
wrangler deploy
```

### 2. Frontend Deployment (Webapp)

```powershell
# Navigate to webapp
cd monea-webapp

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
# or
npx wrangler pages deploy dist
```

## Post-Deployment Verification

### 1. Test API Endpoint

```bash
POST https://api.moneoez.com/api/admin/template-preview/bulk-copy
Headers: Cookie: [admin session]
Body: {
  "sourceTemplateId": "modern-minimal",
  "targetTemplateIds": ["khmer-legacy", "fortune-harmony"]
}
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully copied demo data from 'modern-minimal' to 2/2 template(s)",
  "results": [
    { "templateId": "khmer-legacy", "success": true },
    { "templateId": "fortune-harmony", "success": true }
  ]
}
```

### 2. Test Admin UI

1. Login as admin (PLATFORM_OWNER or EVENT_MANAGER)
2. Navigate to `/admin/master/templates`
3. Click "Copy Demo Data" button
4. Select M2 as source
5. Check target templates
6. Click "Copy Demo Data"
7. Verify success indicators appear

### 3. Verify Demo Templates

1. Click "កែ Demo" on a copied template
2. Navigate to `/dashboard/design?templatePreview=khmer-legacy`
3. Verify photos and content are present
4. Check different templates

## Rollback Plan

If issues occur:

### Backend Rollback
```powershell
cd monea-api-worker
git revert HEAD
npm run deploy
```

### Frontend Rollback
```powershell
cd monea-webapp
git revert HEAD
npm run build
npm run deploy
```

## Environment Variables

No new environment variables required.

## Database Changes

No schema migrations required. Uses existing `TemplatePreview` table.

## Monitoring

Watch for:
- API errors in Cloudflare Workers logs
- Failed copy operations in admin UI
- Database write errors

## Success Criteria

✅ Admin can bulk copy M2 demo data
✅ All 7 target templates receive data
✅ No errors in production logs
✅ TypeScript compilation passes
✅ No breaking changes to existing features

## Notes

- Feature is admin-only (requires PLATFORM_OWNER or EVENT_MANAGER role)
- Copies photos, content, timeline, but excludes template-specific colors
- Time saved: ~2-3 hours per demo update cycle

---

**Ready to deploy!** 🚀
