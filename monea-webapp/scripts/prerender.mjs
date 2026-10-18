/**
 * MONEA Prerender Script
 * ----------------------
 * Generates static HTML snapshots of public-facing pages so that Google's
 * crawler can index the site without executing JavaScript.
 *
 * How it works:
 *  1. Starts a local static server serving the dist/ folder.
 *  2. Uses Puppeteer (headless Chrome) to visit each public route.
 *  3. Waits for React to finish rendering (network idle).
 *  4. Saves the rendered HTML back into dist/<route>/index.html.
 *
 * Usage:
 *   node scripts/prerender.mjs
 */

import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(ROOT, '..', 'dist');
const PORT = 5050;

const ROUTES = [
  '/',
  '/templates',
  '/contact',
  '/support',
  '/khmer-digital-wedding-invitation',
  '/pricing',
  '/privacy-policy',
  '/terms-and-conditions',
];

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
    '.json': 'application/json',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
  }[ext] ?? 'application/octet-stream');
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath !== '/' && urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1);

      let filePath = path.join(DIST, urlPath);
      const indexPath = path.join(DIST, urlPath, 'index.html');

      if (existsSync(indexPath)) filePath = indexPath;
      else if (!existsSync(filePath)) filePath = path.join(DIST, 'index.html');

      try {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': getMime(filePath) });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(PORT, '127.0.0.1', () => {
      console.log('  static server ready at http://127.0.0.1:' + PORT);
      resolve(server);
    });
  });
}

async function prerenderRoute(page, route) {
  console.log('  rendering ' + route + ' ...');
  await page.goto('http://127.0.0.1:' + PORT + route, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    const keepLastBy = (selector, attribute) => {
      const lastByKey = new Map();
      for (const element of document.head.querySelectorAll(selector)) {
        const key = element.getAttribute(attribute);
        lastByKey.get(key)?.remove();
        lastByKey.set(key, element);
      }
    };
    keepLastBy('link[rel="canonical"]', 'rel');
    keepLastBy('meta[name="description"]', 'name');
    keepLastBy('meta[property^="og:"]', 'property');
    keepLastBy('meta[name^="twitter:"]', 'name');
    for (const preload of document.head.querySelectorAll('link[rel="modulepreload"]')) {
      if (preload.href.startsWith('http://127.0.0.1:')) preload.remove();
    }
    for (const stylesheet of document.head.querySelectorAll('link[data-nonblocking-stylesheet]')) {
      stylesheet.media = 'print';
      stylesheet.removeAttribute('data-nonblocking-stylesheet');
    }
  });
  const html = await page.content();
  const outputDir = route === '/' ? DIST : path.join(DIST, ...route.split('/').filter(Boolean));
  mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, 'index.html');
  writeFileSync(outputFile, html, 'utf8');
  console.log('  saved -> ' + path.relative(DIST, outputFile));
}

// ─── IndexNow ping ───────────────────────────────────────────────────────────
const INDEXNOW_KEY  = 'a98f86937b194cfdb17978afbe9d45ad';
const SITE_HOST     = 'https://moneoez.com';

async function pingIndexNow(routes) {
  const urls = routes.map(r => `${SITE_HOST}${r}`);
  const body = JSON.stringify({
    host: 'moneoez.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
    });
    if (res.status === 200 || res.status === 202) {
      console.log(`  IndexNow ping OK (${res.status}) — notified ${urls.length} URLs`);
    } else {
      console.warn(`  IndexNow ping returned ${res.status}`);
    }
  } catch (err) {
    console.warn('  IndexNow ping failed (non-fatal):', err.message);
  }
}

async function main() {
  console.log('\nMONEA Prerender starting\n');
  if (!existsSync(DIST)) { console.error('dist/ not found. Run npm run build first.'); process.exit(1); }

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', () => {});
    page.on('pageerror', () => {});
    await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
    await page.setViewport({ width: 1280, height: 800 });
    for (const route of ROUTES) { await prerenderRoute(page, route); }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\nPrerender complete!');
  if (process.env.INDEXNOW_NOTIFY === 'true') {
    console.log('\nPinging IndexNow...');
    await pingIndexNow(ROUTES);
  }
  console.log();
}

main().catch(err => { console.error('Prerender failed:', err); process.exit(1); });
