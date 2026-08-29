import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/inspect/handler';

const router = new Hono();

router.get('/', async (c) => {
  try {
    // @ts-ignore - Handlers may or may not require standard request argument
    return await nextRoute.GET(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Inspect Route Error]:', error?.message || error);
    
    return c.json(
      {
        success: false,
        error: error?.message || 'Failed to process inspection request',
      },
      500
    );
  }
});

export default router;