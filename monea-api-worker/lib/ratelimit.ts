/**
 * Fast in-memory Rate Limiter
 */
class MemoryLimiter {
  private cache = new Map<string, { count: number; reset: number }>();
  private readonly MAX_SIZE = 1000;

  async limit(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry || now > entry.reset) {
      this.cache.set(key, { count: 1, reset: now + windowMs });
      if (this.cache.size > this.MAX_SIZE) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) this.cache.delete(firstKey);
      }
      return { success: true, limit: max, remaining: max - 1, reset: Math.ceil((now + windowMs) / 1000) };
    }

    if (entry.count >= max) {
      return { success: false, limit: max, remaining: 0, reset: Math.ceil(entry.reset / 1000) };
    }

    entry.count++;
    return { success: true, limit: max, remaining: max - entry.count, reset: Math.ceil(entry.reset / 1000) };
  }
}

const memoryLimiter = new MemoryLimiter();
const rateLimitAlertCooldown = new Map<string, number>();

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type DistributedLimiter = {
  limit(key: string): Promise<RateLimitResult>;
};

type RateLimitEnvironment = Record<string, unknown>;

function getEnvironmentValue(key: string, env?: RateLimitEnvironment): string | undefined {
  const binding = env?.[key];
  return typeof binding === "string" ? binding : process.env[key];
}

function getRateLimitErrorSummary(error: unknown) {
  const summary: {
    name?: string;
    message?: string;
    status?: number;
    code?: string;
    causeName?: string;
    causeMessage?: string;
    causeStatus?: number;
    causeCode?: string;
  } = {};

  if (!(error instanceof Error)) {
    return { type: typeof error };
  }

  summary.name = error.name;
  summary.message = sanitizeRateLimitErrorMessage(error.message);
  const status = (error as Error & { status?: unknown; statusCode?: unknown }).status;
  const statusCode = (error as Error & { statusCode?: unknown }).statusCode;
  const code = (error as Error & { code?: unknown }).code;
  if (typeof status === "number") summary.status = status;
  else if (typeof statusCode === "number") summary.status = statusCode;
  if (typeof code === "string") summary.code = code;

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    summary.causeName = cause.name;
    summary.causeMessage = sanitizeRateLimitErrorMessage(cause.message);
    const causeStatus = (cause as Error & { status?: unknown; statusCode?: unknown }).status;
    const causeStatusCode = (cause as Error & { statusCode?: unknown }).statusCode;
    const causeErrorCode = (cause as Error & { code?: unknown }).code;
    if (typeof causeStatus === "number") summary.causeStatus = causeStatus;
    else if (typeof causeStatusCode === "number") summary.causeStatus = causeStatusCode;
    if (typeof causeErrorCode === "string") summary.causeCode = causeErrorCode;
  } else if (cause !== undefined && cause !== null) {
    summary.causeName = typeof cause;
  }

  return summary;
}

function sanitizeRateLimitErrorMessage(message: string): string {
  let sanitized = message.slice(0, 300);
  for (const secretName of ["UPSTASH_REDIS_REST_TOKEN", "SECURITY_PEPPER"]) {
    const secret = process.env[secretName];
    if (secret) sanitized = sanitized.split(secret).join("[redacted]");
  }
  return sanitized.replace(/https?:\/\/\S+/gi, "[redacted URL]");
}

function warnRateLimitExceeded(prefix: string, reset: number): void {
  const now = Date.now();
  const lastAlert = rateLimitAlertCooldown.get(prefix) || 0;
  if (now - lastAlert < 60_000) return;

  rateLimitAlertCooldown.set(prefix, now);
  if (rateLimitAlertCooldown.size > 100) {
    for (const [key, timestamp] of rateLimitAlertCooldown) {
      if (now - timestamp >= 60_000) rateLimitAlertCooldown.delete(key);
    }
  }
  console.warn("[Security] Rate limit threshold exceeded.", { scope: prefix, reset });
}

export class RateLimitUnavailableError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "RateLimitUnavailableError";
    if (cause !== undefined) {
      Object.defineProperty(this, "cause", { value: cause, configurable: true });
    }
  }
}

function isProductionEnvironment(env?: RateLimitEnvironment) {
  return getEnvironmentValue("NODE_ENV", env) === "production" ||
    getEnvironmentValue("ENVIRONMENT", env) === "production";
}

export class ResilientRatelimit {
  private redisLimiter: DistributedLimiter | null = null;
  private readonly prefix: string;
  private readonly max: number;
  private readonly windowMs: number;
  private readonly redisLimiterFactory?: (env?: RateLimitEnvironment) => Promise<DistributedLimiter | null>;

