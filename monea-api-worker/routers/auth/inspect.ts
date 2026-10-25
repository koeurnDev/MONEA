import { Hono } from 'hono';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';
import * as nextRoute from '@/auth_handlers/inspect/handler';

const router = new Hono();

router.get('/', async (c) => {
  try {
    // @ts-ignore - Handlers may or may not require standard request argument
    return await nextRoute.GET(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Inspect Route Error]:', error?.message || error);
    
    return corsJsonResponse(
      {
        success: false,
        error: error?.message || 'Failed to process inspection request',
      },
      500,
      c.req.raw
    );
  }
});

router.options('/', async (c) => {
  try {
    // Handle CORS preflight requests if defined in handler
    // Use our CORS utility for preflight
    return corsOptionsResponse(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Inspect OPTIONS Error]:', error?.message || error);
    return corsJsonResponse({ error: 'Internal Server Error' }, 500, c.req.raw);
  }
});

export default router;
