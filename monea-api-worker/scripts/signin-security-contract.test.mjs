import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, "..");

function read(rel) {
    return readFileSync(join(repoRoot, rel), "utf8");
}

const signIn = read("auth_handlers/signin/handler.ts");
const forgotPassword = read("auth_handlers/forgot-password/handler.ts");
const resetPassword = read("auth_handlers/reset-password/handler.ts");
const staff = read("routers/staff.ts");
const rateLimit = read("lib/ratelimit.ts");
const loginFailureCounter = read("lib/login-failure-counter.ts");
const rateLimitKey = read("lib/rate-limit-key.ts");
const limitedJsonBody = read("lib/read-json-body-limited.ts");
const changePassword = read("auth_handlers/change-password/handler.ts");
const disableTwoFactor = read("auth_handlers/2fa/disable/handler.ts");
const verifyTwoFactor = read("auth_handlers/2fa/verify/handler.ts");
const signUp = read("auth_handlers/signup/handler.ts");
const profile = read("auth_handlers/me/handler.ts");
const profileRouter = read("routers/auth/me.ts");
const auth = read("lib/auth.ts");
const logout = read("auth_handlers/logout/handler.ts");
const tokenRevocation = read("lib/token-revocation.ts");

test("sign-in rejects requests when the IP blacklist cannot be checked", () => {
    assert.match(signIn, /IP blacklist check failed; rejecting sign-in/);
    assert.match(signIn, /IP blacklist check failed; rejecting sign-in\.[\s\S]*?status: 503/);
    assert.doesNotMatch(signIn, /IP check failed, continuing/);
});

test("session auth rejects non-session JWTs, mismatched audiences, and deleted users", () => {
    assert.match(auth, /payload\.type !== undefined \|\| payload\.purpose !== undefined/);
    assert.match(auth, /"twoFactorEnabled", "deletedAt" FROM "User"/);
    assert.match(auth, /if \(dbUser\.deletedAt\)[\s\S]*?return null/);
    assert.match(auth, /const expectedAudience = isStaffToken[\s\S]*?JWT_CONFIG\.AUDIENCE\.STAFF/);
    assert.match(auth, /currentRole === ROLES\.PLATFORM_OWNER \|\| currentRole === ROLES\.EVENT_MANAGER[\s\S]*?JWT_CONFIG\.AUDIENCE\.ADMIN/);
    assert.match(auth, /tokenAudiences\.includes\(expectedAudience\)/);
});

test("staff sessions require matching staff claims, audience, and live wedding assignment", () => {
    assert.match(auth, /payload\.role !== ROLES\.EVENT_STAFF/);
    assert.match(auth, /payload\.userId !== undefined\s*\|\|\s*payload\.id !== undefined/);
    assert.match(auth, /"weddingId" FROM "Staff" WHERE id = \$\{userId\}/);
    assert.match(auth, /isStaffToken && dbUser\.weddingId !== payload\.weddingId/);
    assert.match(auth, /if \(isStaffToken\) userType = "staff"/);
});

test("session tokens receive JTIs and revoked sessions are rejected", () => {
    assert.match(auth, /\.setJti\(crypto\.randomUUID\(\)\)/);
    assert.match(auth, /if \(await isTokenRevoked\(payload\.jti\)\)/);
    assert.match(tokenRevocation, /auth:revoked:/);
    assert.match(tokenRevocation, /isProductionEnvironment\(\)/);
});

test("logout revokes the presented session and clears every auth cookie", () => {
    assert.match(logout, /await revokePresentedSession\(request\)/);
    assert.match(logout, /status = 503/);
    assert.match(logout, /COOKIE_NAMES\.TOKEN/);
    assert.match(logout, /COOKIE_NAMES\.STAFF_TOKEN/);
    assert.match(logout, /COOKIE_NAMES\.REFRESH_TOKEN/);
    assert.match(logout, /COOKIE_NAMES\.OWNER_MFA_SETUP/);
});

