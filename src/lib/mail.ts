import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, token: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const resetLink = `${appUrl}/reset-password?token=${token}`;
    
    let transporter;
    
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        console.warn("SMTP_HOST not found. Using Ethereal Email for local testing.");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"MONEA Support" <no-reply@monea.local>',
        to: email,
        subject: "Reset your MONEA password",
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
        `,
    });

    if (!process.env.SMTP_HOST) {
        console.log("\n========================================================");
        console.log("📩 TEST EMAIL SENT!");
        console.log("🔗 Click this preview link to view the email:");
        console.log(nodemailer.getTestMessageUrl(info));
        console.log("========================================================\n");
    }

    return info;
}
