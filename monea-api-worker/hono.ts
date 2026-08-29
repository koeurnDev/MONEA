import { Hono } from 'hono';
import { compress } from 'hono/compress';
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
import giftsRouter from './routers/gifts';
import staffRouter from './routers/staff';
import supportRouter from './routers/support';
import systemRouter from './routers/system';
import templatesRouter from './routers/templates';
import { userRouter, usersRouter } from './routers/user';
import galleryRouter from './routers/gallery';
import logsRouter from './routers/logs';
import pricingRouter from './routers/pricing';
import publicStatsRouter from './routers/publicStats';
import pingRouter from './routers/ping';
import sentryTunnelRouter from './routers/sentryTunnel';
import cronRouter from './routers/cron';
import { cors } from 'hono/cors';

// Export the root hono app
const app = new Hono().basePath('/api');

// Disable compression globally to prevent encoding issues with cross-origin requests
// Browser will handle gzip/br decompression automatically if needed
// app.use('*', compress());  // DISABLED - causing response decoding issues

// Global middleware to serialize Date objects in JSON responses
app.use('*', async (c, next) => {
  // Store original json method
  const originalJson = c.json.bind(c);
  
  // Override json method to serialize Date objects
  c.json = function(data: any, status?: number, headers?: any) {
    // Recursively convert Date objects to ISO strings
    const serializeData = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      if (obj instanceof Date) {
        console.log('[Date Serializer] Converting Date to ISO string:', obj.toISOString());
        return obj.toISOString();
      }
      if (Array.isArray(obj)) return obj.map(serializeData);
      if (typeof obj === 'object' && obj.constructor === Object) {
        const serialized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          serialized[key] = serializeData(value);
        }
        return serialized;
      }
      return obj;
    };
    
    const serializedData = serializeData(data);
    return originalJson(serializedData, status as any, headers);
  } as any;
  
  await next();
});

// Configure CORS for cross-origin requests (optimized for performance)
app.use('*', cors({
  origin: (origin, c) => {
    if (!origin) return 'https://monea-webapp.pages.dev';
    
    const allowedOrigins = [
      'https://monea-webapp.pages.dev',
      'https://monea.app',
      'https://www.monea.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    
    // Quick exact match check
    if (allowedOrigins.includes(origin)) return origin;
    
    // Pattern match for preview deployments (supports hyphens and custom branches)
    if (origin.match(/^https:\/\/[a-z0-9-]+\.monea-webapp\.pages\.dev$/)) return origin;
    if (origin.match(/^https:\/\/(.*\.)?monea\.app$/)) return origin;
    if (origin.match(/^http:\/\/localhost:\d+$/)) return origin;
    if (origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) return origin;
    
    return null; // Reject origin
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Client-Fingerprint', 'Cache-Control', 'Pragma', 'sentry-trace', 'baggage', 'Priority'],
  exposeHeaders: ['Content-Length', 'Cache-Control', 'X-CSRF-Token', 'sentry-trace', 'baggage'],
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

// Basic health check endpoint with aggressive caching
app.get('/health', (c) => {
  c.header('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
  c.header('CDN-Cache-Control', 'max-age=300');
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// Debug endpoint to check cookies and headers
app.get('/debug/headers', (c) => {
  const headers = Object.fromEntries(c.req.raw.headers.entries());
  return c.json({ 
    headers,
    cookies: c.req.header('cookie'),
    origin: c.req.header('origin'),
    timestamp: new Date().toISOString()
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
app.route('/gifts', giftsRouter);
app.route('/staff', staffRouter);
app.route('/support', supportRouter);
app.route('/system', systemRouter);
app.route('/templates', templatesRouter);
app.route('/user', userRouter);
app.route('/users', usersRouter);
app.route('/gallery', galleryRouter);
app.route('/logs', logsRouter);
app.route('/pricing', pricingRouter);
app.route('/public-stats', publicStatsRouter);
app.route('/ping', pingRouter);
app.route('/sentry-tunnel', sentryTunnelRouter);
app.route('/cron', cronRouter);

// Global Error Handler - simplified for better performance  
app.onError((err, c) => {
  console.error(`[Error] ${c.req.method} ${c.req.url}:`, err?.message || err);
  
  // Set CORS headers for error responses
  const origin = c.req.header('origin');
  if (origin) c.header('Access-Control-Allow-Origin', origin);
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Connection', 'keep-alive');

  return c.json({ 
    success: false, 
    error: "Internal Server Error", 
    details: err?.message || "Unknown error",
    timestamp: new Date().toISOString()
  }, 500);
});

// Export type for RPC client if needed on frontend
export type AppType = typeof app;

export default app;