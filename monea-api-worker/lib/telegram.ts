import { SECURITY_CONFIG } from "./config";

/**
 * Escapes unsafe HTML characters to prevent Telegram HTML Parse Errors & Injection.
 */
export const escapeHtml = (unsafe: string): string => {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Universal Environment Variable Extractor for Cloudflare Worker & Node.js
 */
function getEnvVar(key: string, env?: any): string {
  if (env && env[key]) return env[key];
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || "";
  }
  return "";
}

/**
 * Sends a security/audit alert to the configured Telegram chat.
 * Supported natively on Cloudflare Workers, Next.js Edge, and Node.js Runtimes.
 */
export const sendTelegramAlert = async (
  message: string,
  header: string = "🚨 <b>MONEA Security Alert</b> 🚨",
  env?: any
): Promise<void> => {
  // Feature Flag & Channel Validation
  if (!SECURITY_CONFIG?.enableAlerts || !SECURITY_CONFIG?.channels?.telegram) {
    return;
  }

  const token = getEnvVar("TELEGRAM_BOT_TOKEN", env);
  const chatId = getEnvVar("TELEGRAM_CHAT_ID", env);

  if (!token || !chatId || token === "your_bot_token_here") {
    console.warn("[Telegram Alert] Bot token or Chat ID not configured.");
    return;
  }

  try {
    const formattedText = `${header}\n\n${message}`;

    // AbortController for 5s request timeout on Edge network
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      console.error("[Telegram Alert Error]: Failed to send alert message:", result);
    }
  } catch (error: any) {
    // Non-blocking catch to ensure alert failures never disrupt primary request execution
    console.error("[Telegram Alert Exception]:", error?.message || error);
  }
};