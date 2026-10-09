import { Hono } from 'hono';
import * as telegramOidc from '@/auth_handlers/sso/telegram/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    return await telegramOidc.START();
  } catch (error: any) {
    console.error('[Hono Telegram OIDC Start Error]:', error?.message || error);
    return c.json(
      {
        success: false,
        error: 'Failed to initialize Telegram sign-in',
      },
      500
    );
  }
});

router.post('/link', async (c) => {
  try {
    return await telegramOidc.LINK(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Telegram OIDC Link Start Error]:', error?.message || error);
    return c.json({ success: false, error: 'Failed to initialize Telegram linking' }, 500);
  }
});

router.post('/callback', async (c) => {
  try {
    return await telegramOidc.CALLBACK(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Telegram OIDC Callback Error]:', error?.message || error);
    return c.json({ success: false, error: 'Failed to complete Telegram sign-in' }, 500);
  }
});

export default router;