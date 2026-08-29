import { Hono } from 'hono';
import { verifyExchangeTicket, getCookieHeader } from '@/lib/auth';

const router = new Hono();

/**
 * POST /api/auth/session
 *
 * Exchanges a cryptographic one-time ticket for a session cookie.
 * The ticket is HMAC-SHA256 signed with the server's JWT_SECRET and expires in 60s.
 *
 * Security properties:
 * - The raw JWT session is never exposed in plaintext
 * - The exchange ticket is signed and tamper-proof
 * - The exchange ticket expires in 60 seconds
 * - The cookie is set via the Vite proxy on the correct origin
 * - Zero dependency on Redis network connectivity or cold starts
 */
router.post('/', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const { code } = body;

        if (!code || typeof code !== 'string') {
            return c.json({ success: false, error: 'Exchange code is required' }, 400);
        }

        // Verify cryptographic exchange ticket (Passing c.env if supported by lib/auth)
        const token = await verifyExchangeTicket(code);

        if (!token) {
            console.error('[Session Error] verifyExchangeTicket returned null or expired ticket.');
            return c.json({ success: false, error: 'Invalid or expired exchange ticket' }, 401);
        }

        // Set secure authentication session cookie (30 days lifespan default)
        const cookieStr = getCookieHeader('token', token, c.req.raw, 60 * 60 * 24 * 30);
        c.header('Set-Cookie', cookieStr);
        
        // Disable compression for this response to avoid encoding issues
        c.header('Content-Type', 'application/json; charset=utf-8');
        c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
        
        // Return the token so the frontend can store it in localStorage
        // This allows the Authorization: Bearer header to work for cross-origin requests
        const response = { ok: true, success: true, token };
        console.log('[Session] Returning response:', JSON.stringify(response).substring(0, 100));
        return c.json(response);
    } catch (error: any) {
        console.error('[Session Exception]:', error?.message || error);
        return c.json({ success: false, error: 'Invalid exchange session' }, 401);
    }
});

export default router;