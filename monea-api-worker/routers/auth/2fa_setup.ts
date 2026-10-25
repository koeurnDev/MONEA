import { Hono } from 'hono';
import * as nextRoute from '@/auth_handlers/2fa/setup/handler';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';
import { RateLimitUnavailableError } from '@/lib/ratelimit';

const router = new Hono();

function isEnvironmentBindings(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// OPTIONS is handled by global CORS middleware - no need for route-specific handler

router.post('/', async (c) => {
  console.log('[2FA Setup POST] Request received');
  console.log('[2FA Setup POST] Origin:', c.req.header('origin'));
  console.log('[2FA Setup POST] Content-Type:', c.req.header('content-type'));
  
  try {
    // Standard Web API call using Hono's raw Request object
    return await nextRoute.POST(
      c.req.raw,
      isEnvironmentBindings(c.env) ? c.env : undefined,
    );
  } catch (error: any) {
    console.error('[Hono 2FA Setup Route Error]:', error?.message || error);
    
    // Handle rate limit errors specifically with 503 status
    const status = error instanceof RateLimitUnavailableError ? 503 : 500;
    const errorMessage = error?.message || 'Failed to process 2FA setup request';
    
    return corsJsonResponse(
      {
        success: false,
        error: errorMessage,
      },
      status,
      c.req.raw
    );
  }
});

export default router;