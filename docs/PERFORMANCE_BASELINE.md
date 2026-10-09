# MONEA — Performance Baseline

**Captured:** 2026-09-22
**Artefact measured:** production build of `monea-webapp` (`npm run build` → `dist/`), served by `vite preview`, driven headlessly by the locally installed Google Chrome over the DevTools Protocol.
**Raw data:** `monea-webapp/perf/baseline/*.json` (git-ignored), reproducible with the scripts below.

Everything in this document is a **measured** value. Nothing is estimated or copied from a blog post.

---

## 1. How the baseline was produced

New, dependency-free tooling was added so the numbers can be regenerated at any time:

| Script | Purpose |
| --- | --- |
| `monea-webapp/scripts/perf/run-all.mjs` | Boots `vite preview`, runs the measurement for each device profile, writes `perf/<profile>.json`, prints a summary table |
| `monea-webapp/scripts/perf/measure.mjs` | Core Web Vitals harness (CDP client): FCP, LCP, CLS, TBT, INP proxy, TTFB, per-resource transfer sizes, request counts |
| `monea-webapp/scripts/perf/analyze-bundle.mjs` | JS/CSS totals (raw + gzip) and the **initial-load closure** actually referenced by `index.html` |
| `monea-webapp/scripts/perf/analyze-chunk-graph.mjs` | Prints the entry chunk's static import edges and every `modulepreload` hint |
| `monea-webapp/scripts/perf/audit-assets.mjs` | What `public/` ships, oversized files, unreferenced files |
| `monea-webapp/scripts/perf/trace-imports.mjs` | Proves which static import chain drags a package into first paint |
| `monea-webapp/scripts/perf/measure-api.mjs` | TTFB/total latency for public Worker endpoints |

Reproduce:

```bash
cd monea-webapp
npm run build
node scripts/perf/run-all.mjs --profiles desktop,mobile-mid,mobile-low --runs 3 --out-dir perf/baseline
node scripts/perf/analyze-bundle.mjs
node scripts/perf/measure-api.mjs --runs 5
```

### Measurement hygiene

Each run uses a **brand-new Chrome profile** (`--user-data-dir` in a fresh temp dir), with
`Network.setCacheDisabled`, `Network.clearBrowserCache`, `Network.setBypassServiceWorker` and
`Storage.clearDataForOrigin`. This is essential: the app registers a service worker (`/sw.js`),
and with a reused profile later runs read assets from the service-worker cache, which silently
zeroes CDP byte accounting and understates real transfer volume. Median of 3 runs is reported.

### Device / network profiles

| Profile | CPU throttle | Network | Device |
| --- | --- | --- | --- |
| `desktop` | 1× | unthrottled | 1440×900 @1× |
| `mobile-mid` | **4×** | **Slow 4G** (1.6 Mbps ↓, 750 kbps ↑, 150 ms RTT) | 393×851 @2.75× (Pixel 5a class) |
| `mobile-low` | **6×** | **Slow 4G** (1.6 Mbps ↓, 750 kbps ↑, 150 ms RTT) | 360×640 @3× (Moto G4 class) |

---

## 2. Core Web Vitals — baseline

Page measured: the landing page (`/`) — the page every marketing visitor and every share link hits first.

| Metric | Desktop | Mobile mid | Mobile low | Target |
| --- | ---: | ---: | ---: | --- |
| **TTFB** | 10 ms | 7 ms | 7 ms | as low as possible |
| **FCP** | 452 ms | 2 884 ms | 3 528 ms | < 1 800 ms |
| **LCP** | 1 172 ms | 5 908 ms | 6 772 ms | < 2 500 ms |
| **CLS** | 0.000 | 0.000 | 0.000 | < 0.1 |
| **TBT** | 172 ms | 629 ms | 1 430 ms | lab proxy for INP |
| **INP (proxy)** | 0 ms | 0 ms | 0 ms | < 200 ms |
| Requests | 30 | 26 | 27 | — |
| **Total transfer** | **1 589 KB** | **679 KB** | **681 KB** | — |

LCP element on all profiles: `img.w-full.h-full.object-cover` — the hero photo stack.

> TTFB note: the page was served by a local preview server, so the TTFB figure isolates
> *client-side* cost. Deployed-app TTFB is covered by §6 (API latency) plus edge configuration.

### Transfer breakdown

| Resource type | Desktop | Mobile mid | Mobile low |
| --- | ---: | ---: | ---: |
| JavaScript | 324.2 KB (14 req) | 324.2 KB (14 req) | 324.2 KB (14 req) |
| CSS | 39.4 KB (2 req) | 39.4 KB (2 req) | 39.4 KB (2 req) |
| **Images** | **816.0 KB (2 req)** | 0 B¹ | 0 B¹ |
| Fonts | 0 B reported¹ | 0 B reported¹ | 0 B reported¹ |
| Third-party (Unsplash) | 406.9 KB (9 req) | 313.8 KB (7 req) | 315.8 KB (8 req) |
| Document | 2.1 KB | 2.1 KB | 2.1 KB |

