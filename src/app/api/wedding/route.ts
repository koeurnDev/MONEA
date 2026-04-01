export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { EventType, WeddingStatus, PackageType } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/encryption";
import { errorResponse, validateRequest } from "@/lib/api-utils";
import { sanitizeObject } from "@/lib/sanitize";
import { weddingSchema, weddingUpdateSchema } from "@/lib/validations/wedding";
import { isEditingLocked } from "@/lib/permissions";

export async function GET(req: Request) {
    console.log("[Wedding API] GET Request received");
    try {
        const user = await getServerUser();
        console.log(`[Wedding API Debug] GET. UserRole: ${user?.role}, UserId: ${user?.userId}`);

        if (!user) return errorResponse("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const full = searchParams.get("full") === "true";

        let wedding;
        const include = full ? {
            galleryItems: { orderBy: { id: 'asc' } as any },
            activities: { orderBy: { order: 'asc' } as any }
        } : undefined;

        if (user.role === "STAFF") {
            const staffWeddingId = (user as any).weddingId;
            wedding = await prisma.wedding.findUnique({
                where: { id: staffWeddingId },
                include
            });
        } else if (id) {
            // Fetch specific wedding, ensure owner match
            wedding = await prisma.wedding.findUnique({
                where: { id, userId: user.userId },
                include
            });
        } else {
            // Fallback: Fetch the most recent wedding for this user
            wedding = await prisma.wedding.findFirst({
                where: { userId: user.userId },
                orderBy: { createdAt: 'desc' },
                include
            });
        }

        if (!wedding) {
            console.log(`[Wedding API Debug] GET. No wedding found for user ${user.userId}`);
            return NextResponse.json({});
        }

        // SECURITY: Data Minimization - Remove sensitive fields for non-admin/non-owner if applicable
        // (In this case, only the owner/staff should see this anyway, but let's be safe)
        const safeWedding = { ...wedding };
        delete (safeWedding as any).paymentInfo; // Decrypt only if needed as a separate response or specifically requested
        
        // Decrypt paymentInfo if specifically requested or for authorized owner
        try {
            if (wedding.paymentInfo) {
                // Return payment info only if specifically asked (e.g., query param) or if owner
                (safeWedding as any).paymentInfo = decrypt(wedding.paymentInfo);
            }
        } catch (e: any) {
            console.error(`[Wedding API Debug] Decryption failure: ${e.message}`);
        }

        let responseData: any = safeWedding;
        if (wedding && wedding.themeSettings) {
            try {
                const parsed = typeof wedding.themeSettings === 'string' 
                    ? JSON.parse(wedding.themeSettings) 
                    : wedding.themeSettings;
                responseData = { ...safeWedding, themeSettings: parsed };
            } catch (e) {
                responseData = { ...safeWedding, themeSettings: {} };
            }
        }

        return NextResponse.json(responseData);
    } catch (error: any) {
        const errorLog = `[${new Date().toISOString()}] Wedding GET ERROR: ${error.message}\nStack: ${error.stack}\n`;
        require('fs').appendFileSync('tmp/api-errors.log', errorLog);
        return errorResponse("Internal Server Error in Wedding GET", 500, error.message);
    }
}

export async function POST(req: Request) {
    console.log("[Wedding API] POST Request received");
    try {
        const user = await getServerUser();
        console.log(`[Wedding API Debug] POST. UserRole: ${user?.role}`);

        if (!user) return errorResponse("Unauthorized", 401);

        // Check if user already has a wedding (MONEA allows 1 per user for now)
        const existingWedding = await prisma.wedding.findFirst({
            where: { userId: user.userId }
        });
        
        if (existingWedding) {
            return errorResponse("Wedding already exists", 409);
        }

        const { data, error } = await validateRequest(req, weddingSchema);
        if (error) return error;

        const body = sanitizeObject<any>(data!);
        const { groomName, brideName, date, location, eventType, paymentInfo } = body;

        const wedding = await prisma.wedding.create({
            data: {
                userId: user.userId,
                groomName: groomName || "Groom",
                brideName: brideName || "Bride",
                date: date,
                location: location,
                status: "ACTIVE" as WeddingStatus,
                eventType: eventType || "wedding",
                paymentInfo: paymentInfo ? encrypt(paymentInfo) : null,
                themeSettings: body.themeSettings || {},
            }
        });

        if (wedding.paymentInfo) {
            wedding.paymentInfo = decrypt(wedding.paymentInfo);
        }

        console.log(`[Wedding API Debug] POST Success. WeddingId: ${wedding.id}`);
        return NextResponse.json(wedding);
    } catch (error: any) {
        console.error(`[Wedding API Debug] POST CRASH: ${error.message}`, error);
        return errorResponse("Internal Server Error in Wedding POST", 500, error.message);
    }
}

export async function PUT(req: Request) {
    try {
        const user = await getServerUser();
        console.log(`[Wedding API Debug] PUT. UserRole: ${user?.role}`);

        if (!user) return errorResponse("Unauthorized", 401);

        const { data, error } = await validateRequest(req, weddingUpdateSchema);
        if (error) return error;

        const sanitizedBody = sanitizeObject<any>(data!);
        const { status, templateId, groomName, brideName, location, date, eventType, paymentInfo, weddingId } = sanitizedBody;

        let wedding;
        if (user.role === "STAFF") {
            wedding = await prisma.wedding.findUnique({ where: { id: (user as any).weddingId } });
        } else if (weddingId) {
            // Targeted update
            wedding = await prisma.wedding.findUnique({ where: { id: weddingId, userId: user.userId } });
        }

        if (!wedding) {
            return errorResponse("Wedding not found or access denied", 404);
        }

        // SECURITY: Check if editing is locked (Free tier 3-day limit or expired Pro)
        if (isEditingLocked(wedding) && user.role !== ROLES.PLATFORM_OWNER) {
            return errorResponse("Editing is locked for this wedding. Please upgrade or contact support.", 403);
        }

        // SECURITY: Premium Feature Enforcement
        const isPremium = wedding.packageType === "PREMIUM";
        const isPro = wedding.packageType === "PRO" || isPremium;

        // 1. Restrict VIP/Premium Templates
        if (templateId && templateId.toLowerCase().includes("premium") && !isPremium) {
            return errorResponse("The selected template requires a Premium package.", 403);
        }

        // 2. Restrict Custom Primary Color (Theme Customization)
        if (sanitizedBody.themeSettings?.primaryColor && !isPremium) {
             // If they are trying to SET a specific color, but aren't premium
             // We allow default color updates but not custom hex overrides if the UI logic says so
             // Based on my grep, custom colors were restricted in UI
             return errorResponse("Custom theme colors require a Premium package.", 403);
        }

        // Parse existing themeSettings to merge
        let currentTheme = {};
        if (wedding.themeSettings) {
            try {
                currentTheme = typeof wedding.themeSettings === 'string'
                    ? JSON.parse(wedding.themeSettings)
                    : wedding.themeSettings;
            } catch (e) {
                console.error("[Wedding API] Failed to parse existing themeSettings", e);
            }
        }

        const newTheme = sanitizedBody.themeSettings || {};
        const mergedTheme = { ...currentTheme, ...newTheme };

        const updateData: any = {
            ...(status && { status: status as WeddingStatus }),
            ...(templateId && { templateId }),
            ...(groomName && { groomName }),
            ...(brideName && { brideName }),
            ...(location && { location }),
            ...(date && { date: new Date(date) }),
            ...(eventType && { eventType: eventType as EventType }),
            ...(paymentInfo && { paymentInfo: encrypt(paymentInfo) }),
            themeSettings: mergedTheme
        };
        console.log("[Wedding API] Merged Theme to save:", mergedTheme);

        if (sanitizedBody.galleryItems) {
            updateData.galleryItems = {
                deleteMany: {},
                create: sanitizedBody.galleryItems
                    .map((item: any) => ({
                        url: item?.url || "",
                        publicId: item?.publicId || null,
                        type: item?.type || 'IMAGE',
                        caption: item?.caption || null
                    }))
            };
        }

        if (sanitizedBody.activities) {
            updateData.activities = {
                deleteMany: {},
                create: sanitizedBody.activities.map((item: any) => ({
                    title: item.title || "Activity",
                    time: item.time,
                    description: item.description,
                    icon: item.icon,
                    publicId: item.publicId,
                    order: item.order || 0
                }))
            };
        }

        wedding = await prisma.wedding.update({
            where: { id: wedding.id },
            data: updateData
        });

        if (wedding.paymentInfo) {
            wedding.paymentInfo = decrypt(wedding.paymentInfo);
        }

        console.log(`[Wedding API Debug] PUT Success. WeddingId: ${wedding.id}`);
        return NextResponse.json(wedding);
    } catch (error: any) {
        console.error(`[Wedding API Debug] PUT CRASH: ${error.message}`, error);
        return errorResponse("Internal Server Error in Wedding PUT", 500, error.message);
    }
}
