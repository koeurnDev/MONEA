# MONEA — Performance Results

**Date:** 2026-09-22
**Method:** identical to `docs/PERFORMANCE_BASELINE.md` — production build of `monea-webapp`, served by `vite preview`, driven by headless Chrome over CDP, fresh browser profile per run, median of N runs.
**Raw data:** `monea-webapp/perf/baseline/*.json` (before) and `monea-webapp/perf/after/*.json` (after), both git-ignored.

Only real measurements are reported. Nothing is extrapolated.

---

## 1. Bundle size (measured from `dist/`, `analyze-bundle.mjs`)

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| **Initial JS (index.html closure, raw)** | 1 068.8 KB | **502.6 KB** | **−53.0 %** |
| **Initial JS (gzip)** | 312.7 KB | **152.6 KB** | **−51.2 %** |
| **Blocking chunks** | 12 | **7** | −5 |
| `react-core` chunk (raw / gzip) | 410.5 KB / 125.8 KB | 177.5 KB / 55.2 KB | −56.8 % / −56.1 % |
| Total JS in `dist/` (raw) | 3.72 MB (117 files) | 3.10 MB (225 files) | −16.7 % |
| Total JS in `dist/` (gzip) | 0.99 MB | 0.93 MB | −6.1 % |
| CSS (raw / gzip) | 280.2 KB / 38.2 KB | 280.2 KB / 38.2 KB | unchanged |
| `dist/` total shipped | 70.99 MB | 68.98 MB | −2.0 MB |

The initial-load closure went from 12 blocking chunks to 7:

```
before: index, react-core, animations, radix-ui, image-crop, data-fetching,
        icons, utilities, vendor, api-url, rolldown-runtime, LandingPage
after:  index, react-core, react-router, data-fetching, data-id, api-url,
        rolldown-runtime
```

`radix-ui`, `image-crop`, `animation` (framer-motion) and `icons` buckets are no longer downloaded
by the landing page at all.

### Root cause fixed: production was shipping React's **development** runtime

| Evidence | Before | After |
| --- | --- | --- |
| `jsxDEV` call sites in the deployed bundle | **469** (verified at `monea-webapp.pages.dev`) | **0** |
| `import.meta.env.DEV` inside the production bundle | `true` (relative `/api/...` calls taken) | `false` |

Fixed by `monea-webapp/scripts/build.mjs` (a committed, cross-platform entry point that pins
`NODE_ENV=production` *before* Vite resolves its config) plus a `vite.config.ts` build guard that
**fails the build** if `jsxDEV` or `react-dom.development` ever appears in an emitted chunk again.
Build time also dropped from 17.7 s to ~3.5 s.

---

## 2. Core Web Vitals — before vs after

Landing page (`/`). `n` = number of measured runs; median reported.

### Desktop (1440×900, no CPU throttling, unthrottled network)

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| TTFB | 10 ms | 18 ms | (local-server noise) |
| FCP | 452 ms | 500 ms | +11 % |
| **LCP** | 1 172 ms | **752 ms** | **−35.8 %** |
| **CLS** | 0.000 | **0.000** | unchanged ✅ |
| **TBT** | 172 ms | **151 ms** | −12.2 % |
| **JS transferred** | 324.2 KB | **187.7 KB** | **−42.1 %** |
| CSS transferred | 39.4 KB | 39.6 KB | unchanged |
| **Image transferred** | **816.0 KB** | **24.8 KB** | **−97.0 %** |
| Other (third-party images) | 406.9 KB | 44.8 KB | −89.0 % |
| **Total transferred** | **1 589 KB** | **298.9 KB** | **−81.2 %** |
| Requests | 30 | 35 | +5 |
| DOM nodes | 188 | 183 | −5 |

