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

        // 1. Security Check: Verify password before revealing secrets
        let dbSecret: string | null = null;
        if (user.type === "admin") {
            const u = await prisma.user.findUnique({ where: { id: user.userId }, select: { password: true } });
            dbSecret = u?.password ?? null;
        } else {
            const s = await prisma.staff.findUnique({ where: { id: user.userId }, select: { password: true } });
            dbSecret = s?.password ?? null;
        }

        // Handle SSO accounts without password
        if (!dbSecret) {
            return Response.json({ 
                error: "Password verification unavailable for SSO accounts. Please set up an account password first." 
            }, { status: 400 });
        }

        if (!(await CryptoUtils.compare(password, dbSecret))) {
            return Response.json({ error: "Invalid password" }, { status: 401 });
        }

        // 2. Generate TOTP Secret
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email || user.name || "User", "MONEA", secret);

        // 3. Safe SVG Data URL Generation for Edge Runtime
        const qrSvg = new QRCode({ 
            content: otpauth, 
            width: 200, 
            height: 200, 
            color: "#000000", 
            background: "#ffffff", 
            ecl: "M" 
        });
        
        // Edge-safe SVG encoding without btoa unicode issues
        const svgContent = qrSvg.svg();
        const qrCodeDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

        // 4. Generate 10 recovery codes using Web Crypto API
        const plainRecoveryCodes = Array.from({ length: 10 }, () => {
            const buf = new Uint8Array(5);
            crypto.getRandomValues(buf);
            return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
        });

        // Hash recovery codes for secure storage
        const hashedCodes = await Promise.all(plainRecoveryCodes.map(c => CryptoUtils.hash(c)));
        const recoveryCodesJson = JSON.stringify(hashedCodes);

        // 5. Save pending 2FA secret (Keep twoFactorEnabled: false until OTP code is verified)
        if (user.type === "admin") {
            await prisma.user.update({
                where: { id: user.userId },
                data: { 
                    twoFactorSecret: secret, 
                    twoFactorRecoveryCodes: recoveryCodesJson,
                    twoFactorEnabled: false
                },
            });
        } else {
            await prisma.staff.update({
                where: { id: user.userId },
                data: { 
                    twoFactorSecret: secret, 
                    twoFactorRecoveryCodes: recoveryCodesJson,
                    twoFactorEnabled: false
                },
            });
        }

        return Response.json({ 
            secret, 
            qrCodeDataUrl, 
            recoveryCodes: plainRecoveryCodes 
        });

    } catch (error: any) {
        console.error("[2FA Setup Error]:", error);
        return Response.json({
            error: "Internal Server Error",
            details: error?.message || String(error),
        }, { status: 500 });
    }
}