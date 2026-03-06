export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
// const { authenticator } = require("otplib");
import qrcode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import crypto from "crypto";
import { CryptoUtils } from "@/lib/crypto";

export async function POST(req: Request) {
    const { authenticator } = await import("otplib") as any;
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { password } = body;

    if (!password) {
        return NextResponse.json({ error: "Password verification required to setup 2FA" }, { status: 400 });
    }

    // Security: Verify password before revealing secrets
    let dbSecret = null;
    if (user.type === "admin") {
        const u = await prisma.user.findUnique({ where: { id: user.userId }, select: { password: true } });
        dbSecret = u?.password;
    } else {
        const s = await prisma.staff.findUnique({ where: { id: user.userId }, select: { password: true } });
        dbSecret = s?.password;
    }

    if (!dbSecret || !(await CryptoUtils.compare(password, dbSecret))) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email || user.name || "User", "MONEA", secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);

    // Generate 10 Recovery Codes
    const plainRecoveryCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(5).toString('hex').toUpperCase() // 10 chars hex
    );

    // Hash them for storage
    const hashedCodes = await Promise.all(
        plainRecoveryCodes.map(code => CryptoUtils.hash(code))
    );
    const recoveryCodesJson = JSON.stringify(hashedCodes);

    if (user.type === "admin") {
        await prisma.user.update({
            where: { id: user.userId },
            data: {
                twoFactorSecret: secret,
                twoFactorRecoveryCodes: recoveryCodesJson
            }
        });
    } else {
        await prisma.staff.update({
            where: { id: user.userId },
            data: {
                twoFactorSecret: secret,
                twoFactorRecoveryCodes: recoveryCodesJson
            }
        });
    }

    return NextResponse.json({
        secret,
        qrCodeDataUrl,
        recoveryCodes: plainRecoveryCodes
    });
}
