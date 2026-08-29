import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/sso/google/handler';

const router = new Hono();

router.get('/', async (c) => {
  try {
    // Standard Web API call passing the raw request to Next.js route handler
    return await nextRoute.GET(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Google SSO Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to initialize Google SSO authentication',
      },
      500
    );
  }
});

export default router;