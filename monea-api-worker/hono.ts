import { Hono } from 'hono';
import { prisma } from './lib/prisma';
import dashboardRouter from './routers/dashboard';
import dashboardCombinedRouter from './routers/dashboard-combined';
import guestbookRouter from './routers/guestbook';
import authRouter from './routers/auth';
import paymentRouter from './routers/payment';
import guestsRouter from './routers/guests';
import weddingRouter from './routers/wedding';
import adminRouter from './routers/admin';
import adminMasterRouter from './routers/adminMaster';
import activitiesRouter from './routers/activities';
import analyticsRouter from './routers/analytics';
import broadcastRouter from './routers/broadcast';
import cloudinaryRouter from './routers/cloudinary';
import imagekitRouter from './routers/imagekit';
import r2Router from './routers/r2';
import giftsRouter from './routers/gifts';
import staffRouter from './routers/staff';
import supportRouter from './routers/support';
import systemRouter from './routers/system';
import templatesRouter from './routers/templates';
import { userRouter, usersRouter } from './routers/user';
import galleryRouter from './routers/gallery';
import logsRouter from './routers/logs';
import publicStatsRouter from './routers/publicStats';
import pingRouter from './routers/ping';
import sentryTunnelRouter from './routers/sentryTunnel';
import cronRouter from './routers/cron';
import telegramWebhookRouter from './routers/telegram/webhook';
import templatePricingRouter from './routers/template-pricing';
import templatePurchaseRouter from './routers/template-purchase';
import templatePreviewRouter, { adminTemplatePreviewRouter } from './routers/template-preview';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { csrfProtection } from './lib/csrf';
import { RateLimitUnavailableError } from './lib/ratelimit';

// Export the root hono app
const app = new Hono().basePath('/api');
const workerStartedAt = Date.now();

const allowedOrigin = (origin: string | undefined) => {
  if (!origin) return 'https://moneoez.com';

  const allowedOrigins = [
    'https://moneoez.com',
    'https://www.moneoez.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  if (allowedOrigins.includes(origin)) return origin;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return origin;

  return undefined;
};

// Compression is deliberately NOT done in the Worker.
//
// History: a hand-rolled gzip middleware used to live here (and before it, hono's
// `compress()`), because "responses were not decodable". The real cause was the
// opposite: the Worker compressed and Cloudflare's edge compressed the Worker's
// already-encoded body again, while only one `Content-Encoding: gzip` header was
// advertised. Measured against the live Worker (2026-09-22):
//
//   client accepts gzip -> Content-Encoding: gzip, body needed *two* gunzips
//                          => every client decodes one layer and gets gzip bytes
//   client sends identity -> no Content-Encoding, body still gzipped once
//                          => undecodable as well
//
// Cloudflare already negotiates and compresses correctly on its own - e.g.
// `GET /api/public-stats` (never touched by Worker code) is served as `br` and
// decodes in a single layer - so the Worker now returns uncompressed JSON and
// lets the edge do the encoding, exactly as it does for HTML/CSS/JS assets.

// NOTE: the previous "serialize Date objects in JSON responses" middleware was removed.
// It deep-cloned every response object and called c.json() recursively, but it was
// redundant: hono's c.json() uses JSON.stringify, which already serializes Date via
// Date.prototype.toJSON() into the same ISO-8601 string.

// Configure CORS for cross-origin requests (optimized for performance)
app.use('*', cors({
  origin: (origin) => allowedOrigin(origin) || 'https://moneoez.com',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Client-Fingerprint', 'X-File-Name', 'Cache-Control', 'Pragma', 'sentry-trace', 'baggage', 'Priority'],
  exposeHeaders: ['Content-Length', 'Cache-Control', 'X-CSRF-Token', 'Server-Timing', 'sentry-trace', 'baggage'],
  maxAge: 86400,
  credentials: true,
}));

// Polyfill process.env - simplified for better performance
app.use('*', async (c, next) => {
  if (typeof (globalThis as any).process === 'undefined') {
    (globalThis as any).process = { env: {} };
  }
  const env = (c.env as any) || {};
  Object.assign((globalThis as any).process.env, env);

  await next();
});

// CSRF enforcement for state-changing, cookie-authenticated requests.
// Registered after the process.env polyfill so CSRF_SECRET is resolvable.
// Staged rollout / emergency valve: CSRF_ENFORCEMENT=monitor logs instead of blocking.
app.use('*', csrfProtection());

app.use('*', async (c, next) => {
  const startedAt = performance.now();
  await next();
  const existing = c.res.headers.get('Server-Timing');
  const workerTiming = `worker;dur=${(performance.now() - startedAt).toFixed(1)}`;
  c.header('Server-Timing', existing ? `${existing}, ${workerTiming}` : workerTiming);
});

// Basic health check endpoint with aggressive caching
app.get('/health', (c) => {
  c.header('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
  c.header('CDN-Cache-Control', 'max-age=300');
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/healthz', async (c) => {
  c.header('Cache-Control', 'no-store');
  c.header('CDN-Cache-Control', 'no-store');

  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({
      status: 'ok',
      database: 'ok',
      uptime: Math.floor((Date.now() - workerStartedAt) / 1000),
    });
  } catch (error) {
    console.error(
      '[Health Check] Database connectivity check failed:',
      error instanceof Error ? error.name : typeof error,
    );
    return c.json({
      status: 'error',
      database: 'unavailable',
      uptime: Math.floor((Date.now() - workerStartedAt) / 1000),
    }, 503);
  }
});

// Test endpoint with edge caching
app.get('/ping', (c) => {
  c.header('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');
  c.header('CDN-Cache-Control', 'max-age=60');
  return c.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    edge: 'optimized'
  });
});

