import { SECURITY_CONFIG } from "./config";

/**
 * Secrets Management Wrapper
 * 
 * Provides an abstraction layer for fetching secrets. Currently pulls from process.env,
 * but can be easily extended to integrate with HashiCorp Vault or AWS Secrets Manager.
 */
export async function getSecret(name: string, fallback?: string): Promise<string> {
  // If Vault is enabled, we could fetch from Vault API here
  if (SECURITY_CONFIG.useVault) {
    // Example: return await vault.get(name);
    console.log(`[Secrets] Vault integration active. Fetching ${name}...`);
  }

  const value = process.env[name];
  
  if (!value && fallback === undefined) {
    throw new Error(`[CRITICAL] Secret ${name} is missing and no fallback provided.`);
  }

  return value || fallback || "";
}

/**
 * Predefined helpers for common secrets
 */
export const secrets = {
  getJwtSecret: () => getSecret("JWT_SECRET"),
  getEncryptionKey: () => getSecret("ENCRYPTION_KEY"),
  getTelegramToken: () => getSecret("TELEGRAM_BOT_TOKEN", "your_bot_token_here"),
};
