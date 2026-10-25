import { Hono } from 'hono';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';
import * as disable2FAHandler from '@/auth_handlers/2fa/disable/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    const response = await disable2FAHandler.POST(c.req.raw);
    return response;
  } catch (error: any) {
    console.error('[Hono 2FA Disable Route Error]:', error?.message || error);
    return corsJsonResponse(
      {
        success: false,
        error: error?.message || 'Failed to process 2FA disable request',
      },
      500,
      c.req.raw
    );
  }
});

router.options('/', async (c) => {
  try {
    return corsOptionsResponse(c.req.raw);
  } catch (error: any) {
    console.error('[Hono 2FA Disable OPTIONS Error]:', error?.message || error);
    return corsJsonResponse({ error: 'Internal Server Error' }, 500, c.req.raw);
  }
});

export default router;
