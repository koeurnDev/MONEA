export async function verifyTurnstile(token: string) {
    const secretKey = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";
    if (!secretKey) {
        console.error("TURNSTILE_SECRET_KEY is missing in environment variables");
        return false;
    }

    try {
        const res = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                }),
            }
        );

        const data = await res.json();
        return data.success;
    } catch (error) {
        console.error("Turnstile verification error:", error);
        return false;
    }
}
