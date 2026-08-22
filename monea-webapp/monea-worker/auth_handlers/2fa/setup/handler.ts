export const dynamic = 'force-dynamic';
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode-svg";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { CryptoUtils } from "@/lib/crypto";

export async function POST(req: Request) {
    try {
        const user = await getServerUser(req);
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let password = "";
        try {
            const body = await req.json();
            password = body.password;
        } catch {
            return Response.json({ error: "Password verification required to setup 2FA" }, { status: 400 });
        }

        if (!password) return Response.json({ error: "Password is required" }, { status: 400 });

        // Security: Verify password before revealing secrets
        let dbSecret: string | null = null;
        if (user.type === "admin") {
            const u = await prisma.user.findUnique({ where: { id: user.userId }, select: { password: true } });
            dbSecret = u?.password ?? null;
        } else {
            const s = await prisma.staff.findUnique({ where: { id: user.userId }, select: { password: true } });
            dbSecret = s?.password ?? null;
        }

        if (!dbSecret || !(await CryptoUtils.compare(password, dbSecret))) {
            return Response.json({ error: "Invalid password" }, { status: 401 });
        }

        const secret    = authenticator.generateSecret();
        const otpauth   = authenticator.keyuri(user.email || user.name || "User", "MONEA", secret);

        // Generate QR as SVG (Web Crypto compatible — no Node canvas/Buffer needed)
        const qrSvg        = new QRCode({ content: otpauth, width: 200, height: 200, color: "#000000", background: "#ffffff", ecl: "M" });
        const qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(qrSvg.svg())}`;

        // Generate 10 recovery codes using Web Crypto (no Node crypto module)
        const plainRecoveryCodes = Array.from({ length: 10 }, () => {
            const buf = new Uint8Array(5);
            crypto.getRandomValues(buf);
            return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
        });

        // Hash recovery codes for storage
        const hashedCodes       = await Promise.all(plainRecoveryCodes.map(c => CryptoUtils.hash(c)));
        const recoveryCodesJson = JSON.stringify(hashedCodes);

        if (user.type === "admin") {
            await prisma.user.update({
                where: { id: user.userId },
                data: { twoFactorSecret: secret, twoFactorRecoveryCodes: recoveryCodesJson },
            });
        } else {
            await prisma.staff.update({
                where: { id: user.userId },
                data: { twoFactorSecret: secret, twoFactorRecoveryCodes: recoveryCodesJson },
            });
        }

        return Response.json({ secret, qrCodeDataUrl, recoveryCodes: plainRecoveryCodes });
    } catch (error: any) {
        console.error("[2FA Setup]", error);
        return Response.json({
            error:   "Internal Server Error",
            details: error?.message || String(error),
        }, { status: 500 });
    }
}
