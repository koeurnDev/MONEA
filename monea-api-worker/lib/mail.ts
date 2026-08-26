export async function sendPasswordResetEmail(email: string, token: string) {
    const isLocal = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
    const appUrl = isLocal
        ? (process.env.VITE_APP_URL || "http://localhost:3001")
        : (process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || "https://monea-webapp.pages.dev");
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    
    return await sendMail({
        to: email,
        subject: "Reset your MONEA password | កំណត់ពាក្យសម្ងាត់ MONEA ឡើងវិញ",
        text: `Reset link: ${resetLink}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #e11d48; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">MONEA</h1>
                    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Wedding & Event Platform</p>
                </div>
                <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Password Reset Request / ស្នើសុំកំណត់ពាក្យសម្ងាត់ឡើងវិញ</h2>
                <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                    យើងបានទទួលសំណើសុំកំណត់ពាក្យសម្ងាត់គណនី MONEA របស់អ្នកឡើងវិញ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីជ្រើសរើសពាក្យសម្ងាត់ថ្មី៖
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetLink}" style="background-color: #e11d48; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(225,29,72,0.3);">Reset Password / កំណត់ពាក្យសម្ងាត់</a>
                </div>
                <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                    ឬចម្លងតំណភ្ជាប់ (Link) នេះដាក់ចូលក្នុង Browser របស់អ្នក៖<br/>
                    <a href="${resetLink}" style="color: #e11d48; word-break: break-all;">${resetLink}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    ⚠️ តំណភ្ជាប់នេះនឹងផុតកំណត់ក្នុងរយៈពេល ១ ម៉ោង។ ប្រសិនបើអ្នកមិនបានស្នើសុំទេ សូមព្រងើយកន្តើយចំពោះសារនេះ។
                </p>
            </div>
        `
    });
}

export async function sendMail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
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
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM || "MONEA <onboarding@resend.dev>",
                to: [to],
                subject: subject,
                text: text,
                html: html
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("[Email/Resend] API Error:", response.status, errBody);
            return { success: false, error: errBody };
        }

        const data = await response.json();
        console.log("[Email/Resend] Email sent successfully:", data);
        return { success: true, ...data };
    } catch (e: any) {
        console.error("[Email/Resend] Exception:", e.message);
        return { success: false, error: e.message };
    }
}