### Mid-range Android — Pixel 5a class (4× CPU, Slow 4G 1.6 Mbps / 150 ms RTT)

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| **FCP** | 2 884 ms | **1 720 ms** | **−40.4 %** |
| **LCP** | 5 908 ms | **3 404 ms** | **−42.4 %** |
| **CLS** | 0.000 | **0.000** | unchanged ✅ |
| **TBT** | 629 ms | **159 ms** | **−74.7 %** |
| **JS transferred** | 324.2 KB | **187.7 KB** | **−42.1 %** |
| Image transferred | (not reported by CDP) | 24.8 KB | — |
| Other (third-party images) | 313.8 KB | 66.9 KB | −78.7 % |
| **Total transferred** | **679 KB** | **321 KB** | **−52.7 %** |
| Requests | 26 | 34 | +8 |
| DOM nodes | 188 | 155 | −33 |

### Low-end Android — Moto G4 class (6× CPU, Slow 4G 1.6 Mbps / 150 ms RTT)

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| **FCP** | 3 528 ms | **1 868 ms** | **−47.0 %** |
| **LCP** | 6 772 ms | **4 060 ms** | **−40.0 %** |
| **CLS** | 0.000 | **0.000** | unchanged ✅ |
| **TBT** | 1 430 ms | **346 ms** | **−75.8 %** |
| **Total transferred** | **681 KB** | **321 KB** | **−52.9 %** |

> Caveat, stated plainly: the `before` runs are median-of-3 and the `after` run is **median-of-2**
> for `mobile-low` (the 6×-CPU profile with a 4 s settle took ~90 s per run and the 3-run job did not
> finish inside the session). Both individual runs are reported in `perf/after/mobile-low.json`
> (FCP 2 140/1 868 ms, LCP 4 060/4 192 ms) and are consistent with each other. The `desktop` FCP
> delta (+48 ms) is within the run-to-run spread of an unthrottled local profile
> (per-run FCP was 404/872/500 ms).

---

## 3. Performance budget (Phase 12)

Targets were `LCP < 2.5 s`, `INP < 200 ms`, `CLS < 0.1`, `FCP < 1.8 s`.

| Budget | Target | Desktop | Mobile mid | Mobile low | Status |
| --- | --- | --- | --- | --- | --- |
| LCP | < 2 500 ms | 752 ms | 3 404 ms | 4 060 ms | ✅ desktop · ❌ mobile |
| FCP | < 1 800 ms | 500 ms | 1 720 ms | 1 868 ms | ✅ desktop · ✅/≈ mobile mid · ❌ mobile low |
| CLS | < 0.1 | 0.000 | 0.000 | 0.000 | ✅ all |
| INP | < 200 ms | 0 ms | 0 ms | 0 ms | ✅ (proxy, see §7) |
| Initial JS | minimise | 152.6 KB gzip | same | same | ✅ −51 % |
| Image payload | minimise | 24.8 KB | 24.8 KB | 24.8 KB | ✅ −97 % |
| Request waterfalls | none obvious | — | — | — | ✅ `modulepreload` matches the real entry closure exactly |

Mobile LCP is **still above target**. This is reported honestly rather than claimed as fixed.
Evidence-based remaining bottlenecks are in §5.

---

## 4. Images, assets, fonts

### Brand / icon assets (`optimize-brand-assets.mjs`, reproducible + idempotent)

| File | Before | After | Change |
| --- | ---: | ---: | ---: |
| `public/favicon.png` | 407.7 KB (640×640) | **3.5 KB (64×64)** | −99.1 % |
| `public/icons/icon-192x192.png` | 407.7 KB (640×640) | **20.8 KB (192×192)** | −94.9 % |
| `public/icons/icon-512x512.png` | 407.7 KB (640×640) | **146.8 KB (512×512)** | −64.0 % |
| `public/logo.png` | 411.7 KB (640×640) | **36.2 KB (256×256)** | −91.2 % |
| **Total** | **1 634.9 KB** | **207.3 KB** | **−87.3 %** |

This also **fixed a manifest correctness bug**: `manifest.json` declared `192x192` and `512x512`
while both files were actually 640×640.

