# Fix — `/sign-up` navigation aborted by the service worker & "Payment system not configured"

**Date:** 2026-09-22
**Components:** `monea-webapp` (service worker + admin settings UI), `monea-api-worker` (payment/admin routers)
**Symptoms reported from the browser console**

```
sw.js:132 [SW] Fetch failed for: https://monea-webapp.pages.dev/sign-up TypeError: Failed to fetch
    at sw.js:119:14
The FetchEvent for "https://monea-webapp.pages.dev/sign-up" resulted in a network error response:
the promise was rejected.

monea-api.seabkoeurn64.workers.dev/api/payment/generate-qr  400 (Bad Request)
QR Generation error: Payment system not configured
```

---

## 1. Service worker aborted the `/sign-up` navigation

### Evidence

The deployed worker (`https://monea-webapp.pages.dev/sw.js`, 140 lines, `CACHE_NAME = 'monea-v4'`)
places `return fetch(request)` at **line 119** and `console.warn('[SW] Fetch failed for:', …)` at
**line 132** — the exact lines in the stack trace. So the request for `/sign-up` was handled by the
**static-asset** branch, not by the navigation branch:

```js
// v3 (deployed)
if (request.mode === 'navigate') { … }   // line 88 — NOT taken for this request

event.respondWith(caches.match(request).then((cachedResponse) => {
  if (cachedResponse) { … }              // miss: '/sign-up' is never cached
  return fetch(request)                  // line 119 — throws TypeError: Failed to fetch
    .catch((fetchError) => {
      console.warn('[SW] Fetch failed for:', request.url, fetchError); // line 132
      throw fetchError;                  // <- rejects respondWith() => navigation dies
    });
}));
```

`GET /sign-up` is alive in production (`HEAD` returns **200**), so this is not a missing route: the
request was replayed without `mode === 'navigate'` (Chrome does this for reload/back-forward
navigations and with `cache: 'only-if-cached'`, which the Fetch spec refuses to forward when the
mode is not `same-origin`). Whichever branch was meant to serve it, the asset branch turned a
recoverable condition into a hard page-load failure by **re-throwing**.

### Fix — `monea-webapp/public/sw.js` (v4, `CACHE_NAME = 'monea-v5'`)

* Document/shell requests are detected by `mode === 'navigate'` **or** `destination === 'document'`
  **or** `Accept: text/html`, and are served network-first with the cached SPA shell as fallback.
* `handleShellRequest()` can never reject: network → `caches.match('/index.html')` →
  `caches.match('/')` → a self-contained offline page rendered by the worker. A `respondWith()`
  resolving to `undefined` is itself a network error, so the fallback always returns a `Response`.
* `cache: 'only-if-cached'` requests are answered straight from the cache and are **never** handed
  to `fetch()` (that combination is rejected by the spec — this is the `TypeError: Failed to fetch`).
* A failed asset fetch resolves with `504` (images: `404`) instead of rejecting, so one unreachable
  file can no longer surface as an unhandled rejection.
* `activate` only purges caches that start with `monea-`, leaving any other cache on the origin alone.

### Regression test

`monea-webapp/scripts/sw-contract-check.mjs` (`npm run test:sw`) loads `public/sw.js` into a sandbox
with stubbed `self` / `caches` / `fetch` / `Response` and asserts the contract above. Against the
deployed v3 the same harness reports **6 failures**, including

```
FAIL  non-navigate document must not reject  [Failed to fetch]
```

which is the reported production error.

---

## 2. "Payment system not configured" (HTTP 400)

### Evidence

`monea-api-worker/routers/payment.ts` → `POST /api/payment/generate-qr` needs a receiving account:

```ts
const ACCOUNT_ID = bakongCfg.accountID || process.env.BAKONG_ACCOUNT_ID
if (!ACCOUNT_ID) return c.json({ error: "Payment system not configured", … }, 400)
```

Neither source was ever populated:

* `monea-api-worker/wrangler.toml` binds **no** `BAKONG_*` variable and no secret is committed
  (`BAKONG_ACCOUNT_ID` / `BAKONG_API_TOKEN` are `wrangler secret`-only), and
