import { Hono } from 'hono';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';
import * as nextRoute from '@/auth_handlers/forgot-password/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    return await nextRoute.POST(c.req.raw, c.env);
  } catch (error: any) {
    console.error('[Hono Forgot Password Route Error]:', error?.message || error);
    
    return corsJsonResponse(
      {
        success: false,
        error: error?.message || 'Failed to process forgot password request',
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
    console.error('[Hono Forgot Password OPTIONS Error]:', error?.message || error);
    return corsJsonResponse({ error: 'Internal Server Error' }, 500, c.req.raw);
  }
});

export default router;
