import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/2fa/verify/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Passes the raw Web Request standard object to Next.js route handler
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    console.error('[Hono 2FA Verify Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process 2FA verification request',
      },
      500
    );
  }
});

export default router;