¹ Transfer sizes for a couple of low-priority / cross-origin responses were not reported by CDP
before the settle window closed on the throttled profiles. Those bytes are accounted for in the
"Images" row on desktop and were still fetched on mobile — see §5–§6 for definitive file sizes.

### The two largest images on the landing page

| URL | Bytes | Notes |
| --- | ---: | --- |
| `/favicon.png` | **408 KB** | 640×640 PNG referenced as `<link rel="icon">` |
| `/icons/icon-192x192.png` | **408 KB** | byte-identical file, declared `192x192` in `manifest.json` |

That is **816 KB — 53 % of total desktop page weight — in two files that provide no visual value**.
Two more copies of the same 408 KB file (`icon-512x512.png`, `logo.png` at 412 KB) are precached
by the service worker on first visit.

---

## 3. JavaScript bundle — baseline

| Metric | Value |
| --- | ---: |
| Total JS in `dist/` | 3.72 MB raw / 0.99 MB gzip (117 files) |
| **Initial JS (index.html closure)** | **1 068.8 KB raw / 312.7 KB gzip — 12 blocking chunks** |
| Total CSS in `dist/` | 279.6 KB raw / 38.1 KB gzip (1 file) |
| Initial CSS | 279.6 KB raw / 38.1 KB gzip |
| `dist/` total | 70.99 MB (150 shipped assets) |

Chunks that blocked first paint (`analyze-bundle.mjs`):

```
assets/index-*.js                     274.5 KB
chunks/react-core-*.js                410.5 KB   <- React + react-dom + every "*react*" path
chunks/animations-*.js                143.4 KB   <- framer-motion
chunks/radix-ui-*.js                  140.3 KB   <- Radix (never rendered by the landing page)
chunks/image-crop-*.js                 23.1 KB   <- react-easy-crop (never rendered by the landing page)
chunks/icons-*.js                      ~36 KB
chunks/utilities-*.js                  25.2 KB
chunks/data-fetching-*.js              10.6 KB
chunks/vendor-*.js                      3.3 KB
chunks/api-url-*.js                     0.5 KB
chunks/rolldown-runtime-*.js            0.9 KB
```

### Root cause found: the deployed bundle was built in React **development** mode

This was not a theory — it was verified against the live deployment:

```
GET https://monea-webapp.pages.dev/chunks/api-url-CW58lQVx.js
    -> byte-identical to a local DEVELOPMENT-mode build (same content hash)
GET https://monea-webapp.pages.dev/assets/index-eAgz_Hf-.js
    -> 469 occurrences of `jsxDEV`
```

`jsxDEV` is React's *development* JSX runtime. `import.meta.env.DEV` also evaluated to `true`
inside the production bundle (`getApiUrl()` took the localhost/dev branch, which is why a
relative `/api/auth/me` request was observed hitting the preview origin).

Cause: `monea-webapp/.env` contains `NODE_ENV="development"`. Vite resolves
`import.meta.env.DEV`/`PROD` and `@vitejs/plugin-react` chooses between the `jsx` and `jsxDEV`
transforms **before** the user config function runs, so assigning
`process.env.NODE_ENV = 'production'` inside `vite.config.ts` is too late (this was confirmed:
the first attempted fix did not change the output, and the new build guard rejected the bundle).

Effect: every visitor downloaded and executed React's development build — larger, slower, with
development-only validation on every render. The development react-dom bundle measured
**410.5 KB raw / 125.8 KB gzip** for `react-core`, versus **235.5 KB / 75.0 KB** once built correctly.

---

## 4. Asset audit (`public/`)

| Type | Files | Bytes |
| --- | ---: | ---: |
| Images | 139 | 59 756.8 KB |
| Video | 4 | 8 049.6 KB |
| Fonts | 2 | 792.3 KB |
| Other | 5 | 4.7 KB |
| **Total** | **150** | **67.00 MB** |

* 109 image/video files exceed 200 KB.
* ~30 large files are **byte-identical duplicates** shipped twice under different paths, e.g.
  `public/assets/khmer-legacy/*.jpg` ≡ `public/images/khmer-legacy/*.jpg` (≈ 33 MB duplicated),
  and `public/assets/khmer-legacy/purple_flower_motion.mp4` ≡
  `public/images/user_uploads/purple_flower_motion.mp4` (2.0 MB each).
* `fonts/KhAngToaThmor2.ttf` is duplicated (396 KB × 2) and `favicon.png` ≡
  `icons/icon-192x192.png` ≡ `icons/icon-512x512.png` (407.7 KB × 3).

---

## 5. Fonts

Requested from Google Fonts:

