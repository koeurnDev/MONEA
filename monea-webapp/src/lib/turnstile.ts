export async function verifyTurnstile(
    token: string,
    options?: { remoteip?: string; action?: string }
): Promise<boolean> {
    const secretKey =
        process.env.TURNSTILE_SECRET_KEY ||
        process.env.TURNSTILE_SECRET ||
        "1x0000000000000000000000000000000AA";

    if (!token || typeof token !== "string" || token.length > 2048) {
        return false;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", token);
        if (options?.remoteip) {
            formData.append("remoteip", options.remoteip);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
                signal: controller.signal,
            }
        );
        clearTimeout(timeout);

        if (!res.ok) {
            console.error(`Turnstile siteverify HTTP error: ${res.status}`);
            return false;
        }

        const data = await res.json();
        if (!data.success) {
            console.warn("Turnstile verification rejected:", data["error-codes"]);
            return false;
        }

        if (options?.action && data.action && data.action !== options.action) {
            console.warn(`Turnstile action mismatch: expected ${options.action}, got ${data.action}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Turnstile verification error:", error);
        return false;
    }
}