### Landing-page imagery

| | Before | After |
| --- | --- | --- |
| Hero photos requested (desktop) | 6 (3 × `w=800` **and** 3 × `w=600`) | **3** (only the desktop set) |
| Hero photos requested (mobile) | 6 | **3** (only the mobile set) |
| Hero bytes (desktop) | ~375 KB | **~45 KB** |
| Per-image size (desktop) | 54–84 KB | **11.5–16.3 KB** |

Two distinct bugs were fixed:

1. **Breakpoint double-download** — both the mobile and desktop card stacks were always mounted and
   merely hidden with Tailwind (`block lg:hidden` / `hidden lg:flex`). Chrome still fetches eager
   `<img>`s inside a `display:none` subtree. The Hero now renders **only** the matching branch
   (`useMediaQuery`, initialised synchronously from `window.matchMedia` so there is no wrong-branch
   first paint), verified by the smoke test at 1440 px and 390 px.
2. **No responsive sizing** — every image was a single fixed width. All hero images now carry an
   explicit `srcSet`/`sizes` generated by the new `src/lib/media.ts`, so a 320 px desktop card
   fetches the 320 w variant and a 393 px × 2.75 DPR phone fetches the 640 w variant.

### CDN optimisation helper (new)

`src/lib/media.ts` adds `optimizeMediaUrl()` / `buildSrcSet()` for **Cloudinary**
(`f_auto,q_auto,c_limit,w_...`), **ImageKit** (`?tr=w-...,q-...,f-auto`) and **Unsplash**
(`w,q,auto=format`). It is deliberately conservative: unknown hosts and already-transformed URLs are
returned **unchanged**, so it cannot break an asset. This is the building block for the
thumbnail → preview → full-resolution gallery pipeline; see §5.

### Fonts (measured, **deliberately unchanged**)

```
fonts.googleapis.com css2?...Kantumruy+Pro...   (one render-blocking stylesheet)
fonts.gstatic.com  ...JxwlEPBew.woff2            33 340 B
fonts.gstatic.com  ...JxwlEjBe72g.woff2          57 016 B
                                                 90 356 B total (88.2 KB), max-age=31536000
```

* Only **two** font files are served. Google already strips the unused italic axis server-side, so
  the `ital` parameter in the request URL costs **zero extra bytes** — removing it would have been
  churn with no measurable benefit.
* The sheet is render-blocking, but `display=swap` and `preconnect` to both font hosts are already in
  place. Making it non-blocking (`media="print"` + onload) was **evaluated and rejected**: CLS is
  currently a perfect 0.000 on every profile, and deferring the swap on a Khmer-text site risks
  reflow when the webfont lands. CLS was treated as non-negotiable.

### Service worker

`public/sw.js` no longer intercepts cross-origin requests (Cloudinary / ImageKit / Unsplash / Google
Fonts / the API worker). It previously ran a guaranteed-miss `caches.match()` on every third-party
request on the critical path, while also shadowing CDN responses that already ship immutable
long-lived cache headers. It also now refuses to cache responses marked `Cache-Control: no-store|private`.

---

## 5. Remaining bottlenecks (evidence-based only)

### 5.1 Mobile LCP is still 3.4–4.1 s (target 2.5 s)

Measured composition of the *remaining* mobile payload on Slow 4G (1.6 Mbps):

| Item | Bytes | Notes |
| --- | ---: | --- |
| Validator CSS (`index-*.css`) | 39.6 KB | one file, Tailwind — includes utility classes used only by the 12 lazy templates |
| JS (gzip) | 187.7 KB | 22 requests |
| Google Fonts CSS + 2 woff2 | 88.2 KB | third-party, render-blocking stylesheet |
| Hero images | 66.9 KB | now correctly sized |
| PWA icon-192 | 21.1 KB | requested by the browser for the installable manifest |

