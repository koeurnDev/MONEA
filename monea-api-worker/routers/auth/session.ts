import { Hono } from 'hono';
import { verifyExchangeTicket, getCookieHeader } from '@/lib/auth';
import { ExchangeTicketStoreUnavailableError } from '@/lib/exchange-ticket';
import { isRecord, readJsonBodyLimited } from '@/lib/read-json-body-limited';
import { corsJsonResponse, corsOptionsResponse } from '@/lib/cors-utils';

const router = new Hono();
const MAX_SESSION_EXCHANGE_BODY_BYTES = 4_096;
const MAX_SESSION_EXCHANGE_CODE_LENGTH = 3_072;

/**
 * POST /api/auth/session
 *
 * Exchanges a cryptographic one-time ticket for a session cookie.
 * The ticket is HMAC-SHA256 signed with the server's JWT_SECRET and expires in 60s.
 *
 * Security properties:
 * - The session JWT is carried only inside the signed short-lived ticket, not returned directly
 * - The exchange ticket is signed and tamper-proof
 * - The exchange ticket expires in 60 seconds
 * - The cookie is set via the Vite proxy on the correct origin
 * - The ticket is atomically consumed from Redis in production and cannot be replayed
 */
router.post('/', async (c) => {
    try {
        const parsedBody = await readJsonBodyLimited(c.req.raw, MAX_SESSION_EXCHANGE_BODY_BYTES);
        if (parsedBody.kind === 'too_large') {
            return corsJsonResponse({ success: false, error: 'Request body is too large' }, 413, c.req.raw);
        }
        if (parsedBody.kind !== 'ok' || !isRecord(parsedBody.value)) {
            return corsJsonResponse({ success: false, error: 'Invalid request body' }, 400, c.req.raw);
        }

        const { code } = parsedBody.value;

        if (typeof code !== 'string' || code.length === 0 || code.length > MAX_SESSION_EXCHANGE_CODE_LENGTH) {
            return corsJsonResponse({ success: false, error: 'Exchange code is required' }, 400, c.req.raw);
        }

        // Verify cryptographic exchange ticket (Passing c.env if supported by lib/auth)
        const token = await verifyExchangeTicket(code);

        if (!token) {
            console.error('[Session Error] verifyExchangeTicket returned null or expired ticket.');
            return corsJsonResponse({ success: false, error: 'Invalid or expired exchange ticket' }, 401, c.req.raw);
        }

        // Set secure authentication session cookie (30 days lifespan default)
        const cookieStr = getCookieHeader('token', token, c.req.raw, 60 * 60 * 24 * 30);
        c.header('Set-Cookie', cookieStr);
        
        // Disable compression for this response to avoid encoding issues
        c.header('Content-Type', 'application/json; charset=utf-8');
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
        
        return corsJsonResponse({ ok: true, success: true }, 200, c.req.raw);
    } catch (error: any) {
        if (error instanceof ExchangeTicketStoreUnavailableError) {
            console.error('[Session Error] Exchange ticket storage unavailable:', error);
            return corsJsonResponse(
                { success: false, error: 'Session exchange is temporarily unavailable. Please try again later.' },
                503,
                c.req.raw
            );
        }
        console.error('[Session Exception]:', error?.message || error);
        return corsJsonResponse({ success: false, error: 'Invalid exchange session' }, 401, c.req.raw);
    }
});

router.options('/', async (c) => {
  try {
    // Use our CORS utility for preflight
    return corsOptionsResponse(c.req.raw);
  } catch (error: any) {
    console.error('[Hono Session OPTIONS Error]:', error?.message || error);
    return corsJsonResponse({ error: 'Internal Server Error' }, 500, c.req.raw);
  }
});

export default router;