test("sign-in bounds request bodies and validates input types before credential checks", () => {
    assert.match(signIn, /const MAX_SIGNIN_BODY_BYTES = 16_384/);
    assert.match(signIn, /readJsonBodyLimited\(req, MAX_SIGNIN_BODY_BYTES\)/);
    assert.match(signIn, /Request body is too large[\s\S]*?status: 413/);
    assert.match(limitedJsonBody, /function isRecord\(value: unknown\): value is Record<string, unknown>/);
    assert.match(signIn, /if \(!isRecord\(body\)\)/);
    assert.match(signIn, /typeof password !== "string"[\s\S]*?password\.length > 128/);
    assert.match(signIn, /typeof email !== "string"[\s\S]*?email\.length > 254/);
});

test("failed sign-ins are logged without storing full email addresses", () => {
    assert.match(signIn, /event: "LOGIN_FAILED"/);
    assert.match(signIn, /email: maskEmail\(normalizedEmail\)/);
    assert.match(signIn, /function maskEmail\(email: unknown\): string \| null/);
    assert.match(signIn, /email: maskEmail\(normalizedEmail\),/);
});

test("signup bounds streamed request bodies and validates CAPTCHA token types", () => {
    assert.match(signUp, /MAX_SIGNUP_BODY_BYTES = 16_384/);
    assert.match(signUp, /readJsonBodyLimited\(req, MAX_SIGNUP_BODY_BYTES\)/);
    assert.match(signUp, /parsedBody\.kind === "too_large"[\s\S]*?Request body is too large[\s\S]*?413/);
    assert.match(signUp, /!isRecord\(parsedBody\.value\)/);
    assert.match(signUp, /MAX_TURNSTILE_TOKEN_LENGTH = 2_048/);
    assert.match(signUp, /turnstileToken !== undefined[\s\S]*?typeof turnstileToken !== "string"[\s\S]*?turnstileToken\.length > MAX_TURNSTILE_TOKEN_LENGTH/);
});

test("authentication audit logs avoid storing full email addresses", () => {
    assert.doesNotMatch(resetPassword, /event: "PASSWORD_CHANGE_SUCCESS"[\s\S]{0,180}email,/);
    assert.doesNotMatch(changePassword, /event: "PASSWORD_CHANGE_(?:FAILED|SUCCESS)"[\s\S]{0,180}email:/);
    assert.doesNotMatch(disableTwoFactor, /event: "TWOFA_DISABLED"[\s\S]{0,120}email:/);
    assert.doesNotMatch(verifyTwoFactor, /event: "TWOFA_VERIFY_FAILED"[\s\S]{0,120}email:/);
    assert.doesNotMatch(signUp, /Registration attempt for existing email: \$\{normalizedEmail\}/);
});

test("password changes bound and validate input and fail closed on IP/account rate limits", () => {
    const bodyReadIndex = changePassword.indexOf("readJsonBodyLimited(req, MAX_CHANGE_PASSWORD_BODY_BYTES)");
    const ipLimitIndex = changePassword.indexOf('changePasswordLimiter.limitStrict(`ip:${ip}`)');
    const accountLimitIndex = changePassword.indexOf('changePasswordLimiter.limitStrict(`account:${accountKey}`)');
    const currentPasswordCheckIndex = changePassword.indexOf("CryptoUtils.compare(currentPassword, dbUser.password)");

    assert.match(rateLimit, /changePasswordLimiter = new ResilientRatelimit\([^,]+, 5, 10 \* 60 \* 1000\)/);
    assert.match(changePassword, /MAX_CHANGE_PASSWORD_BODY_BYTES = 2_048/);
    assert.ok(bodyReadIndex !== -1 && ipLimitIndex > bodyReadIndex && accountLimitIndex > bodyReadIndex);
    assert.ok(currentPasswordCheckIndex > accountLimitIndex);
    assert.match(changePassword, /typeof currentPassword !== "string"[\s\S]*?currentPassword\.length > 128/);
    assert.match(changePassword, /newPassword\.length < 8 \|\| newPassword\.length > 128/);
    assert.match(changePassword, /hashRateLimitKey\(`\$\{userRole\}:\$\{targetUserId\}`\)/);
    assert.match(changePassword, /Password change protection unavailable[\s\S]*?status: 503/);
    assert.match(changePassword, /Too many attempts[\s\S]*?status: 429/);
});

