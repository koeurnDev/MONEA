import { Hono } from 'hono';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';
import * as nextRoute from '@/auth_handlers/signup/handler';

const router = new Hono();

router.post('/', async (c) => {
  try {
    // Standard Web API call for user sign-up registration
    return await nextRoute.POST(c.req.raw, c.env);
  } catch (error: any) {
    const requestId = crypto.randomUUID();
    console.error(`[Hono Signup Route Error] ${requestId}:`, error);
    
    return corsJsonResponse(
      {
        success: false,
        error: 'ការបង្កើតគណនីមិនទាន់បានសម្រេចទេ។ សូមព្យាយាមម្ដងទៀត។',
        requestId,
      },
      500,
      c.req.raw
    );
  }
});

router.options('/', async (c) => {
  try {
    // Use our CORS utility for preflight
    return corsOptionsResponse(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Signup OPTIONS Error]:', error?.message || error);
    return corsJsonResponse({ error: 'Internal Server Error' }, 500, c.req.raw);
  }
});

export default router;
