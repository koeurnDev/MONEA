/**
 * Security Configuration & Feature Flags
 */
export const SECURITY_CONFIG = {
  // Toggle for all security alerts
  enableAlerts: process.env.SECURITY_ALERTS_ENABLED === "true",

  // Channels for alerts
  channels: {
    telegram: process.env.ALERT_CHANNEL_TELEGRAM === "true",
    slack: process.env.ALERT_CHANNEL_SLACK === "true", // Placeholder for future
    email: process.env.ALERT_CHANNEL_EMAIL === "true", // Placeholder for future
  },

  // Thresholds and settings
  rateLimit: {
    alertThreshold: 0.8, // Alert if 80% of limit is reached (optional use case)
  },

  // Vault/Secrets configuration
  useVault: process.env.USE_VAULT === "true",
};
