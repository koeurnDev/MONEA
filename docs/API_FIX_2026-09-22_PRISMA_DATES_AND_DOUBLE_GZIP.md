# MONEA API — production fixes (2026-09-22): Prisma date reads & response encoding

**Status:** fixed, deployed and verified against the live Worker.
**Component:** `monea-api` (Cloudflare Worker at `monea-api.seabkoeurn64.workers.dev`)
**Worker versions:** `ed9960bf` (broken) → `9781a3c4` (fix A) → `b7a1f536` (fix A + B)
**Frontend:** no change required — `monea-webapp` `dist/` already matched the deployed Pages build.

Two independent defects were live in production at the same time. Both were reproduced,
fixed, deployed and re-measured.

---

## 1. Defect A — every Prisma read that touched a date column failed (P2023)

### Symptom

* `GET /api/pricing` returned the **hard-coded fallback** (`{"standard":9,"pro":19}`) with
  `Cache-Control: no-store` — i.e. the `catch` branch of `routers/pricing.ts` — instead of the
  configured price.
* `GET /api/system/maintenance` returned `false` for the same reason.
* Guests, weddings, payments, admin lists and the governance snapshot all go through the same
  Prisma path, so every payload containing a `DateTime` column was affected.

### Evidence

| Check | Result |
| --- | --- |
| Live `GET /api/pricing` (before fix) | `{"standard":9,"pro":19}` + `Cache-Control: no-store`, TTFB ≈ 1.15 s |
| `SystemConfig` row read directly with `@neondatabase/serverless` | `id=GLOBAL, stadPrice=9, proPrice=18, updatedAt=2026-08-28T18:51:11.601Z` — note **18 ≠ 19** |
| Prisma counters (`prisma.wedding.count()`, `/api/public-stats`) | worked → driver and DB reachable |
| `wrangler tail` while calling `/api/pricing` | `[API/PRICING] Error fetching price: PrismaClientKnownRequestError … Inconsistent column data: Conversion failed: expected a string in column 'updatedAt', found {}` (`P2023`) |
| Same query re-run locally against the production DB with the Worker's installed driver + adapter | reproduced: `P2023 … found {}` |
| Schema drift ruled out | `information_schema` shows all 10 `SystemConfig` columns, types exactly as `schema.prisma` declares |

### Root cause

`@prisma/adapter-neon@5.22`'s HTTP queryable calls the driver as
`sql(text, params, { arrayMode: true, fullResults: true })` and expects **raw Postgres text** for
date/time columns — its own `customParsers` define
`normalize_timestamp = identity` and `normalize_timestampz = value.split('+')[0]`.

`@neondatabase/serverless@0.10.3` (pinned in `monea-api-worker/package.json`) does the opposite on
its HTTP path: it resolves a pg text parser per column
(`fields.map(f => types.getTypeParser(f.dataTypeID))`) and applies it, so `timestamp` /
`timestamptz` reach Prisma as **`Date` objects** (shown as `{}` in the error). Prisma's engine then
refuses them and the call throws.

That is why integer-only result sets (`count()`) worked and anything containing a date did not.

### Fix

`monea-api-worker/lib/prisma.ts` — inject an adapter-compatible type-parser map on every driver
call, mirroring the adapter's own rules for OIDs `1082` (date), `1114` (timestamp) and `1184`
(timestamptz: strip the `+HH` suffix). `neon()` in 0.10.x ignores a client-level `types` option
(its factory signature has no such key), so the map is merged per call through a thin wrapper
around the driver function.

Local verification before deploying (`wrangler dev`, workerd, production DB):
`{"standard":9,"pro":18}` with the success-path cache headers.

---

## 2. Defect B — responses compressed twice, advertised once

### Symptom

Any JSON response larger than ~1 KB was **undecodable by every client**, browsers included: the body
was gzipped twice while only one `Content-Encoding: gzip` was advertised. A client decodes the single
declared layer and is left with gzip bytes, so `JSON.parse` fails. `/api/wedding/:id` (≈2 KB), guest
lists, admin tables and the public wedding pages were affected.

### Evidence (measured against the live Worker)

| Client advertises | Response header | gzip layers needed to reach JSON | Result |
| --- | --- | --- | --- |
| `gzip, deflate, br` | `Content-Encoding: gzip` | **2** | broken |
| `identity` | *(none)* | 1 | broken — gzipped body, no header |

Control: `GET /api/public-stats` is small (51 B) and is never touched by Worker compression code —
Cloudflare's edge served it as `Content-Encoding: br` and it decoded in **one** layer. The edge
therefore already negotiates and compresses correctly on its own.

