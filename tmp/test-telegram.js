const token = "8289587681:AAFLIUkaDdTN6yub83ezSctYpVNOR7ZCpyU";
const chatId = "7817470099";

async function testTelegram() {
    const header = "🎫 *MONEA Support Center* 🎫";
    const message = "*Ticket ID:* `test-123`\n*User:* `test@example.com`\n*Wedding:* `wedding-id`\n*Priority:* `NORMAL`\n*Subject:* `Test Subject`\n*Message:*\nThis is a test message with Khmer: សួស្តី";
    const text = `${header}\n\n${message}`;

    console.log(`Sending to ${chatId}...`);
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "Markdown"
            })
        });

        const result = await response.json();
        console.log("Response:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

testTelegram();
