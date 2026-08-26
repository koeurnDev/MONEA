import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/logout/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call passing the raw request to Next.js route handler
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Logout Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process logout request',
      },
      500
    );
  }
});

export default router;