* **no endpoint or screen could persist `systemConfig.bakongConfig.accountID`** — the admin console
  only ever stored `email`, `organization`, `project` and `token`
  (`POST /api/admin/bakong/request-token`, `/verify-token`, `/manual-token`).

So even a gateway showing the green **Connected** badge (token present) still produced 400s on every
upgrade, and `check-status` / `manual-verify` threw `BAKONG_API_TOKEN environment variable is missing.`
because the token stored in the database was never read by `PaymentService.verifyBakongTransaction`.

### Fix

| File | Change |
| --- | --- |
| `monea-api-worker/routers/admin.ts` | New `POST /api/admin/bakong/account` (platform owner only) storing `bakongConfig.accountID` + `merchantName`, with `name@bank` / ≤ 32-char validation matching `ts-khqr`. `GET /bakong/status` now also returns `accountID`, `merchantName` and `isPaymentReady`. `POST /bakong/request-token` no longer wipes the stored token/account (it now spreads the existing blob). |
| `monea-api-worker/lib/PaymentService.ts` | `verifyBakongTransaction(..., env?, tokenOverride?)` — the admin-console token takes precedence over `BAKONG_API_TOKEN`, so a rotation no longer needs a redeploy. |
---

## 3. How to finish enabling payments (configuration, not code)

Either path works; the admin console is preferred because it needs no redeploy.

**A. Admin console (platform owner):** `/admin/master/settings` → tab **Bakong KHQR** →
*Receiving Account* → Account ID `seabkoeurn64@aclb` (name `@` bank) → Save, then paste the BKRT
token in *API Token (JWT)* → Save. The badge turns **Payment Ready** once both are stored.

**B. Worker secrets:**

```powershell
cd monea-api-worker
npx wrangler secret put BAKONG_ACCOUNT_ID     # e.g. seabkoeurn64@aclb
npx wrangler secret put BAKONG_API_TOKEN      # BKRT token from api-bakong.nbc.gov.kh
npx wrangler secret put BAKONG_MERCHANT_NAME  # optional, defaults to "MONEA"
```

The token must also be present for `check-status` / `manual-verify` (Bakong `check_transaction_by_md5`
and `check_transaction_by_external_id` require `Authorization: Bearer <token>`).

## 4. Verification

```powershell
cd monea-webapp;   npx tsc --noEmit; npm run test:sw
cd monea-api-worker; npx tsc --noEmit
```

Then, after deploying both the Pages build (`dist/`, which now carries the v4 `sw.js`) and the worker:

1. `https://monea-webapp.pages.dev/sign-up` reloads with **no** `[SW] Fetch failed` entry;
   going **offline** and navigating still renders the stored shell (or the offline page).
2. `POST /api/payment/generate-qr` returns `{ qr, md5, orderId, success: true }` with an
   authenticated session, and a 400 whose `message` points at the admin setting when unconfigured.

## 5. Notes / follow-ups

* The service worker cache version was bumped (`monea-v4` → `monea-v5`); the first reload after
  deploy installs the new worker (`skipWaiting()` + `clients.claim()`) and drops the old cache. A
  browser still running the previous worker keeps the old behaviour until that reload.
* `monea-webapp/dist/` is committed and is what Pages serves, so `public/sw.js` was mirrored to
  `dist/sw.js` (`Copy-Item public\sw.js dist\sw.js`) — keep doing that, or build before deploying.
* The legacy mirror `monea-webapp/monea-worker/` (Prisma-based, no `wrangler` config of its own) was
  **not** updated; the deployed API is `monea-api-worker` (`monea-api.seabkoeurn64.workers.dev`).
  Port the `/bakong/account` handler if that copy is ever revived.
* `monea-webapp/src/app/admin/master/settings/components/BakongCard.tsx` is unused dead code (the
  Bakong tab is inline in `settings/page.tsx`); it was left untouched.

| `monea-api-worker/routers/payment.ts` | `generate-qr` / `check-status` / `manual-verify` read `bakongConfig.accountID ?? accountId ?? BAKONG_ACCOUNT_ID`, pass `c.env` and the stored token to the verifier, and the 400 message now tells the operator exactly where to configure it. |
| `monea-webapp/src/app/admin/master/settings/page.tsx` | Bakong tab gains a **Receiving Account** card (Account ID + Merchant Name + Save) and a *Payment Ready* / *Not Ready* badge. |
