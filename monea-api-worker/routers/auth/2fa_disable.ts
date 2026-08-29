import { Hono } from 'hono';
import * as disable2FAHandler from '@/auth_handlers/2fa/disable/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Pass environment variables or context safely via request clone or standard call
    const response = await disable2FAHandler.POST(c.req.raw);
    return response;
  } catch (error: any) {
    console.error('[Hono 2FA Disable Route Error]:', error?.message || error);
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process 2FA disable request',
      },
      500
    );
  }
});

export default router;