import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ROLES, Role } from "./constants";

const SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

export function signToken(payload: any, options: { fingerprint?: string } = {}) {
    const data = { ...payload };
    if (options.fingerprint) {
        data.fingerprint = options.fingerprint;
    }
    const token = jwt.sign(data, SECRET, { expiresIn: "7d" });
    return token;
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Generates a simple non-cryptographic hash for fingerprinting
 */
export function generateFingerprint(req: { headers: any, ip?: string }) {
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.ip || "unknown";
    // Simple string concatenation as a fingerprint
    return Buffer.from(`${userAgent}|${ip}`).toString('base64').substring(0, 32);
}

export type AuthUser = {
    userId: string;
    role: Role;
    email?: string;
    name?: string;
    weddingId?: string; // Present for Staff
    type: "admin" | "staff";
};

/**
 * Consolidates server-side user retrieval from cookies (Token or Staff Token)
 */
export async function getServerUser(): Promise<AuthUser | null> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const staffToken = cookieStore.get("staff_token")?.value;

    if (token) {
        const decoded = verifyToken(token) as any;
        if (decoded && typeof decoded === "object") {
            const userId = decoded.userId || decoded.sub || decoded.id;

            // SECURITY: Check Session Revocation
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { sessionsRevokedAt: true, role: true, email: true, name: true }
            });

            if (!user) return null;
            if (user.sessionsRevokedAt && decoded.iat * 1000 < user.sessionsRevokedAt.getTime()) {
                console.warn(`[Security] Admin session revoked for user: ${userId}`);
                return null;
            }

            const role = (user.role?.toUpperCase() || decoded.role?.toUpperCase() || ROLES.EVENT_MANAGER) as AuthUser["role"];
            return {
                userId,
                role,
                email: user.email,
                name: user.name || "Admin",
                type: "admin"
            };
        }
    }

    if (staffToken) {
        const decoded = verifyToken(staffToken) as any;
        if (decoded && typeof decoded === "object" && (decoded.staffId || decoded.weddingId)) {
            const staffId = decoded.staffId;
            const weddingId = decoded.weddingId;

            let staffName = "Staff";

            // SECURITY: Check Session Revocation for Staff
            if (staffId) {
                const staff = await prisma.staff.findUnique({
                    where: { id: staffId },
                    select: { sessionsRevokedAt: true, name: true }
                });

                if (!staff) return null;
                if (staff.sessionsRevokedAt && decoded.iat * 1000 < staff.sessionsRevokedAt.getTime()) {
                    console.warn(`[Security] Staff session revoked for staff: ${staffId}`);
                    return null;
                }
                staffName = staff.name || "Staff";
            }

            return {
                userId: staffId || weddingId,
                weddingId: weddingId,
                role: ROLES.EVENT_STAFF,
                name: staffName,
                type: "staff"
            };
        }
    }

    return null;
}
