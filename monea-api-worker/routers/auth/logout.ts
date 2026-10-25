import { Hono } from 'hono';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';
import * as nextRoute from '@/auth_handlers/logout/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call passing the raw request to Next.js route handler
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Logout Route Error]:', error?.message || error);
    
    return corsJsonResponse(
      {
        success: false,
        error: error?.message || 'Failed to process logout request',
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
    console.error('[Hono Logout OPTIONS Error]:', error?.message || error);
    return corsJsonResponse({ error: 'Internal Server Error' }, 500, c.req.raw);
  }
});

export default router;
