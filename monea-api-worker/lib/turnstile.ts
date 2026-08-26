export interface TurnstileVerifyOptions {
  remoteip?: string;
  action?: string;
}

export interface TurnstileVerifyResult {
  success: boolean;
  action?: string;
  cdata?: string;
  errorCodes?: string[];
}

/**
 * Universal Environment Extractor for Cloudflare Worker & Node.js
 */
function getEnvVar(key: string, env?: any): string {
  if (env && env[key]) return env[key];
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || "";
  }
  return "";
}

/**
 * Verifies Cloudflare Turnstile CAPTCHA Token
 * Compatible natively with Cloudflare Workers, Hono, Next.js, and Node.js Runtimes.
 */
export async function verifyTurnstile(
  token: string,
  options?: TurnstileVerifyOptions,
  env?: any
): Promise<boolean> {
  const result = await verifyTurnstileDetailed(token, options, env);
  return result.success;
}

/**
 * Detailed Verification Helper returning exact status & error codes
 */
export async function verifyTurnstileDetailed(
  token: string,
  options?: TurnstileVerifyOptions,
  env?: any
): Promise<TurnstileVerifyResult> {
  const isDev =
    getEnvVar("NODE_ENV", env) === "development" ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"));

  // Bypass Turnstile checks seamlessly in local development if dummy token is supplied
  if (isDev && (token === "XXXX.DUMMY.TOKEN.XXXX" || token === "development_bypass")) {
    return { success: true, action: options?.action };
  }

  // Fallback to Cloudflare's dummy test secret key ONLY in local development mode
  const secretKey =
    getEnvVar("TURNSTILE_SECRET_KEY", env) ||
    getEnvVar("TURNSTILE_SECRET", env) ||
    (isDev ? "1x0000000000000000000000000000000AA" : "");

  if (!secretKey) {
    console.error("[Turnstile Error] TURNSTILE_SECRET_KEY is missing in production environment.");
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  if (!token || typeof token !== "string" || token.length > 2048) {
    console.warn("[Turnstile Warning] Invalid, empty, or oversized token string.");
    return { success: false, errorCodes: ["invalid-input-response"] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (options?.remoteip) {
      formData.append("remoteip", options.remoteip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[Turnstile Error] siteverify API HTTP status: ${res.status}`);
      return { success: false, errorCodes: [`http-status-${res.status}`] };
    }

    const data: {
      success: boolean;
      "error-codes"?: string[];
      action?: string;
      cdata?: string;
    } = await res.json();

    if (!data.success) {
      console.warn("[Turnstile Warning] Verification rejected by Cloudflare:", data["error-codes"]);
      return { success: false, errorCodes: data["error-codes"] };
    }

    // Optional action matching validation
    if (options?.action && data.action && data.action !== options.action) {
      console.warn(`[Turnstile Warning] Action mismatch: expected '${options.action}', got '${data.action}'`);
      return { success: false, errorCodes: ["action-mismatch"] };
    }

    return {
      success: true,
      action: data.action,
      cdata: data.cdata,
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Turnstile Exception] Verification request timed out after 10s.");
      return { success: false, errorCodes: ["request-timeout"] };
    }
    console.error("[Turnstile Exception] Unexpected verification failure:", error);
    return { success: false, errorCodes: ["internal-error"] };
  } finally {
    clearTimeout(timeout);
  }
}