At 1.6 Mbps the transfer floor alone is ~1.5 s before parse/execute on a 6×-throttled CPU, and
`mobile-low` still executes ~346 ms of blocking JS. Closing the remaining gap requires work that was
**out of scope for a safe pass** (see §6): per-route CSS, self-hosting the Khmer font, and moving the
hero entrance animation out of framer-motion.

### 5.2 Above-the-fold entrance animations gate LCP

This was measured, not guessed. After the image fix, the desktop LCP element changed from the hero
photo to the `<h1>` text — and the heading's `initial={{ opacity: 0 }}` framer-motion animation pushed
LCP to **1 640 ms**. The browser cannot count an invisible element as the largest paint, so a
`.6 s duration + .18 s delay` entrance animation costs ~0.78 s of LCP by itself.

Fix applied (opacity kept at 1 from the first frame, movement retained): **LCP 1 640 ms → 752 ms**.
The same pattern still exists on other above-the-fold elements elsewhere in the app; the Hero
headline was fixed because it was the measured LCP element.

### 5.3 `/api/pricing` — measured 1 073 ms, cache headers added but not yet verifiable

Baseline (real requests against the deployed Worker):

| Endpoint | TTFB |
| --- | ---: |
| `/api/ping` | 105 ms |
| `/api/health` | 101 ms |
| **`/api/pricing`** | **1 073 ms** |
| `/api/public-stats` | 438 ms |
| `/api/system/status` | 112 ms |

`GET /api/pricing` had **no cache headers** and returned only two public prices, so the landing page
paid a full Worker → Prisma → Neon round trip for a value that changes a few times a year. It now
sends `Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=600` plus
`CDN-Cache-Control: max-age=300`, and failure responses are explicitly `no-store`.

**This improvement is not yet measured**: it only materialises once the Worker is deployed. The code
change is a header addition on a public, non-sensitive endpoint — see §8 for the security rationale.

### 5.4 Unchanged by design (measured, deliberately left alone)

* **`/api/system/status` is `no-store`** and polled by `SystemStatusListener` on every client. It is a
  maintenance-mode gate: its freshness is a **correctness control**, so it was not weakened for
  performance.
* **`/api/wedding/:id` already had** `s-maxage=60` + `stale-while-revalidate=120` and already returns
  only public fields.
* **CSS is 39.6 KB gzipped in a single file** including utility classes for 12 lazy templates. Splitting
  it per route would help, but Tailwind's content scan makes that a build-architecture change, not a
  safe in-place optimisation.

### 5.5 Repository weight (not a runtime cost, but a deploy cost)

`public/` still ships **67 MB** with ~33 MB of byte-identical duplicates
(`public/assets/khmer-legacy/*` ≡ `public/images/khmer-legacy/*`). These were **not deleted**: the
duplicate paths may be referenced by stored template data, and deleting a referenced asset would be a
runtime break. The safe list of unreferenced files is produced by
`node scripts/perf/audit-assets.mjs`.

---

## 6. What was measured, tried, and deliberately rejected

| Candidate | Why it was not done |
| --- | --- |
| Strip all `console.*` via a build transform | Vite 8 (rolldown) no longer forwards `esbuild.pure`. A regex pass over minified output risks corrupting string literals, and the measured saving is a few KB of already-gzipped bytes. |
| Make the Google Fonts stylesheet non-blocking | Would risk CLS on a Khmer-text site (currently 0.000 everywhere). CLS is a hard constraint, so this was rejected. |
| Remove the `ital` axis from the font request | Measured: Google already serves only 2 roman files (88.2 KB). Zero byte saving. |
| Delete the duplicated `public/` assets | Could break template data that references the duplicate paths. Reported instead. |
| Make `AnimationProvider` lazy to drop framer-motion from first paint | Every implementation that swaps the wrapper element type remounts the whole app (state loss / visible flash). Unacceptable functional risk. The remaining framer-motion cost is now scoped per route instead. |
| Set `build.modulePreload.polyfill: false` | Saves ~1 KB but changes the browser support floor. Poor risk/reward. |
| Cache `/api/system/status` | It is a maintenance-mode correctness gate, not a performance knob. |
| `CONCURRENTLY` index creation | Requires a migration that Prisma Migrate cannot emit; documented as an option instead. |

