/**
 * Service worker contract check.
 *
 * Loads `public/sw.js` in a sandbox with stubbed `self`, `caches`, `fetch` and
 * `Response`, then drives its fetch handler with the request shapes that broke
 * production:
 *
 *   1. a document request whose `mode` is not `navigate` (the console error was
 *      "Fetch failed for: https://monea-webapp.pages.dev/sign-up") — must fall
 *      back to HTML instead of rejecting;
 *   2. a `cache: 'only-if-cached'` navigation — `fetch()` is rejected by the
 *      Fetch spec for that combination, so the worker must answer from cache;
 *   3. an unavailable asset — must resolve (504/404), never reject
 *      `respondWith()`.
 *
 * Run with: npm run test:sw
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const swPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sw.js');
const source = readFileSync(swPath, 'utf8');

const ORIGIN = 'https://monea-webapp.pages.dev';
const SHELL_BODY = '<html data-testid="cached-shell">cached shell</html>';

let failures = 0;
let fetchHandler = null;
let fetchCalls = 0;

function pass(name, detail = '') {
    console.log(`  PASS  ${name}${detail ? `  [${detail}]` : ''}`);
}
function fail(name, detail = '') {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? `  [${detail}]` : ''}`);
}

/* ── sandbox ──────────────────────────────────────────────────────────────── */

const cacheStore = new Map([
    ['/index.html', new Response(SHELL_BODY, { status: 200, headers: { 'Content-Type': 'text/html' } })],
]);

const cachesMock = {
    open: async () => ({
        addAll: async () => {},
        put: async (request, response) => {
            cacheStore.set(typeof request === 'string' ? request : request.url, response);
        },
    }),
    keys: async () => ['monea-v4', 'unrelated-cache'],
    delete: async () => true,
    match: async (key) => cacheStore.get(typeof key === 'string' ? key : key.url),
};

const sandboxSelf = {
    addEventListener: (type, handler) => {
        if (type === 'fetch') fetchHandler = handler;
    },
    skipWaiting: () => {},
    location: { origin: ORIGIN },
    clients: { claim: async () => {} },
};

/** Any network access from the worker fails — the offline / flaky-3G case. */
const failingFetch = async () => {
    fetchCalls += 1;
    throw new TypeError('Failed to fetch');
};

// eslint-disable-next-line no-new-func
new Function('self', 'caches', 'fetch', 'Response', 'console', source)(
    sandboxSelf,
    cachesMock,
    failingFetch,
    Response,
    // Silence the worker's own warnings; failures are asserted below.
    { ...console, warn: () => {}, log: () => {} },
);

if (typeof fetchHandler !== 'function') {
    console.error('  FAIL  fetch listener was not registered');
    process.exit(1);
}

/* ── helpers ──────────────────────────────────────────────────────────────── */

function makeRequest(overrides = {}) {
    return {
        method: 'GET',
        url: `${ORIGIN}/sign-up`,
        mode: 'navigate',
        destination: 'document',
        cache: 'default',
        headers: new Headers({ accept: 'text/html,application/xhtml+xml' }),
        ...overrides,
    };
}

/**
 * Runs the handler and returns:
 *  - `null` when the worker deliberately does not intercept the request;
 *  - `{ response }` when `respondWith()` resolved;
 *  - `{ error }` when `respondWith()` rejected (a browser-visible network error).
 */
async function dispatch(request) {
    let pending = null;
    fetchHandler({ request, respondWith: (promise) => { pending = promise; } });
    if (!pending) return null;

    try {
        return { response: await pending };
    } catch (error) {
        return { error };
    }
}

/* ── checks ───────────────────────────────────────────────────────────────── */

console.log('\nService worker contract check\n');

// 1. Regression: the reported failure. A document request that is not reported
//    with mode "navigate" used to reach the asset branch and reject.
{
    const before = fetchCalls;
    const result = await dispatch(makeRequest({ mode: 'cors', destination: '' }));
    if (result?.error) {
        fail('non-navigate document must not reject', result.error.message);
    } else if (result?.response?.status === 200) {
        pass('non-navigate document falls back to HTML', `status 200, network tries=${fetchCalls - before}`);
    } else {
        fail('non-navigate document falls back to HTML', `status ${result?.response?.status}`);
    }
}