// Mount routers
app.route('/dashboard', dashboardRouter);
app.route('/dashboard', dashboardCombinedRouter); // Combined/optimized routes
app.route('/guestbook', guestbookRouter);
app.route('/auth', authRouter);
app.route('/payment', paymentRouter);
app.route('/guests', guestsRouter);
app.route('/wedding', weddingRouter);
app.route('/admin', adminRouter);
app.route('/admin/master', adminMasterRouter);
app.route('/activities', activitiesRouter);
app.route('/analytics', analyticsRouter);
app.route('/broadcast', broadcastRouter);
app.route('/cloudinary', cloudinaryRouter);
app.route('/imagekit', imagekitRouter);
app.route('/r2', r2Router);
app.route('/gifts', giftsRouter);
app.route('/staff', staffRouter);
app.route('/support', supportRouter);
app.route('/system', systemRouter);
app.route('/templates', templatesRouter);
app.route('/user', userRouter);
app.route('/users', usersRouter);
app.route('/gallery', galleryRouter);
app.route('/logs', logsRouter);
app.route('/public-stats', publicStatsRouter);
app.route('/ping', pingRouter);
app.route('/sentry-tunnel', sentryTunnelRouter);
app.route('/cron', cronRouter);
  app.route('/telegram/webhook', telegramWebhookRouter);
app.route('/template-pricing', templatePricingRouter);
app.route('/template-purchase', templatePurchaseRouter);
app.route('/template-preview', templatePreviewRouter);
app.route('/admin/template-preview', adminTemplatePreviewRouter);

// Global Error Handler - simplified for better performance  
app.onError((err, c) => {
  const requestId = crypto.randomUUID();
  const rateLimitUnavailable = err instanceof RateLimitUnavailableError;
  const status = rateLimitUnavailable ? 503 : err instanceof HTTPException ? err.status : 500;
  const message = rateLimitUnavailable
    ? 'Request protection is temporarily unavailable. Please try again later.'
    : err instanceof HTTPException ? err.message : 'Internal Server Error';

  console.error(`[Error] ${requestId} ${c.req.method} ${c.req.url}:`, err);

  // Always set CORS headers on error responses
  const origin = allowedOrigin(c.req.header('origin'));
  if (origin) {
    c.header('Access-Control-Allow-Origin', origin);
  } else {
    c.header('Access-Control-Allow-Origin', 'https://moneoez.com');
  }
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Client-Fingerprint, X-File-Name, Cache-Control, Pragma, sentry-trace, baggage, Priority');
  c.header('Cache-Control', 'no-store');
  c.header('X-Request-ID', requestId);
  if (rateLimitUnavailable) c.header('Retry-After', '30');

  return c.json({
    success: false,
    error: message,
    requestId,
    timestamp: new Date().toISOString(),
  }, status as any);
});

// Export type for RPC client if needed on frontend
export type AppType = typeof app;

export default app;