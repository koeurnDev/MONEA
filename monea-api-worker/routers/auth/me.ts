import { Hono } from 'hono';
import * as nextRoute from '@/server/auth_handlers/me/handler';

const router = new Hono();

router.get('/', async (c) => {
  try {
    // Standard Web API call for fetching user profile
    return await nextRoute.GET(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Me GET Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch user profile',
      },
      500
    );
  }
});

router.put('/', async (c) => {
  try {
    // Standard Web API call for updating user profile
    return await nextRoute.PUT(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Me PUT Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to update user profile',
      },
      500
    );
  }
});

export default router;