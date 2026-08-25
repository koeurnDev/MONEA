export async function sendPasswordResetEmail(email: string, token: string) {
    const appUrl = process.env.VITE_APP_URL || "http://localhost:3001";
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    
    return await sendMail({
        to: email,
        subject: "Reset your MONEA password",
        text: `Reset link: ${resetLink}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password for your MONEA account.</p>
                <p>Click the button below to choose a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #f43f5e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p style="color: #888; font-size: 12px; margin-top: 40px;">This link will expire in 1 hour.</p>
            </div>
        `
    });
}

export async function sendMail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.log("\n========================================================");
        console.log("📩 MOCK EMAIL SENT (Edge Runtime Mode)");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("Note: Configure RESEND_API_KEY to send real emails on Cloudflare");
        console.log("========================================================\n");
        return { success: true, mock: true };
    }

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: process.env.SMTP_FROM || "onboarding@resend.dev",
                to: [to],
                subject: subject,
                text: text,
                html: html
            })
        });

        if (!response.ok) {
            console.error("[Email/Edge] Provider API Error", await response.text());
            return { success: false };
        }

        return await response.json();
    } catch (e) {
        console.error("[Email/Edge] Error:", e);
        return { success: false };
    }
}
