import { Hono } from 'hono'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import { prismaStorage } from '@/lib/prisma'
import { requestStorage } from '@/lib/auth'
import dashboardRouter from './routers/dashboard'
import guestbookRouter from './routers/guestbook'
import authRouter from './routers/auth'
import paymentRouter from './routers/payment'
import guestsRouter from './routers/guests'
import weddingRouter from './routers/wedding'
import adminRouter from './routers/admin'
import adminMasterRouter from './routers/adminMaster'
import activitiesRouter from './routers/activities'
import analyticsRouter from './routers/analytics'
import broadcastRouter from './routers/broadcast'
import cloudinaryRouter from './routers/cloudinary'
import imagekitRouter from './routers/imagekit'
import giftsRouter from './routers/gifts'
import staffRouter from './routers/staff'
import supportRouter from './routers/support'
import systemRouter from './routers/system'
import templatesRouter from './routers/templates'
import { userRouter, usersRouter } from './routers/user'
import galleryRouter from './routers/gallery'
import logsRouter from './routers/logs'
import pricingRouter from './routers/pricing'
import publicStatsRouter from './routers/publicStats'
import pingRouter from './routers/ping'
import sentryTunnelRouter from './routers/sentryTunnel'
import cronRouter from './routers/cron'

// Export the root hono app
const app = new Hono().basePath('/api')

// Polyfill process.env and provide a per-request PrismaClient for Cloudflare Workers
app.use('*', async (c, next) => {
  if (typeof (globalThis as any).process === 'undefined') {
    (globalThis as any).process = { env: {} };
  }
  const env = (c.env as any) || {};
  Object.assign((globalThis as any).process.env, env);

  // Per-request PrismaClient to fix Cloudflare I/O context errors
  const pool = new Pool({ connectionString: (env.DATABASE_URL || process.env.DATABASE_URL) as string });
  const adapter = new PrismaNeon(pool);
  const prismaClient = new PrismaClient({ adapter, log: [] });

  await requestStorage.run(c.req.raw, async () => {
    await prismaStorage.run(prismaClient, async () => {
      await next();
    });
  });
});

// Basic health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routers
app.route('/dashboard', dashboardRouter)
app.route('/guestbook', guestbookRouter)
app.route('/auth', authRouter)
app.route('/payment', paymentRouter)
app.route('/guests', guestsRouter)
app.route('/wedding', weddingRouter)
app.route('/admin', adminRouter)
app.route('/admin/master', adminMasterRouter)
app.route('/activities', activitiesRouter)
app.route('/analytics', analyticsRouter)
app.route('/broadcast', broadcastRouter)
app.route('/cloudinary', cloudinaryRouter)
app.route('/imagekit', imagekitRouter)
app.route('/gifts', giftsRouter)
app.route('/staff', staffRouter)
app.route('/support', supportRouter)
app.route('/system', systemRouter)
app.route('/templates', templatesRouter)
app.route('/user', userRouter)
app.route('/users', usersRouter)
app.route('/gallery', galleryRouter)
app.route('/logs', logsRouter)
app.route('/pricing', pricingRouter)
app.route('/public-stats', publicStatsRouter)
app.route('/ping', pingRouter)
app.route('/sentry-tunnel', sentryTunnelRouter)
app.route('/cron', cronRouter)

// Export type for RPC client if needed on frontend
export type AppType = typeof app

export default app
