/**
 * Helper to safely extract boolean environment flags across Cloudflare Workers & Node.js
 */
function getEnvFlag(key: string, env?: any, defaultValue: boolean = false): boolean {
  if (env && typeof env[key] !== "undefined") {
    return env[key] === "true" || env[key] === true;
  }
  if (typeof process !== "undefined" && process.env && typeof process.env[key] !== "undefined") {
    return process.env[key] === "true";
  }
  return defaultValue;
}

/**
 * Dynamic Security Configuration & Feature Flags
 * Compatible with Cloudflare Workers Edge Runtime & Node.js
 */
export const getSecurityConfig = (env?: any) => ({
  // Toggle for all security alerts
  enableAlerts: getEnvFlag("SECURITY_ALERTS_ENABLED", env, true),

  // Channels for alerts
  channels: {
    telegram: getEnvFlag("ALERT_CHANNEL_TELEGRAM", env, true),
    slack: getEnvFlag("ALERT_CHANNEL_SLACK", env, false),   // Placeholder for future
    email: getEnvFlag("ALERT_CHANNEL_EMAIL", env, false),   // Placeholder for future
  },

  // Thresholds and settings
  rateLimit: {
    alertThreshold: 0.8, // Alert if 80% of limit is reached
  },

  // Vault/Secrets configuration
  useVault: getEnvFlag("USE_VAULT", env, false),
});

/**
 * Static fallback for Node.js / non-worker utility files
 */
export const SECURITY_CONFIG = getSecurityConfig();