import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/forgot-password/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call passing the raw request to Next.js route handler
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Forgot Password Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process forgot password request',
      },
      500
    );
  }
});

export default router;