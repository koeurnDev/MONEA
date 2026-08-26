import { createHash, randomBytes } from "crypto";

/**
 * Generate CSRF Token for session protection
 */
export function generateCSRFToken(sessionId: string, secret?: string): string {
  const tokenSecret = secret || process.env.CSRF_SECRET || "default-csrf-secret";
  const timestamp = Date.now().toString();
  const randomData = randomBytes(16).toString('hex');
  
  const payload = `${sessionId}:${timestamp}:${randomData}`;
  const hash = createHash('sha256').update(payload + tokenSecret).digest('hex');
  
  return Buffer.from(`${payload}:${hash}`).toString('base64');
}

/**
 * Validate CSRF Token
 */
export async function isValidCSRFToken(token: string | null, sessionId: string, env?: any): Promise<boolean> {
  if (!token) return false;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    if (parts.length !== 4) return false;
    
    const [tokenSessionId, timestamp, randomData, hash] = parts;
    
    // Verify session ID matches
    if (tokenSessionId !== sessionId) return false;
    
    // Check token age (max 24 hours)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (now - tokenTime > 24 * 60 * 60 * 1000) return false;
    
    // Verify hash
    const tokenSecret = env?.CSRF_SECRET || process.env.CSRF_SECRET || "default-csrf-secret";
    const payload = `${tokenSessionId}:${timestamp}:${randomData}`;
    const expectedHash = createHash('sha256').update(payload + tokenSecret).digest('hex');
    
    return hash === expectedHash;
  } catch (error) {
    console.error("[CSRF] Token validation error:", error);
    return false;
  }
}