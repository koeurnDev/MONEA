/**
 * CORS Utilities for Auth Handlers
 * 
 * Provides helper functions to ensure all responses include proper CORS headers,
 * especially important for error responses that might be blocked without them.
 */

/**
 * Extract allowed origin from request headers
 */
export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin');
  if (!origin) return 'https://moneoez.com';

  const allowedOrigins = [
    'https://moneoez.com',
    'https://www.moneoez.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  if (allowedOrigins.includes(origin)) return origin;
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return origin;

  return 'https://moneoez.com';
}

/**
 * Create response headers with CORS settings for auth handlers
 */
export function createCorsHeaders(req: Request): HeadersInit {
  const origin = getAllowedOrigin(req);
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Client-Fingerprint, X-File-Name, Cache-Control, Pragma, sentry-trace, baggage, Priority',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
}

/**
 * Create a JSON response with CORS headers
 */
export function corsJsonResponse(
  data: any,
  status: number = 200,
  req?: Request,
  additionalHeaders?: HeadersInit
): Response {
  const headers = {
    ...createCorsHeaders(req || new Request('http://localhost')),
    ...additionalHeaders,
  };
  return new Response(JSON.stringify(data), { status, headers });
}

/**
 * Create OPTIONS response for CORS preflight
 */
export function corsOptionsResponse(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(req),
  });
}