### Root cause

`hono.ts` contained a hand-rolled gzip middleware (written to replace hono's `compress()`, which had
been blamed for the same breakage). Because Cloudflare's edge also compresses the Worker's response
body, the payload ended up double-encoded while the Worker's single `Content-Encoding: gzip` header
was the only one advertised; the `Vary: Accept-Encoding` the middleware tried to append was not
present on the delivered response (the CORS middleware's `Vary: Origin` was). The middleware was
redundant and actively harmful behind the Cloudflare edge.

### Fix

`monea-api-worker/hono.ts` — the gzip middleware and its `gzipBytes` helper were removed. The Worker
returns plain JSON and lets Cloudflare encode it, exactly as it does for HTML/CSS/JS, and
negotiation/headers/`Vary`/caching stay with the layer that owns them.

### Verification after deploy

| Check | Result |
| --- | --- |
| `curl --compressed /api/wedding/cmn7m5ih800017yuqdm8lhk4i` | parsed ✅ (gallery 8 rows, activities 4) |
| gzip-accepting client | `Content-Encoding: br`, **1** layer, JSON parses ✅ |
| `identity` client | no `Content-Encoding`, 6870 B, JSON parses ✅ |

---

## 3. Live verification of both fixes

```
/api/ping                        200 application/json  -> object(3 keys)
/api/health                      200 application/json  -> object(2 keys)
/api/pricing                     200 application/json  -> {"standard":9,"pro":18}   <- real DB value
/api/public-stats                200 application/json  -> {"couples":3,"guests":17,...}
/api/system/status               200 application/json  -> object(1 key)
/api/system/maintenance          200 application/json  -> {"maintenanceMode":false}
/api/templates/versions          401 application/json  -> auth required (expected)
/api/wedding/<id>                200 application/json  -> object(10 keys)          <- was undecodable
/api/gallery/<id>                200 application/json  -> object(2 keys)
/api/broadcast                   200 application/json  -> array(0)
/api/guestbook?weddingId=<id>    200 application/json  -> array(0)
/api/auth/csrf                   200 application/json  -> object(2 keys)
```

`GET /api/pricing` now also emits the cache headers added by the performance work
(`Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=600` +
`CDN-Cache-Control: max-age=300`), which previously never materialised because the request never
left the error branch — see `docs/PERFORMANCE_RESULTS.md` §5.3.

---

## 4. Files changed

| File | Change |
| --- | --- |
| `monea-api-worker/lib/prisma.ts` | Per-call type-parser map so Prisma's Neon HTTP adapter receives raw date text (OIDs 1082/1114/1184), mirroring `@prisma/adapter-neon`'s `customParsers` |
| `monea-api-worker/hono.ts` | Removed the hand-rolled gzip middleware; compression delegated to Cloudflare's edge |

No schema change, no migration, no dependency change, no frontend change.

---

## 5. Rollback

| Scope | How |
| --- | --- |
| Both fixes | Redeploy Worker version `ed9960bf-97fb-4664-8bb8-54b1290731be` (⚠️ contains both defects) |
| Fix B only | Restore the removed middleware block in `hono.ts` and redeploy (Worker `9781a3c4`) — clients will again receive undecodable bodies |
| Fix A only | Delete `toPrismaQueryFunction` / `prismaGetTypeParser` and pass `sql` straight to `PrismaNeonHTTP`; date-bearing Prisma reads fail again with `P2023` |

---

## 6. Residual risk / follow-ups (not addressed here)

* **`/api/pricing` swallows database failures** into hard-coded defaults with HTTP 200 — that is how
  defect A stayed invisible. Returning 5xx (or a degradation marker) on the catch path would surface
  the next occurrence. Unchanged.
* **Dependency pairing.** `@neondatabase/serverless@1.1.0` removed the conventional
  `sql(text, params)` call style, so it cannot be combined with `@prisma/adapter-neon@5.22`
  (verified: `"This function can now be called only as a tagged-template function"`). Upgrading the
  driver requires upgrading the Prisma adapter and client in the same step; until then the shim in
  `lib/prisma.ts` is required.
* **`monea-webapp/monea-worker/**` mirror** has no `lib/` and is not deployed; untouched. It remains
  duplicated logic that can drift (also flagged in the security incident doc).
* **No compression regression guard.** If Worker-side compression is reintroduced, the double
  encoding returns. A smoke check counting gzip layers on a >1 KB response would catch it; none
  exists in the repo today.
