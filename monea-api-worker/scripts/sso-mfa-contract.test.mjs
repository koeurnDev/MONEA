import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');

function read(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

const signIn = read('auth_handlers/signin/handler.ts');
const googleCallback = read('auth_handlers/sso/callback/handler.ts');
const telegramCallback = read('auth_handlers/sso/telegram/handler.ts');
const auth = read('lib/auth.ts');
const setup = read('auth_handlers/2fa/setup/handler.ts');
const verify = read('auth_handlers/2fa/verify/handler.ts');
const rateLimit = read('lib/ratelimit.ts');
const setupRouter = read('routers/auth/2fa_setup.ts');
const telegramRouter = read('routers/auth/session.ts');
const meHandler = read('auth_handlers/me/handler.ts');
const meRouter = read('routers/auth/me.ts');

test('password login requires configured TOTP for users and staff with 2FA enabled', () => {
  assert.match(signIn, /if \(user\.twoFactorEnabled\) \{\s+const configuredSecret = user\.twoFactorSecret;\s+if \(!configuredSecret\)/);
  assert.match(signIn, /if \(staff\.twoFactorEnabled\) \{\s+const configuredSecret = staff\.twoFactorSecret;\s+if \(!configuredSecret\)/);
  assert.match(signIn, /authenticator\.check\(suppliedToken, secret\)/);
  assert.match(signIn, /consumeRecoveryCode\(/);
  assert.match(signIn, /twoFactorRecoveryCodes: expected/);
});

test('Google SSO checks 2FA state before issuing a session', () => {
  assert.match(googleCallback, /twoFactorEnabled:\s*true/);
  const guardIndex = googleCallback.indexOf('if (user?.twoFactorEnabled)');
  const sessionIndex = googleCallback.indexOf('signToken({ userId: user.id');
  assert.notEqual(guardIndex, -1, 'Expected Google SSO to reject enabled-2FA accounts');
  assert.ok(sessionIndex > guardIndex, 'Google SSO must reject before creating a session');
});

test('Telegram SSO checks 2FA state before issuing an exchange ticket', () => {
  assert.match(telegramCallback, /select: \{ id: true, email: true, role: true, deletedAt: true, twoFactorEnabled: true \}/);
  const guardIndex = telegramCallback.indexOf('if (user.twoFactorEnabled)');
  const sessionIndex = telegramCallback.indexOf('const sessionToken = await signToken');
  assert.notEqual(guardIndex, -1, 'Expected Telegram SSO to reject enabled-2FA accounts');
  assert.ok(sessionIndex > guardIndex, 'Telegram SSO must reject before creating a session');
  assert.match(telegramCallback, /"TWO_FACTOR_REQUIRED"/);
});

test('Platform Owner password login starts limited 2FA enrollment instead of issuing a session', () => {
  assert.match(
    signIn,
    /user\.role === ROLES\.PLATFORM_OWNER && !user\.twoFactorEnabled/
  );
  assert.match(auth, /purpose: "owner_mfa_setup"/);
  assert.match(signIn, /createOwnerMfaSetupCookies\(req, user\)/);
  assert.match(signIn, /requireOwnerMfaSetup: true/);
  assert.match(auth, /currentRole === ROLES\.PLATFORM_OWNER && !dbUser\.twoFactorEnabled/);
});

test('Owner 2FA enrollment is limited to the short-lived setup token and grants a session only after TOTP verification', () => {
  assert.match(auth, /OWNER_MFA_SETUP/);
  assert.match(auth, /payload\.purpose !== "owner_mfa_setup"/);
  assert.match(auth, /user\.role !== ROLES\.PLATFORM_OWNER \|\|\s+user\.twoFactorEnabled/);
  assert.match(setup, /getOwnerMfaSetupUser\(req\)/);
  assert.match(verify, /getOwnerMfaSetupUser\(req\)/);
  const validTotpIndex = verify.indexOf('if (isValid)');
  const sessionIndex = verify.indexOf('const sessionToken = await signToken');
  assert.ok(sessionIndex > validTotpIndex, 'Bootstrap must issue a session only after valid TOTP');
  assert.match(verify, /getCookieHeader\(COOKIE_NAMES\.OWNER_MFA_SETUP, "", req, 0\)/);
});

test('The profile endpoint distinguishes an owner MFA setup token from an unauthenticated request', () => {
  for (const source of [meHandler, meRouter]) {
    assert.match(source, /getOwnerMfaSetupUser/);
    assert.match(source, /OWNER_MFA_SETUP_REQUIRED/);
    assert.match(source, /Complete two-factor authentication setup to continue/);
    assert.match(source, /428/);
  }
});

test('2FA setup bounds requests and rate limits IP and account before password checks or secret generation', () => {
  const bodyReadIndex = setup.indexOf('readJsonBodyLimited(req, MAX_TWO_FACTOR_SETUP_BODY_BYTES)');
  const ipLimitIndex = setup.indexOf('twoFactorSetupLimiter.limitStrict(`ip:${ip}`, env)');
  const accountLimitIndex = setup.indexOf('twoFactorSetupLimiter.limitStrict(`account:${accountKey}`, env)');
  const passwordCheckIndex = setup.indexOf('CryptoUtils.compare(password, dbSecret)');
  const secretGenerationIndex = setup.indexOf('authenticator.generateSecret()');

  assert.match(rateLimit, /twoFactorSetupLimiter = new ResilientRatelimit\([^,]+, 5, 10 \* 60 \* 1000\)/);
  assert.ok(bodyReadIndex !== -1 && ipLimitIndex > bodyReadIndex && accountLimitIndex > bodyReadIndex);
  assert.ok(passwordCheckIndex > ipLimitIndex && secretGenerationIndex > passwordCheckIndex);
  assert.match(setup, /hashRateLimitKey\(`\$\{user\.type\}:\$\{user\.userId\}`, env\)/);
  assert.match(setup, /This security action is temporarily unavailable[\s\S]*?status: 503/);
  assert.match(setup, /Too many attempts[\s\S]*?status: 429/);
  assert.match(setup, /password\.length > 128/);
  assert.match(setup, /"Cache-Control": "no-store"/);
});

test('2FA setup passes Cloudflare environment bindings to its distributed limiter', () => {
  assert.match(setupRouter, /nextRoute\.POST\([\s\S]*c\.req\.raw,[\s\S]*isEnvironmentBindings\(c\.env\) \? c\.env : undefined/);
  assert.match(setup, /export async function POST\(req: Request, env\?: Record<string, unknown>\)/);
  assert.match(setup, /limitStrict\(`ip:\$\{ip\}`, env\)/);
  assert.match(setup, /limitStrict\(`account:\$\{accountKey\}`, env\)/);
  assert.match(setup, /hashRateLimitKey\(`\$\{user\.type\}:\$\{user\.userId\}`, env\)/);
  assert.match(rateLimit, /getRedis\(env\)/);
  assert.match(read('lib/password-reset-token.ts'), /getResetTokenPepper\(env\)/);
});

test('production rate limiting uses the native Upstash Redis client', () => {
  assert.match(rateLimit, /const \{ getRedis \} = await import\("\.\/redis"\)/);
  assert.match(rateLimit, /const redis = getRedis\(env\)/);
  assert.match(rateLimit, /redis,\s+limiter: Ratelimit\.slidingWindow/);
  assert.doesNotMatch(rateLimit, /const redis = \(await import\("\.\/redis"\)\)\.default/);
});

test('Google and Telegram SSO cannot bypass mandatory Platform Owner enrollment', () => {
  assert.match(googleCallback, /user\?\.role === ROLES\.PLATFORM_OWNER && !user\.twoFactorEnabled/);
  assert.match(googleCallback, /owner_mfa_setup_required/);
  assert.match(telegramCallback, /user\.role === ROLES\.PLATFORM_OWNER && !user\.twoFactorEnabled/);
  assert.match(telegramCallback, /ownerMfaSetupRequired: true/);
  assert.match(telegramCallback, /createOwnerMfaSetupCookies\(req, user\)/);
});

test('Telegram OIDC callback bounds input and validates the PKCE verifier before token exchange', () => {
  const bodyReadIndex = telegramCallback.indexOf('readJsonBodyLimited(req, MAX_TELEGRAM_CALLBACK_BODY_BYTES)');
  const challengeIndex = telegramCallback.indexOf('createCodeChallenge(verifier)', bodyReadIndex);
  const tokenExchangeIndex = telegramCallback.indexOf('fetch(TELEGRAM_TOKEN_URL', bodyReadIndex);

  assert.match(telegramCallback, /MAX_TELEGRAM_CALLBACK_BODY_BYTES = 4_096/);
  assert.match(telegramCallback, /!isRecord\(parsedBody\.value\)/);
  assert.match(telegramCallback, /MAX_TELEGRAM_AUTHORIZATION_CODE_LENGTH = 2_048/);
  assert.match(telegramCallback, /verifier !== "string" \|\| !\/\^\[A-Za-z0-9_-\]\{43\}\$\/\.test\(verifier\)/);
  assert.ok(bodyReadIndex !== -1 && challengeIndex > bodyReadIndex && tokenExchangeIndex > challengeIndex);
});

test('Session exchange rejects malformed and oversized request bodies before ticket verification', () => {
  const bodyReadIndex = telegramRouter.indexOf('readJsonBodyLimited(c.req.raw, MAX_SESSION_EXCHANGE_BODY_BYTES)');
  const ticketVerifyIndex = telegramRouter.indexOf('verifyExchangeTicket(code)');
  const exchangeTicket = read('lib/exchange-ticket.ts');

  assert.match(exchangeTicket, /\.setJti\(jti\)/);
  assert.match(exchangeTicket, /store\.set\([\s\S]*?\$\{EXCHANGE_TICKET_PREFIX\}\$\{jti\}[\s\S]*?nx: true/);
  assert.match(exchangeTicket, /store\.del\(`\$\{EXCHANGE_TICKET_PREFIX\}\$\{payload\.jti\}`\)/);
  assert.match(exchangeTicket, /exchangeTicketMemory\.delete\(payload\.jti\)/);
  assert.match(telegramRouter, /MAX_SESSION_EXCHANGE_BODY_BYTES = 4_096/);
  assert.match(telegramRouter, /MAX_SESSION_EXCHANGE_CODE_LENGTH = 3_072/);
  assert.match(telegramRouter, /parsedBody\.kind === 'too_large'[\s\S]*?413/);
  assert.match(telegramRouter, /parsedBody\.kind !== 'ok' \|\| !isRecord\(parsedBody\.value\)/);
  assert.match(telegramRouter, /ExchangeTicketStoreUnavailableError[\s\S]*?503/);
  assert.ok(bodyReadIndex !== -1 && ticketVerifyIndex > bodyReadIndex);
});
