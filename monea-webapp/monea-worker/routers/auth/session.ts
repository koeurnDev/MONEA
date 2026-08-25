import { Hono } from 'hono';
import { isSecureCookie, verifyExchangeTicket } from '@/lib/auth';

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
 * - The cookie is set via the Vite proxy on the correct origin (port 3001)
 * - Zero dependency on Redis network connectivity or cold starts
 */
router.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { code } = body;

        if (!code || typeof code !== 'string') {
            return c.json({ error: 'Exchange code is required' }, 400);
        }

        const token = await verifyExchangeTicket(code);

        if (!token) {
            console.error('[Session] verifyExchangeTicket returned null or expired');
            return c.json({ error: 'Invalid or expired exchange ticket' }, 401);
        }

        const req = c.req.raw;
        const cookieSecure = isSecureCookie(req);
        const secure = cookieSecure ? '; Secure' : '';
        const maxAge = 60 * 60 * 24 * 30; // 30 days

        c.header('Set-Cookie', `token=${token}; HttpOnly${secure}; Path=/; SameSite=Lax; Max-Age=${maxAge}`);
        return c.json({ ok: true });
    } catch (error) {
        console.error('[Session] Unexpected Error:', error);
        return c.json({ error: 'Invalid exchange session' }, 401);
    }
});

export default router;
