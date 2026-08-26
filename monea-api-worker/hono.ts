import { Hono } from 'hono';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { prismaStorage } from '@/lib/prisma';
import { requestStorage } from '@/lib/auth';
import dashboardRouter from './routers/dashboard';
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

// Configure CORS for cross-origin requests (Cloudflare Pages <-> Cloudflare Worker)
app.use('*', cors({
  origin: (origin, c) => {
    // Debug logging
    console.log(`[CORS] Checking origin: ${origin}`);
    
    if (!origin) {
      // For requests without origin (same-origin, Postman, curl, etc.)
      console.log('[CORS] No origin header - allowing');
      return 'https://monea-webapp.pages.dev';
    }
    
    const allowedOrigins = [
      'https://monea-webapp.pages.dev',
      'https://monea.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    
    const allowedPatterns = [
      /^https:\/\/[a-z0-9]+\.monea-webapp\.pages\.dev$/,
      /^https:\/\/.*\.pages\.dev$/,
      /^https:\/\/.*\.monea\.app$/,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];
    
    // Check exact matches first
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Allowed exact origin: ${origin}`);
      return origin;
    }
    
    // Check pattern matches - for preview deployments like 36f25f50.monea-webapp.pages.dev
    for (const pattern of allowedPatterns) {
      if (pattern.test(origin)) {
        console.log(`[CORS] Allowed pattern origin: ${origin}`);
        return origin;
      }
    }
    
    console.warn(`[CORS] Rejected origin: ${origin}`);
    return null; // Reject origin
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Client-Fingerprint', 'Cache-Control'],
  exposeHeaders: ['Content-Length', 'X-CSRF-Token'],
  maxAge: 86400,
  credentials: true, // MUST be true for auth cookies/tokens
}));

let _cachedWorkerPrisma: PrismaClient | null = null;

function getWorkerPrisma(connectionString: string): PrismaClient {
  if (!_cachedWorkerPrisma) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    _cachedWorkerPrisma = new PrismaClient({ adapter, log: [] });
  }
  return _cachedWorkerPrisma;
}

// Polyfill process.env and provide optimized cached PrismaClient for Cloudflare Workers
app.use('*', async (c, next) => {
  if (typeof (globalThis as any).process === 'undefined') {
    (globalThis as any).process = { env: {} };
  }
  const env = (c.env as any) || {};
  Object.assign((globalThis as any).process.env, env);

  const dbUrl = (env.DATABASE_URL || process.env.DATABASE_URL) as string;
  const prismaClient = dbUrl ? getWorkerPrisma(dbUrl) : null;

  await requestStorage.run(c.req.raw, async () => {
    if (prismaClient) {
      await prismaStorage.run(prismaClient, async () => {
        await next();
      });
    } else {
      await next();
    }
  });
});

// Basic health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
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

// Export type for RPC client if needed on frontend
export type AppType = typeof app;

export default app;