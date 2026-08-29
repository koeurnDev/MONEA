import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/2fa/setup/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call using Hono's raw Request object
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    console.error('[Hono 2FA Setup Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process 2FA setup request',
      },
      500
    );
  }
});

export default router;