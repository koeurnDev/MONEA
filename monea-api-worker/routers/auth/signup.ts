import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/signup/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call for user sign-up registration
    return await nextRoute.POST(c.req.raw);
  } catch (error: any) {
    const requestId = crypto.randomUUID();
    console.error(`[Hono Signup Route Error] ${requestId}:`, error);
    
    return c.json(
      {
        success: false,
        error: 'ការបង្កើតគណនីមិនទាន់បានសម្រេចទេ។ សូមព្យាយាមម្ដងទៀត។',
        requestId,
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
    // Use c.body(null, 204) for empty 204 No Content responses to satisfy Hono types
    return c.body(null, 204);
  } catch (error: any) {
    console.error('[Hono Signup OPTIONS Error]:', error?.message || error);
    return c.text('Internal Server Error', 500);
  }
});

export default router;