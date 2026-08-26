import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/sso/callback/handler';

const router = new Hono();

router.get('/', async (c) => {
  try {
    // Standard Web API call passing the raw request to Next.js route handler
    return await nextRoute.GET(c.req.raw);
  } catch (error: any) {
    console.error('[Hono SSO Callback Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process SSO authentication callback',
      },
      500
    );
  }
});

export default router;