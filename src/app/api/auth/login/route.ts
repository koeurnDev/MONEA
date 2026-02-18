export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, generateFingerprint } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Artificial Delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // IP for logging/fingerprinting
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        // Check Blacklist
        const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
        if (isBlacklisted) {
            console.warn(`[Security] Blocked blacklisted IP: ${ip}`);
            return NextResponse.json({ error: "ការចូលប្រើរបស់អ្នកត្រូវបានបិទជាបណ្តោះអាសន្ន។ (Access Denied)" }, { status: 403 });
        }

        // 1. Try to find USER (Owner)
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && user.lockedUntil && user.lockedUntil > new Date()) {
            return NextResponse.json({
                error: `គណនីរបស់អ្នកត្រូវបានចាក់សោរបណ្តោះអាសន្ន។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។ (Locked until ${user.lockedUntil.toLocaleTimeString()})`
            }, { status: 423 });
        }

        if (user) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                // Reset failed attempts
                await prisma.user.update({
                    where: { id: user.id },
                    data: { failedAttempts: 0, lockedUntil: null }
                });

                const role = user.role?.toUpperCase() || "ADMIN";
                const fingerprint = generateFingerprint({ headers: req.headers, ip });
                const token = signToken({ userId: user.id, email: user.email, role }, { fingerprint });

                const response = NextResponse.json({
                    success: true,
                    user: { id: user.id, email: user.email, role }
                });

                response.cookies.set("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                    path: "/",
                });

                return response;
            } else {
                // Increment failed attempts
                const newAttempts = user.failedAttempts + 1;
                const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
                await prisma.user.update({
                    where: { id: user.id },
                    data: { failedAttempts: newAttempts, lockedUntil: lockTime }
                });
            }
        }

        // 2. Try to find STAFF
        const staff = await prisma.staff.findUnique({
            where: { email },
            include: { wedding: true }
        });

        if (staff && staff.lockedUntil && staff.lockedUntil > new Date()) {
            return NextResponse.json({
                error: `គណនីរបស់អ្នកត្រូវបានចាក់សោរបណ្តោះអាសន្ន។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។ (Locked until ${staff.lockedUntil.toLocaleTimeString()})`
            }, { status: 423 });
        }

        if (staff && staff.password) {
            const isValid = await bcrypt.compare(password, staff.password);
            if (isValid) {
                // Reset failed attempts
                await prisma.staff.update({
                    where: { id: staff.id },
                    data: { failedAttempts: 0, lockedUntil: null }
                });

                const fingerprint = generateFingerprint({ headers: req.headers, ip });
                const token = signToken({
                    staffId: staff.id,
                    weddingId: staff.weddingId,
                    role: "STAFF",
                    name: staff.name
                }, { fingerprint });

                const response = NextResponse.json({
                    success: true,
                    user: { id: staff.id, email: staff.email, role: "STAFF" }
                });

                response.cookies.set("staff_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 60 * 12, // 12 hours
                    path: "/",
                });

                return response;
            } else {
                // Increment failed attempts
                const newAttempts = staff.failedAttempts + 1;
                const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
                await prisma.staff.update({
                    where: { id: staff.id },
                    data: { failedAttempts: newAttempts, lockedUntil: lockTime }
                });
            }
        }

        return NextResponse.json({ error: "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" }, { status: 401 });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