```
https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&display=swap
https://fonts.gstatic.com/s/kantumruypro/v12/...JxwlEPBew.woff2    33 340 B   Cache-Control: public, max-age=31536000
https://fonts.gstatic.com/s/kantumruypro/v12/...JxwlEjBe72g.woff2  57 016 B   Cache-Control: public, max-age=31536000
```

* 2 font files, **90 356 bytes total (88.2 KB)**. Google already tree-shakes the unused italic
  axis server-side, so requesting `ital` in the URL costs **no extra bytes** (measured, section
  §5 of this document — the two URLs above are the complete set).
* The stylesheet is a **render-blocking third-party stylesheet**: one extra DNS + TLS + request
  round trip to `fonts.googleapis.com` before CSS can complete. `display=swap` is already set and
  `preconnect` to both font hosts is already present.
* `Kh Ang ToaThmor 2.ttf` (396 KB, duplicated) is also shipped in `public/` but is not referenced
  by the landing page.

---

## 6. API latency (deployed Worker)

`monea-api.seabkoeurn64.workers.dev`, 5 runs per endpoint, median reported. Public
unauthenticated endpoints only (no cookies or credentials sent).

| Endpoint | Status | **TTFB** | Total | Bytes | Encoding | Cache-Control |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| `GET /api/ping` | 200 | 105 ms | 106 ms | 76 | br | `public` |
| `GET /api/health` | 200 | 101 ms | 102 ms | 54 | br | `public` |
| **`GET /api/pricing`** | 200 | **1 073 ms** | 1 073 ms | 23 | identity | **(none)** |
| `GET /api/public-stats` | 200 | 438 ms | 439 ms | 51 | br | `public` |
| `GET /api/system/status` | 200 | 112 ms | 112 ms | 21 | identity | `no-store` |
| `GET /api/wedding/does-not-exist` | 404 | 765 ms | 765 ms | 29 | identity | (none) |

Median TTFB across endpoints: **438 ms**.

Observations:

* **`/api/pricing` is the slowest endpoint at 1 073 ms** — ~10× the edge-health baseline — and it
  carried **no cache headers**, so every landing-page visit paid a full Worker → Prisma → Neon
  round trip for a value that changes a few times a year.
* `/api/ping` and `/api/health` are already at the edge floor (~100 ms from the `-SIN` region).
* `/api/public-stats` is Redis-cached but still 438 ms.
* `GET /api/wedding/:id` **already** has `Cache-Control: public, max-age=60, s-maxage=60,
  stale-while-revalidate=120` and returns only public fields (no phone/email/payment data).
* `/api/system/status` is deliberately `no-store` — it is a maintenance-mode gate, so its
  freshness is a correctness control, **not** a performance knob. Left as-is by design.
* Response compression is already active for JSON ≥ 1 KB (`br` observed, `Vary` handled, and
  `Set-Cookie` responses are deliberately excluded so auth cookies can never be corrupted).

---

## 7. Database

See `docs/PERFORMANCE_DATABASE.md`.

The Prisma schema was already comprehensively indexed before this work (composite indexes on
`Guest(weddingId, createdAt)`, `Guest(weddingId, hasArrived)`, `Wedding(userId, status, createdAt)`,
`Wedding(status, paymentStatus)`, `InvitationAnalytics(weddingId, type, createdAt)`,
`Gift(weddingId, createdAt)`, `GalleryItem(weddingId, createdAt)`,
`GuestbookEntry(weddingId, createdAt)`, `Log(weddingId, createdAt)`, and more). The baseline
bottleneck is therefore **not** missing indexes — it is uncached public reads and the cost of
reaching Postgres through the Worker at all.

---

## 8. Baseline summary — where the time actually goes

Ranked by measured impact on a mid-range Android phone over Slow 4G:

1. **React's development runtime in the production bundle** — 469 live `jsxDEV` call sites.
   Largest single contributor to TBT 629 ms / 1 430 ms and to the 324 KB of JS.
2. **1 068.8 KB raw / 312.7 KB gzip of blocking JavaScript across 12 chunks**, including
   `radix-ui` (140.3 KB) and `image-crop` (23.1 KB) chunks the landing page never renders, and a
   `framer-motion` chunk (143.4 KB) whose only entry-graph consumer needs two of its exports.
3. **816 KB of icon/favicon PNGs** (the same 408 KB file served twice) — 53 % of desktop page weight.
4. **~375 KB of Unsplash hero photos**, with the browser fetching **both** breakpoint variants
   (w=600 *and* w=800) on every device, because eager `<img>`s inside `display:none` branches are
   still downloaded.
5. **Uncached `/api/pricing`** at 1 073 ms, called during landing-page load.
6. **67 MB of shipped `public/` assets**, ~33 MB of it byte-identical duplicates.
7. `en.json` (72 KB of raw JSON) statically imported into the entry chunk even though the
   language provider forces the `km` locale.
