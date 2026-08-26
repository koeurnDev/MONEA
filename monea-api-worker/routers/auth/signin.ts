import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/signin/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call for user sign-in authentication
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Signin Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process sign-in request',
      },
      500
    );
  }
});

router.options('/', async (c) => {
  try {
    // Handle CORS preflight requests if defined in Next.js handler
    if (typeof nextRoute.OPTIONS === 'function') {
      return await nextRoute.OPTIONS(c.req.raw);
    }
    // Use c.body(null, 204) or c.status(204) for empty 204 No Content responses
    return c.body(null, 204);
  } catch (error: any) {
    console.error('[Hono Signin OPTIONS Error]:', error?.message || error);
    return c.text('Internal Server Error', 500);
  }
});

export default router;