// 2. Plain navigation with an unreachable network.
{
    const result = await dispatch(makeRequest());
    if (result?.error) {
        fail('navigation must not reject when offline', result.error.message);
    } else if (result?.response?.status === 200) {
        pass('navigation falls back to the cached shell', 'status 200');
    } else {
        fail('navigation falls back to the cached shell', `status ${result?.response?.status}`);
    }
}

// 3. `only-if-cached` navigations (Chrome back/forward + reload) must never be
//    re-issued through fetch(), which would throw for mode "navigate".
{
    const before = fetchCalls;
    const result = await dispatch(makeRequest({ cache: 'only-if-cached' }));
    if (result?.error) {
        fail('only-if-cached navigation must not reject', result.error.message);
    } else if (result?.response?.status === 200 && fetchCalls === before) {
        pass('only-if-cached navigation is answered from cache', 'no network call');
    } else {
        fail('only-if-cached navigation is answered from cache', `status ${result?.response?.status}, network tries=${fetchCalls - before}`);
    }
}

// 4. Unavailable asset: resolve with an error status, never reject.
{
    const result = await dispatch(makeRequest({
        url: `${ORIGIN}/assets/app-abc123.js`,
        mode: 'cors',
        destination: 'script',
        headers: new Headers({ accept: '*/*' }),
    }));
    if (result?.error) {
        fail('asset failure must not reject', result.error.message);
    } else if (result?.response?.status === 504) {
        pass('unavailable asset resolves with 504', 'status 504');
    } else {
        fail('unavailable asset resolves with 504', `status ${result?.response?.status}`);
    }
}

// 5. Missing cached asset requested with only-if-cached: still resolvable.
{
    const result = await dispatch(makeRequest({
        url: `${ORIGIN}/assets/missing.css`,
        mode: 'same-origin',
        destination: 'style',
        cache: 'only-if-cached',
        headers: new Headers({ accept: 'text/css' }),
    }));
    if (result?.error) {
        fail('missing only-if-cached asset must not reject', result.error.message);
    } else if (result?.response?.status === 504) {
        pass('missing only-if-cached asset resolves with 504', 'status 504');
    } else {
        fail('missing only-if-cached asset resolves with 504', `status ${result?.response?.status}`);
    }
}

// 6. API calls, cross-origin CDN traffic and non-GET requests are untouched.
{
    const apiCall = await dispatch(makeRequest({ url: `${ORIGIN}/api/payment/generate-qr`, mode: 'cors' }));
    const cdnCall = await dispatch(makeRequest({ url: 'https://res.cloudinary.com/demo/image.jpg', mode: 'no-cors' }));
    const postCall = await dispatch(makeRequest({ url: `${ORIGIN}/api/auth/csrf`, method: 'POST' }));

    if (apiCall === null && cdnCall === null && postCall === null) {
        pass('API / cross-origin / non-GET requests are not intercepted');
    } else {
        fail('API / cross-origin / non-GET requests are not intercepted');
    }
}

// 7. No cached shell at all: a synthesised offline page still resolves.
{
    cacheStore.delete('/index.html');
    const result = await dispatch(makeRequest());
    cacheStore.set('/index.html', new Response(SHELL_BODY, { status: 200, headers: { 'Content-Type': 'text/html' } }));
    if (result?.error) {
        fail('empty cache must still resolve a document', result.error.message);
    } else if (result?.response?.status === 200) {
        pass('empty cache resolves the offline shell page', 'status 200');
    } else {
        fail('empty cache resolves the offline shell page', `status ${result?.response?.status}`);
    }
}

console.log(
    failures === 0
        ? '\nAll service worker contract checks passed.\n'
        : `\n${failures} service worker contract check(s) failed.\n`
);

process.exit(failures === 0 ? 0 : 1);
