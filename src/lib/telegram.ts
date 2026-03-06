import "server-only";
// Used fire-and-forget fetch to avoid blocking the main server threads
const escapeHtml = (unsafe: string) => {
    return (unsafe || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const sendTelegramAlert = async (message: string, header: string = "🚨 <b>MONEA Security Alert</b> 🚨") => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId || token === "your_bot_token_here") {
        console.warn("[Telegram] Bot not configured or using placeholder token.");
        return;
    }

    try {
        const text = `${header}\n\n${message}`;
        console.log(`[Telegram] Sending to ${chatId} (HTML Mode)...`);

        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "HTML"
            })
        });

        const result = await response.json();
        if (!response.ok) {
            console.error("[Telegram] Failed to send message:", result);
        } else {
            console.log("[Telegram] Message sent successfully:", result.ok);
        }
    } catch (e) {
        console.error("[Telegram] Network error or exception:", e);
    }
};

export { escapeHtml };
