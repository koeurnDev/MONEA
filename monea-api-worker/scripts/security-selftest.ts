/**
 * Temporary self-test for the CSRF primitives (generate → validate → tamper).
 * Run: npx tsx scripts/__csrf_selftest.ts
 */
import 'dotenv/config';
import { generateCSRFToken, isValidCSRFToken, resolveCsrfEnforcementMode } from '../lib/csrf';
import { ROLES } from '../lib/constants';

async function main() {
    process.env.CSRF_SECRET = 'selftest-secret-0123456789abcdef0123456789abcdef';

    const sessionId = 'user_abc123';
    const token = generateCSRFToken(sessionId);

    const valid = await isValidCSRFToken(token, sessionId);
    const wrongSession = await isValidCSRFToken(token, 'someone_else');
    const tampered = await isValidCSRFToken(token.slice(0, -2) + 'xy', sessionId);
    const missing = await isValidCSRFToken(null, sessionId);
    const anonToken = generateCSRFToken('anon_203.0.113.7');
    const anonValid = await isValidCSRFToken(anonToken, 'anon_203.0.113.7');

    // Guard semantics: an ordinary customer (EVENT_MANAGER === "ADMIN") must NOT
    // satisfy the platform-owner check used by the master API.
    const isPlatformOwnerOnly = (role: string) => role === ROLES.PLATFORM_OWNER;

    const checks: Array<[string, boolean]> = [
        ['valid session token accepted', valid === true],
        ['token rejected for a different session', wrongSession === false],
        ['tampered token rejected', tampered === false],
        ['missing token rejected', missing === false],
        ['anon-scoped token validates for its own scope', anonValid === true],
        ['EVENT_MANAGER ("ADMIN") is not a platform owner', isPlatformOwnerOnly(ROLES.EVENT_MANAGER) === false],
        ['PLATFORM_OWNER ("SUPERADMIN") is a platform owner', isPlatformOwnerOnly(ROLES.PLATFORM_OWNER) === true],
        ['enforcement defaults to enforce', resolveCsrfEnforcementMode() === 'enforce'],
    ];

    let failed = 0;
    for (const [label, ok] of checks) {
        console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
        if (!ok) failed++;
    }

    console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
    process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
    console.error('Self-test crashed:', error);
    process.exit(1);
});