  constructor(
    prefix: string,
    max: number,
    windowMs: number,
    redisLimiterFactory?: (env?: RateLimitEnvironment) => Promise<DistributedLimiter | null>,
  ) {
    this.prefix = prefix;
    this.max = max;
    this.windowMs = windowMs;
    this.redisLimiterFactory = redisLimiterFactory;
  }

  private async getRedisLimiter(env?: RateLimitEnvironment) {
    if (this.redisLimiter) return this.redisLimiter;
    if (this.redisLimiterFactory) {
      this.redisLimiter = await this.redisLimiterFactory(env);
      return this.redisLimiter;
    }
    if (!isProductionEnvironment(env) || !getEnvironmentValue("UPSTASH_REDIS_REST_URL", env)) {
      return null;
    }
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { getRedis } = await import("./redis");
      const redis = getRedis(env);
      if (!redis) return null;
      this.redisLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(this.max, `${Math.ceil(this.windowMs / 1000)} s` as any),
        prefix: this.prefix
      });
      return this.redisLimiter;
    } catch (error) {
      console.error(
        `[RateLimit] ${this.prefix} limiter initialization failed.`,
        getRateLimitErrorSummary(error),
      );
      throw new RateLimitUnavailableError("Distributed rate limiting is unavailable.", error);
    }
  }

  async limit(key: string, env?: RateLimitEnvironment): Promise<RateLimitResult> {
    if (!isProductionEnvironment(env)) {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }

    try {
      return await this.limitStrict(key, env);
    } catch (error) {
      console.error(`[RateLimit] ${this.prefix} distributed protection failed; rejecting request.`, error);
      throw error instanceof RateLimitUnavailableError
        ? error
        : new RateLimitUnavailableError("Distributed rate limiting is unavailable.", error);
    }
  }

  async limitStrict(key: string, env?: RateLimitEnvironment): Promise<RateLimitResult> {
    if (!isProductionEnvironment(env)) {
      return await memoryLimiter.limit(key, this.max, this.windowMs);
    }

    if (
      !getEnvironmentValue("UPSTASH_REDIS_REST_URL", env) ||
      !getEnvironmentValue("UPSTASH_REDIS_REST_TOKEN", env)
    ) {
      throw new RateLimitUnavailableError("Distributed rate limiting is not configured.");
    }

    try {
      const limiter = await this.getRedisLimiter(env);
      if (!limiter) {
        throw new RateLimitUnavailableError("Distributed rate limiting is unavailable.");
      }
      const result = await limiter.limit(key);
      if (!result.success) warnRateLimitExceeded(this.prefix, result.reset);
      return result;
    } catch (error) {
      if (error instanceof RateLimitUnavailableError) throw error;
      console.error(
        `[RateLimit] ${this.prefix} request failed.`,
        getRateLimitErrorSummary(error),
      );
      throw new RateLimitUnavailableError("Distributed rate limiting is unavailable.", error);
    }
  }
}

export const authLimiter = new ResilientRatelimit("@monea/ratelimit/auth", 5, 10 * 60 * 1000);
export const authRateLimitAlertLimiter = new ResilientRatelimit("@monea/ratelimit/auth-alert", 1, 30 * 60 * 1000);
export const authRateLimitAlertGlobalLimiter = new ResilientRatelimit("@monea/ratelimit/auth-alert-global", 5, 10 * 60 * 1000);
export const passwordResetLimiter = new ResilientRatelimit("@monea/ratelimit/password-reset", 5, 10 * 60 * 1000);
export const passwordResetEmailLimiter = new ResilientRatelimit("@monea/ratelimit/password-reset-email", 1, 2 * 60 * 1000);
export const twoFactorDisableLimiter = new ResilientRatelimit("@monea/ratelimit/2fa-disable", 5, 10 * 60 * 1000);
export const twoFactorSetupLimiter = new ResilientRatelimit("@monea/ratelimit/2fa-setup", 5, 10 * 60 * 1000);
export const twoFactorVerifyIpLimiter = new ResilientRatelimit("@monea/ratelimit/2fa-verify-ip", 30, 10 * 60 * 1000);
export const changePasswordLimiter = new ResilientRatelimit("@monea/ratelimit/change-password", 5, 10 * 60 * 1000);
export const signupEmailLimiter = new ResilientRatelimit("@monea/ratelimit/signup-email", 3, 60 * 60 * 1000);
export const publicLimiter = new ResilientRatelimit("@monea/ratelimit/public", 10, 60 * 1000);
export const publicWeddingSeoLimiter = new ResilientRatelimit("@monea/ratelimit/public-wedding-seo", 120, 60 * 1000);
export const standardLimiter = new ResilientRatelimit("@monea/ratelimit/api", 100, 60 * 1000);

import { getIP } from "./utils.ts";
export { getIP };
