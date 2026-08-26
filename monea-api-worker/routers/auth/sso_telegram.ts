import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/sso/telegram/handler';

const router = new Hono();

router.get('/', async (c) => {
  try {
    // Standard Web API call passing the raw request to Next.js route handler
    return await nextRoute.GET(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Telegram SSO Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to initialize Telegram SSO authentication',
      },
      500
    );
  }
});

export default router;