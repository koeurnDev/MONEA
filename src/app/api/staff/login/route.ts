import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, generateFingerprint } from "@/lib/auth";
import bcrypt from "bcryptjs";

const rateLimit = new Map<string, { count: number, lastAttempt: number }>();

export async function POST(req: Request) {
    try {
        // Rate Limiting (Simple In-Memory)
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        // Check Blacklist
        const isBlacklisted = await prisma.blacklistedIP.findUnique({ where: { ip } });
        if (isBlacklisted) {
            console.warn(`[Security] Blocked blacklisted IP from Staff Login: ${ip}`);
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const now = Date.now();
        const limit = rateLimit.get(ip);

        if (limit) {
            if (now - limit.lastAttempt < 60 * 1000) { // 1 Minute window
                if (limit.count >= 5) {
                    return NextResponse.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
                }
            } else {
                // Reset after 1 minute
                rateLimit.set(ip, { count: 0, lastAttempt: now });
            }
        }

        const body = await req.json();
        const { email, password, pin, weddingCode } = body;

        // Artificial Delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let staffMember = null;
        let isLocked = false;

        // PRE-CHECK: BRUTE FORCE PROTECTION & ACCESS WINDOW
        const checkStaff = await prisma.staff.findFirst({
            where: {
                OR: [
                    { email: email || "" },
                    { wedding: { weddingCode: (weddingCode || "").replace("#", "").toUpperCase() } }
                ]
            },
            include: { wedding: true }
        });

        if (checkStaff && checkStaff.wedding) {
            const weddingDate = new Date(checkStaff.wedding.date);
            const accessExpiry = new Date(weddingDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days after
            const accessStart = new Date(weddingDate.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days before

            if (new Date() > accessExpiry) {
                return NextResponse.json({ error: "ការចូលប្រើប្រាស់របស់អ្នកបានផុតកំណត់ហើយ (Wedding phase ended)" }, { status: 403 });
            }
            if (new Date() < accessStart) {
                return NextResponse.json({ error: "ការចូលប្រើប្រាស់មិនទាន់ត្រូវបានអនុញ្ញាតទេ (Wedding phase hasn't started)" }, { status: 403 });
            }
        }

        if (checkStaff && checkStaff.lockedUntil && checkStaff.lockedUntil > new Date()) {
            return NextResponse.json({
                error: `គណនីរបស់អ្នកត្រូវបានចាក់សោរបណ្តោះអាសន្ន។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។ (Locked until ${checkStaff.lockedUntil.toLocaleTimeString()})`
            }, { status: 423 });
        }

        // NEW: EMAIL + PASSWORD LOGIN
        if (email && password) {
            const staff = await prisma.staff.findUnique({
                where: { email },
                include: { wedding: true }
            });

            if (staff && staff.password) {
                const isValid = await bcrypt.compare(password, staff.password);
                if (isValid) {
                    staffMember = staff;
                }
            }
        }
        // LEGACY OR FALLBACK: PIN + WEDDING CODE
        else if (weddingCode && pin) {
            const cleanedCode = weddingCode.replace("#", "").toUpperCase();
            const wedding = await (prisma.wedding as any).findUnique({
                where: { weddingCode: cleanedCode },
                include: { staff: true }
            });

            if (wedding) {
                for (const s of (wedding as any).staff) {
                    try {
                        if (s.pin && await bcrypt.compare(pin, s.pin)) {
                            staffMember = s;
                            break;
                        }
                    } catch (e) {
                        console.error("PIN compare error", e);
                    }
                }
            }
        }

        if (!staffMember) {
            // Increment Failed Attempt (Persistent)
            if (checkStaff) {
                const newAttempts = checkStaff.failedAttempts + 1;
                const lockTime = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 mins lock

                await prisma.staff.update({
                    where: { id: checkStaff.id },
                    data: {
                        failedAttempts: newAttempts,
                        lockedUntil: lockTime
                    }
                });

                if (lockTime) {
                    return NextResponse.json({ error: "គណនីរបស់អ្នកត្រូវបានចាក់សោររយៈពេល ១៥ នាទី ដោយសារការបញ្ជាក់មិនត្រឹមត្រូវច្រើនដង។" }, { status: 423 });
                }
            }

            // In-Memory Rate Limit for unknown users
            const current = rateLimit.get(ip) || { count: 0, lastAttempt: now };
            rateLimit.set(ip, { count: current.count + 1, lastAttempt: now });

            return NextResponse.json({ error: "អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ" }, { status: 401 });
        }

        // Reset Rate Limit and Failed Attempts on Success
        rateLimit.delete(ip);
        await prisma.staff.update({
            where: { id: staffMember.id },
            data: { failedAttempts: 0, lockedUntil: null }
        });

        // Fingerprinting
        const fingerprint = generateFingerprint({ headers: req.headers, ip });

        // Create a special session token for staff
        const token = signToken({
            staffId: staffMember.id,
            weddingId: staffMember.weddingId,
            role: "STAFF",
            name: staffMember.name
        }, { fingerprint });

        const response = NextResponse.json({ success: true });
        response.cookies.set("staff_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 12, // 12 hours shift
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Staff Login Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
