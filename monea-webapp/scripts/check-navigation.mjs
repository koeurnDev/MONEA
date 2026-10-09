/**
 * Navigation contract check.
 *
 * The dashboard used to ship eight routes (`/dashboard/scanner`, `/dashboard/gifts`,
 * `/dashboard/reports`, `/dashboard/notes`, `/dashboard/staff`, `/dashboard/display`,
 * `/dashboard/guide`, ...) that had no link pointing at them: the pages worked, but
 * the only way to reach them was to type the URL, which is what made the product feel
 * unusable. It also linked to `/dashboard/timeline`, which is not a route at all.
 *
 * This script keeps that class of bug out:
 *   1. every internal link target resolves to a declared route (no dead links)
 *   2. every dashboard route has at least one in-app entry point (no orphan pages)
 *   3. every i18n key used by the navigation resolves in both dictionaries
 *      (otherwise labels silently fall back to their Khmer default in English)
 *
 * Usage: node scripts/check-navigation.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const I18N = path.join(SRC, 'i18n');

const walk = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts)$/.test(entry.name)) acc.push(full);
  }
  return acc;
};

const files = walk(SRC);
const read = (f) => fs.readFileSync(f, 'utf8');

/* 1. Routes -------------------------------------------------------------- */

const router = read(path.join(SRC, 'router.tsx'));
const routes = [...router.matchAll(/path="([^"]*)"/g)].map((m) => m[1]).filter((r) => r !== '*');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasRoute = (url) =>
  routes.some((r) => r === url || new RegExp('^' + escapeRe(r).replace(/:[^/]+/g, '[^/]+') + '$').test(url));

/* 2. Link targets -------------------------------------------------------- */

const SOURCES = [
  /\bto=\{?["'`](\/[^"'`}\s]*)/g,            // <Link to="/x"> / <Link to={`/x`}>
  /\bnavigate\(\s*["'`](\/[^"'`?\s]*)/g,      // navigate('/x')
  /\bhref=["'`](\/[^"'`?\s]*)/g,              // <a href="/x">
  /\bhref:\s*["'`](\/[^"'`?\s]*)/g,           // { href: "/x" } nav tables
];

const links = new Map();
for (const file of files) {
  const source = read(file);
  for (const pattern of SOURCES) {
    for (const match of source.matchAll(pattern)) {
      const url = match[1];
      const next = source[match.index + match[0].length];
      // A template literal (`/dashboard?w=${id}`) is not a static target, and
      // `/api/...` is an endpoint rather than a route.
      if (next === '{' || url.includes('$') || url.includes('{') || url.startsWith('/api/')) continue;
      if (!links.has(url)) links.set(url, new Set());
      links.get(url).add(path.relative(SRC, file));
    }
  }
}

/* 3. i18n keys used by the navigation ------------------------------------ */

const NAV_FILES = [
  'app/dashboard/_components/DashboardSidebar.tsx',
  'app/dashboard/_components/MobileBottomNav.tsx',
  'app/dashboard/page.tsx',
];

const km = JSON.parse(read(path.join(I18N, 'km.json')));
const en = JSON.parse(read(path.join(I18N, 'en.json')));
const resolve = (dict, key) =>
  key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);

/* Report ----------------------------------------------------------------- */

const failures = [];
const section = (title) => console.log(`\n=== ${title} ===`);

section('Dead links (link target has no route)');
const dead = [...links].filter(([url]) => !hasRoute(url));
if (dead.length) {
  for (const [url, from] of dead) console.log(`  DEAD ${url}  <=  ${[...from].join(', ')}`);
  failures.push(`${dead.length} link(s) point at a route that does not exist`);
} else {
  console.log('  none');
}

section('Dashboard routes with no in-app entry point');
/**
 * Routes that deliberately have no navigation entry: they exist only so old links
 * and bookmarks keep working, and they immediately forward somewhere useful.
 */
const INTENTIONAL_REDIRECTS = {
  '/dashboard/settings': 'legacy alias -> /dashboard/account',
  '/staff/dashboard': 'legacy entry -> /dashboard/gifts (staff sign in to /dashboard)',
};

const dashboardRoutes = routes.filter((r) => r.startsWith('/dashboard') || r.startsWith('/staff'));
const orphans = dashboardRoutes.filter((r) => !links.has(r) && !INTENTIONAL_REDIRECTS[r]);
for (const [route, reason] of Object.entries(INTENTIONAL_REDIRECTS)) {
  if (dashboardRoutes.includes(route)) console.log(`  ok    ${route} (${reason})`);
}
if (orphans.length) {
  for (const route of orphans) console.log(`  ORPHAN ${route}`);
  failures.push(`${orphans.length} dashboard route(s) unreachable from the UI`);
} else {
  console.log(`  no orphan pages (${dashboardRoutes.length} dashboard routes checked)`);
}

section('Navigation i18n keys');
let missingKeys = 0;
const usedKeys = new Set();
for (const rel of NAV_FILES) {
  const source = read(path.join(SRC, rel));
  for (const match of source.matchAll(/t\("(dashboard\.(?:nav|menu|cards)\.[A-Za-z]+)"/g)) {
    usedKeys.add(match[1]);
  }
}
for (const key of [...usedKeys].sort()) {
  const kmValue = resolve(km, key);
  const enValue = resolve(en, key);
  const ok = typeof kmValue === 'string' && typeof enValue === 'string';
  if (!ok) {
    missingKeys++;
    console.log(`  MISSING ${key}  (km=${kmValue ?? 'undefined'}, en=${enValue ?? 'undefined'})`);
  }
}
if (!missingKeys) console.log(`  all ${usedKeys.size} keys resolved in km + en`);
else failures.push(`${missingKeys} navigation key(s) missing from a dictionary`);

console.log('');
if (failures.length) {
  console.error(`NAVIGATION CHECK FAILED: ${failures.join('; ')}`);
  process.exit(1);
}
console.log('NAVIGATION CHECK PASSED');
