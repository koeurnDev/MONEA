import { SECURITY_CONFIG } from "./config";

/**
 * Universal Environment Variable / Secret Extractor
 * Supports Cloudflare Worker Bindings (env) & Node.js/Next.js (process.env)
 */
function extractEnvVar(name: string, env?: Record<string, any>): string | undefined {
  if (env && typeof env === "object" && env[name] !== undefined && env[name] !== "") {
    return env[name];
  }
  if (typeof process !== "undefined" && process.env && process.env[name] !== undefined && process.env[name] !== "") {
    return process.env[name];
  }
  return undefined;
}

/**
 * Synchronous Secrets Management Wrapper
 * Dynamic Secret Resolution supporting Edge & Vault integration
 */
export function getSecret(name: string, fallback?: string, env?: Record<string, any>): string {
  // Vault Integration Placeholder
  if ((SECURITY_CONFIG as any)?.useVault) {
    console.log(`[Secrets] Vault integration active. Resolving ${name}...`);
  }

  const value = extractEnvVar(name, env);

  if (value === undefined && fallback === undefined) {
    throw new Error(`[CRITICAL SECURITY RISK] Secret '${name}' is missing and no fallback provided.`);
  }

  return value ?? fallback ?? "";
}

/**
 * Predefined synchronous helpers for common MONEA secrets
 */
export const secrets = {
  /**
   * JWT signing secret.
   *
   * SECURITY: this used to fall back to the literal
   * "monea_fallback_jwt_secret_key_change_in_production", which is public source
   * code — anyone could forge tokens whenever JWT_SECRET was unset. Fail closed
   * instead of signing with a published key.
   */
  getJwtSecret: (env?: any): string => {
    const secret = getSecret("JWT_SECRET", undefined, env);
    if (secret.length < 32) {
      throw new Error(
        `[CRITICAL SECURITY RISK] JWT_SECRET must be at least 32 characters (got ${secret.length}).`
      );
    }
    return secret;
  },

  getEncryptionKey: (env?: any): string => {
    const key = getSecret("ENCRYPTION_KEY", undefined, env);
    if (key && key.length < 32) {
      console.warn("[SECURITY WARNING] ENCRYPTION_KEY length is less than 32 characters.");
    }
    return key;
  },

  getTelegramToken: (env?: any): string => {
    return getSecret("TELEGRAM_BOT_TOKEN", "", env);
  },

  getBakongToken: (env?: any): string => {
    return getSecret("BAKONG_API_TOKEN", "", env);
  },
};