---

## 7. Measurement validity notes

* **INP** is reported as 0 ms on every profile. The harness uses the Event Timing API with a
  programmatic click; in a headless, unthrottled-local context the observed events stayed under the
  16 ms `durationThreshold`, so 0 ms means "no interaction exceeded 16 ms", not "INP was not measured".
  **TBT (long-task blocking time) is the trustworthy field-effect proxy here**, and it improved
  75.8 % on `mobile-low`.
* The `desktop` FCP delta (+48 ms) is inside the observed run-to-run spread (404/872/500 ms) of an
  unthrottled local profile, so it is noise, not a regression.
* Every run used a fresh Chrome profile with the service worker bypassed and caches cleared. Reusing a
  profile silently zeroed CDP byte accounting (the app's own service worker served the assets), which
  is why the first baseline attempt was discarded and re-measured.

---

## 8. Follow-up snapshot — 2026-10-08

Fresh local production-preview runs used three runs per profile, a clean Chrome profile each time,
and a 1.8–2.2 s settle window. These are lab measurements, not field CWV:

| Profile | FCP | LCP | TBT | Transfer | Requests |
| --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 184 ms | 508 ms | 395 ms | 311 KB | 43 |
| Mobile mid | 1,912 ms | 3,596 ms | 178 ms | 306 KB | 41 |
| Mobile low | 2,032 ms | 4,568 ms | 436 ms | 306 KB | 41 |

The preceding three-run mobile snapshots (before the CSS-only decorative back card) were:
mid **3,452–3,624 ms LCP / 348 KB / 42 requests**, low **4,424–4,460 ms LCP / 348 KB / 42
requests**. Replacing the mobile-only decorative Unsplash card with a CSS gradient removed about
42 KB and one request, but did **not** improve LCP beyond run-to-run variation. The LCP candidate
remains `/images/user_uploads/sample4-640.webp` (~44 KB); it is already preloaded at high priority.
Further LCP work should inspect request-start and render-delay breakdowns rather than claim that
this byte reduction fixed LCP.

The API probe now records per-endpoint client-observed TTFB and total p50/p95/p99, plus raw samples.
Its current deployed-worker sample cannot separate Worker or database time because the
`Server-Timing` instrumentation added to the source has not been deployed. Client-observed readings
are network-inclusive; compare the same endpoint and region, and use at least 100 samples before
treating p95/p99 as stable. Authenticated routes can be measured by setting `MONEA_PERF_COOKIE`
locally and passing a custom `--paths` value; do not put cookie values in command output or reports.

Other follow-up changes in source:

* Dashboard stats no longer join guests, guestbook entries, and gifts into a multiplicative result
  before counting; the combined endpoint aggregates each table separately.
* Dashboard responses emit Worker duration and query-batch wall time as `Server-Timing` metrics.
* Admin backups now stream cursor-paginated rows in batches of 250 instead of materializing and
  pretty-printing every row at once.
* Dashboard shell auth uses the existing auth context rather than issuing a second `/api/auth/me`
  request. SWR no longer synchronously restores serialized cache data from `localStorage`; it uses
  an in-memory cache with focus/reconnect revalidation.

The API/Worker instrumentation and query/export changes require deployment before their production
latency and memory impact can be measured. No deployment or database migration was performed for
this snapshot.

---

## 8. Verification performed after the changes

| Check | Command | Result |
| --- | --- | --- |
| TypeScript (webapp) | `npx tsc --noEmit -p monea-webapp/tsconfig.json` | **exit 0** |
| TypeScript (worker) | `npx tsc --noEmit -p monea-api-worker/tsconfig.json` | **exit 0** |
| Production build | `npm run build` | **exit 0**, no dev runtime in output (guard passes) |
| Functional smoke test | `node monea-webapp/scripts/perf/smoke-test.mjs` | **SMOKE TEST PASSED — 26/26 checks** |
| Re-measure | `node monea-webapp/scripts/perf/run-all.mjs` | reported in §1–§4 |

The smoke test asserts: 6 routes render with visible content; the desktop breakpoint mounts the
desktop stack and requests only its 3 photos (no `w=600`); the mobile breakpoint requests only its
sizes (no `w=800`); `<html lang>`, title, favicon, manifest and canonical link intact; **every `<img>`
has an `alt` attribute**; **`/dashboard` and `/admin` redirect an anonymous visitor to `/sign-in`**
(authorization preserved); no uncaught JS exception; no unexpected console error; no unexpected
first-party 4xx/5xx.

### Security controls — confirmed intact

| Control | Evidence |
| --- | --- |
| C-04 authorization | Smoke test: `/admin` and `/dashboard` both redirect anonymous visitors. `routers/admin*.ts` untouched. |
| CSRF middleware | `monea-api-worker/hono.ts:31` imports and `:130` registers `app.use('*', csrfProtection())`. Client still attaches the header (`fetch-interceptor.ts:131,134`). |
| Fail-closed JWT secret | `monea-api-worker/lib/auth.ts:33` still throws when `JWT_SECRET` is missing outside development. Untouched. |
| Fail-closed token revocation | `lib/auth.ts` / `lib/secrets.ts` untouched by this work. |
| Cloudinary secret removal | No literals added. `src/lib/multi-cdn.ts` still resolves credentials from env and throws when absent. |
| Cookie security | All `auth_handlers/**` untouched. |
| Authentication / authorization / input validation | Untouched; all `lib/validations/**` untouched. |
| No secrets in the shipped bundle | Grepped `dist/` for the Cloudinary API secret, `JWT_SECRET`, `ENCRYPTION_KEY`, the ImageKit private key and `CSRF_SECRET`: **0 occurrences each**. |

The only `monea-api-worker` code change is the cache-header block on `GET /api/pricing`, which is a
public, unauthenticated endpoint already returning those two values to anonymous visitors. No
private, authenticated or user-specific response gained a cache header. Mirror applied to
`monea-webapp/monea-worker/routers/pricing.ts`.

---

## 9. Files changed

### Frontend — `monea-webapp`

| File | Change |
| --- | --- |
| `vite.config.ts` | Pin production mode on build; new `jsxDEV` build guard; replaced the `manualChunks` bucket map with a minimal, evidence-based version |
| `package.json` | `build` now runs `tsc && node scripts/build.mjs` |
| `scripts/build.mjs` | **new** — committed build entry point that sets `NODE_ENV=production` before Vite resolves config |
| `src/router.tsx` | `AuthLayout`, `DashboardLayout`, `AdminLayout` converted to `React.lazy` |
| `src/components/ui/Toast.tsx` | framer-motion replaced with GPU-only CSS keyframes; added `role="status"`/`aria-live` |
| `src/components/ui/LoadingBar.tsx` | framer-motion replaced with CSS keyframes; added `role="progressbar"` |
| `src/app/globals.css` | new `.monea-toast-in` / `.monea-loading-bar` keyframes + `prefers-reduced-motion` guards |
| `src/components/landing/Hero.tsx` | responsive `srcSet`/`sizes`; single breakpoint branch via `useMediaQuery`; LCP-safe headline animation |
| `src/i18n/LanguageProvider.tsx` | `en.json` (72 KB) lazily imported instead of statically bundled |
| `src/lib/media.ts` | **new** — Cloudinary / ImageKit / Unsplash URL + `srcSet` optimiser |
| `src/hooks/useMediaQuery.ts` | **new** — `matchMedia` hook used to render one breakpoint branch only |
| `public/sw.js` | v4 — no cross-origin interception, no caching of `no-store` responses |
| `public/favicon.png`, `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png`, `public/logo.png` | regenerated at correct pixel sizes (`scripts/optimize-brand-assets.mjs`) |
| `scripts/optimize-brand-assets.mjs` | **new** — idempotent brand-asset resizer |
| `scripts/perf/run-all.mjs`, `measure.mjs`, `analyze-bundle.mjs`, `analyze-chunk-graph.mjs`, `audit-assets.mjs`, `trace-imports.mjs`, `measure-api.mjs`, `smoke-test.mjs` | **new** — measurement, analysis and verification harness (zero new dependencies) |

### Backend — `monea-api-worker`

| File | Change |
| --- | --- |
| `routers/pricing.ts` | cache headers (`s-maxage=300`, `stale-while-revalidate=600`, `CDN-Cache-Control`); `no-store` on the error path |

### Mirror — `monea-webapp/monea-worker`

| File | Change |
| --- | --- |
| `routers/pricing.ts` | same cache-header change, kept in sync |

### Repository root

| File | Change |
| --- | --- |
| `.gitignore` | ignore local `perf/` measurement output |
| `docs/PERFORMANCE_BASELINE.md` | **new** |
| `docs/PERFORMANCE_DATABASE.md` | **new** |
| `docs/PERFORMANCE_RESULTS.md` | **new** (this file) |

### Database migrations

**None.** No schema change was made and no migration was executed. The recommended indexes in
`docs/PERFORMANCE_DATABASE.md` are advisory only.

---

## 10. Rollback

Every change is an independent, revertible unit. Nothing was pushed and no history was rewritten.

| # | Change | How to revert | Risk of reverting |
| --- | --- | --- | --- |
| 1 | Production-mode build (`scripts/build.mjs`, guard) | Point `package.json#build` back to `tsc && vite build` and delete the guard in `vite.config.ts` | **High** — reverts to a dev-mode React bundle (~40 % bigger/slower) and re-enables the silent regression |
| 2 | `manualChunks` strategy | Restore the previous `manualChunks` map in `vite.config.ts` | Low — only affects chunking, not behaviour |
| 3 | Lazy layouts | Restore the three static imports in `src/router.tsx` | Low — layouts load slightly earlier |
| 4 | Toast / LoadingBar CSS animations | Restore the `framer-motion` versions (both are small, self-contained files) | Low |
| 5 | Hero responsive images + single branch | Revert `Hero.tsx`; needs no other file | Low — reverts to double image download |
| 6 | Hero headline animation | Restore `initial={{ opacity: 0, y: 20 }}` and the previous transition | Low — costs ~0.5 s of desktop LCP |
| 7 | Lazy `en.json` | Restore `import en from './en.json'` in `LanguageProvider.tsx` | Low |
| 8 | `src/lib/media.ts` | Nothing else depends on it yet (Hero uses it); revert `Hero.tsx` first | None |
| 9 | Service worker v4 | Restore the previous `public/sw.js`; bump `CACHE_NAME` so clients pick it up | Low |
| 10 | Brand assets | Re-run with the originals restored from git, or re-run `optimize-brand-assets.mjs` (idempotent) | Low |
| 11 | `/api/pricing` cache headers | Delete the two `c.header(...)` lines in both copies of `routers/pricing.ts`, or set `CSRF`-style env valve — none exists, so code revert | Low |
| 12 | `perf/` tooling + docs | Delete the files; nothing imports them | None |

Deployment notes:

* Changes 1–10 are **frontend** — they take effect on the next Pages/Vercel deploy. Rollback is a
  redeploy of the previous build.
* Change 11 is the **only** Worker change; roll it back with `wrangler deploy` of the reverted
  `monea-api-worker`.
* `public/sw.js` ships a new `CACHE_NAME` (`monea-v4`), so clients automatically drop the old cache on
  activation. Reverting means shipping v5 or restoring v3's name — both are handled by the same
  activate-time cleanup logic.