test("profile updates bound JSON, validate the object, and reject staff account mutation", () => {
    const staffGuardIndex = profile.indexOf('user.type === "staff"');
    const bodyReadIndex = profile.indexOf("readJsonBodyLimited(req, MAX_PROFILE_UPDATE_BODY_BYTES)");
    const userUpdateIndex = profile.indexOf("prisma.user.update({", bodyReadIndex);

    assert.match(profile, /MAX_PROFILE_UPDATE_BODY_BYTES = 8_192/);
    assert.match(profile, /parsedBody\.kind === "too_large"[\s\S]*?status|createCorsResponse\(\{ error: "Request body is too large" \}, 413/);
    assert.match(profile, /!isRecord\(parsedBody\.value\)/);
    assert.ok(staffGuardIndex !== -1 && bodyReadIndex > staffGuardIndex);
    assert.match(profile, /Profile updates are not available for staff accounts[\s\S]*?403/);
    assert.match(profile, /avatar\.length > 2048/);
    assert.ok(userUpdateIndex > bodyReadIndex);
});

test("Hono profile route applies the same bounded parsing and staff guard as its handler", () => {
    const staffGuardIndex = profileRouter.indexOf('user.type === "staff"');
    const bodyReadIndex = profileRouter.indexOf("readJsonBodyLimited(c.req.raw, MAX_PROFILE_UPDATE_BODY_BYTES)");
    const updateIndex = profileRouter.indexOf("db.update(users)", bodyReadIndex);

    assert.match(profileRouter, /MAX_PROFILE_UPDATE_BODY_BYTES = 8_192/);
    assert.match(profileRouter, /!isRecord\(parsedBody\.value\)/);
    assert.match(profileRouter, /Profile updates are not available for staff accounts[\s\S]*?403/);
    assert.ok(staffGuardIndex !== -1 && bodyReadIndex > staffGuardIndex);
    assert.match(profileRouter, /avatar\.length > 2048/);
    assert.ok(updateIndex > bodyReadIndex);
});

test("2FA verification bounds request size, validates TOTP, and atomically increments failures", () => {
    const tokenValidationIndex = verifyTwoFactor.indexOf('Token must be a six-digit code');
    const rateLimitIndex = verifyTwoFactor.indexOf('twoFactorVerifyIpLimiter.limitStrict(ip)');
    const databaseLookupIndex = verifyTwoFactor.indexOf('prisma.user.findUnique');

    assert.match(verifyTwoFactor, /MAX_TWO_FACTOR_VERIFY_BODY_BYTES = 1_024/);
    assert.match(verifyTwoFactor, /readJsonBodyLimited\(req, MAX_TWO_FACTOR_VERIFY_BODY_BYTES\)/);
    assert.match(verifyTwoFactor, /Token must be a six-digit code/);
    assert.match(rateLimit, /twoFactorVerifyIpLimiter = new ResilientRatelimit\([^,]+, 30, 10 \* 60 \* 1000\)/);
    assert.ok(rateLimitIndex > tokenValidationIndex && databaseLookupIndex > rateLimitIndex);
    assert.match(verifyTwoFactor, /Trusted client IP unavailable; rejecting verification/);
    assert.match(verifyTwoFactor, /2FA verification protection unavailable; rejecting request\.[\s\S]*?status: 503/);
    assert.match(verifyTwoFactor, /Too many verification attempts[\s\S]*?status: 429/);
    assert.match(verifyTwoFactor, /incrementLoginFailureCounter\(/);
    assert.match(verifyTwoFactor, /failedAttempts: expected/);
    assert.doesNotMatch(verifyTwoFactor, /const newAttempts = \(dbUser\.failedAttempts/);
});

test("2FA disable requires IP and account rate limits before password verification", () => {
    const ipLimitIndex = disableTwoFactor.indexOf('twoFactorDisableLimiter.limitStrict(`ip:${ip}`)');
    const accountLimitIndex = disableTwoFactor.indexOf("account:${await hashRateLimitKey");
    const bodyReadIndex = disableTwoFactor.indexOf("readJsonBodyLimited(req, MAX_TWO_FACTOR_DISABLE_BODY_BYTES)");
    const passwordCheckIndex = disableTwoFactor.indexOf("CryptoUtils.compare(password, dbUser.password)");

    assert.match(rateLimit, /twoFactorDisableLimiter = new ResilientRatelimit\([^,]+, 5, 10 \* 60 \* 1000\)/);
    assert.ok(ipLimitIndex !== -1 && accountLimitIndex > ipLimitIndex);
    assert.ok(bodyReadIndex > accountLimitIndex && passwordCheckIndex > bodyReadIndex);
    assert.match(disableTwoFactor, /hashRateLimitKey\(`\$\{user\.type\}:\$\{user\.userId\}`\)/);
    assert.match(disableTwoFactor, /This security action is temporarily unavailable[\s\S]*?status: 503/);
    assert.match(disableTwoFactor, /Too many attempts[\s\S]*?status: 429/);
    assert.match(disableTwoFactor, /password\.length > 128/);
});

test("blocked sign-ins are logged and Telegram alerts are rate limited", () => {
    assert.match(signIn, /event: "RATE_LIMIT_EXCEEDED"/);
    assert.match(signIn, /authRateLimitAlertLimiter\.limitStrict\(ip\)/);
    assert.match(signIn, /authRateLimitAlertGlobalLimiter\.limitStrict\("all"\)/);
    assert.match(signIn, /sendTelegramAlert\(/);
    assert.match(rateLimit, /authRateLimitAlertLimiter = new ResilientRatelimit\([^,]+, 1, 30 \* 60 \* 1000\)/);
    assert.match(rateLimit, /authRateLimitAlertGlobalLimiter = new ResilientRatelimit\([^,]+, 5, 10 \* 60 \* 1000\)/);
});

test("staff sign-in rejects unavailable client IP, blacklist, and distributed rate limiting", () => {
    assert.match(staff, /isProduction && ip === "unknown"/);
    assert.match(staff, /Staff sign-in IP blacklist check failed; rejecting request\.[\s\S]*?status|c\.json\(\{ error: "Sign-in is temporarily unavailable\. Please try again later\." \}, 503\)/);
    assert.match(staff, /Staff sign-in protection unavailable; rejecting request\./);
});

test("staff sign-in bounds streamed request bodies and validates credential types", () => {
    assert.match(staff, /const MAX_STAFF_LOGIN_BODY_BYTES = 16_384/);
    assert.match(staff, /readJsonBodyLimited\(c\.req\.raw, MAX_STAFF_LOGIN_BODY_BYTES\)/);
    assert.match(staff, /parsedBody\.kind === "too_large"[\s\S]*?Request body is too large[\s\S]*?413/);
    assert.match(staff, /email\.length > 254/);
    assert.match(staff, /password\.length > 128/);
    assert.match(staff, /pin\.length > 128/);
    assert.match(staff, /weddingCode\.length > 64/);
    assert.match(staff, /twoFactorToken\.length > 10/);
});

test("password reset endpoints share a bounded JSON reader and validate field sizes", () => {
    assert.match(limitedJsonBody, /export async function readJsonBodyLimited\(/);
    assert.match(limitedJsonBody, /size > maxBytes/);
    assert.match(forgotPassword, /readJsonBodyLimited\(req, MAX_FORGOT_PASSWORD_BODY_BYTES\)/);
    assert.match(forgotPassword, /inputEmail\.length > 254/);
    assert.match(resetPassword, /readJsonBodyLimited\(req, MAX_RESET_PASSWORD_BODY_BYTES\)/);
    assert.match(resetPassword, /token\.length > 512/);
    assert.match(resetPassword, /newPassword\.length > 128/);
});

test("staff sign-in cannot bypass enabled 2FA when its secret is missing", () => {
    assert.match(staff, /if \(staffMember\.twoFactorEnabled\) \{\s+if \(!staffMember\.twoFactorSecret\)/);
    assert.match(staff, /Two-factor authentication is misconfigured\. Please contact support\./);
});

test("staff MFA recovery codes are consumed atomically and only once", () => {
    assert.match(staff, /async function consumeStaffRecoveryCode\(/);
    assert.match(staff, /where: \{ id: staffId, twoFactorRecoveryCodes: storedCodes \}/);
    assert.match(staff, /return update\.count === 1/);
    assert.match(staff, /consumeStaffRecoveryCode\(\s+staffMember\.id,\s+staffMember\.twoFactorRecoveryCodes,\s+suppliedToken/);
    assert.doesNotMatch(staff, /twoFactorRecoveryCodes: JSON\.stringify\(updated\)/);
});

test("staff password and 2FA failures share lockout accounting and audit logging", () => {
    assert.match(staff, /async function recordStaffLoginFailure\(/);
    assert.match(staff, /event: "LOGIN_FAILED"/);
    assert.match(staff, /incrementLoginFailureCounter\(/);
    assert.match(staff, /recordStaffLoginFailure\(checkStaff, ip, c\.req\.raw\.headers\)/);
    assert.match(staff, /recordStaffLoginFailure\(staffMember, ip, c\.req\.raw\.headers\)/);
});

test("password and staff lockout updates use an atomic compare-and-set counter", () => {
    assert.match(signIn, /incrementLoginFailureCounter\(/);
    assert.match(staff, /incrementLoginFailureCounter\(/);
    assert.match(loginFailureCounter, /Could not update login failure counter after repeated concurrent changes/);
    assert.match(loginFailureCounter, /const LOCKOUT_THRESHOLD = 5/);
    assert.match(loginFailureCounter, /LOCKOUT_DURATION_MS = 15 \* 60 \* 1000/);
});

test("password reset token is consumed once atomically with password update", () => {
    const transactionStart = resetPassword.indexOf("prisma.$transaction(async (transaction)");
    const consumeIndex = resetPassword.indexOf("transaction.passwordResetToken.deleteMany", transactionStart);
    const passwordUpdateIndex = resetPassword.indexOf("transaction.user.update", transactionStart);
    const staffPasswordUpdateIndex = resetPassword.indexOf("transaction.staff.update", transactionStart);

    assert.notEqual(transactionStart, -1);
    assert.ok(consumeIndex > transactionStart);
    assert.ok(passwordUpdateIndex > consumeIndex);
    assert.ok(staffPasswordUpdateIndex > consumeIndex);
    assert.match(resetPassword, /expiresAt: \{ gt: now \}/);
    assert.match(resetPassword, /if \(consumedToken\.count !== 1\) return "invalid" as const/);
    assert.match(resetPassword, /transaction\.passwordResetToken\.deleteMany\(\{ where: \{ email \} \}\)/);
});

test("forgot-password requests are rate limited per HMAC email after CAPTCHA and eligible-account checks", () => {
    const emailLimitIndex = forgotPassword.indexOf("passwordResetEmailLimiter.limitStrict");
    const accountLookupIndex = forgotPassword.indexOf("prisma.user.findUnique");
    const captchaIndex = forgotPassword.indexOf("verifyTurnstile(");
    const telegramCheckIndex = forgotPassword.indexOf("if (!user.telegramId)");
    const tokenLookupIndex = forgotPassword.indexOf("prisma.passwordResetToken.findFirst");

    assert.match(forgotPassword, /passwordResetEmailLimiter\.limitStrict\(await hashRateLimitKey\(email\)\)/);
    assert.match(rateLimit, /passwordResetEmailLimiter = new ResilientRatelimit\([^,]+, 1, 2 \* 60 \* 1000\)/);
    assert.match(rateLimitKey, /hashPasswordResetToken\(value,\s*env\)/);
    assert.ok(captchaIndex !== -1 && emailLimitIndex > captchaIndex);
    assert.ok(accountLookupIndex !== -1 && telegramCheckIndex > accountLookupIndex);
    assert.ok(emailLimitIndex > telegramCheckIndex && tokenLookupIndex > emailLimitIndex);
    assert.match(forgotPassword, /if \(!emailLimit\.success\) \{\s+return Response\.json\(GENERIC_RESET_RESPONSE\)/);
});
