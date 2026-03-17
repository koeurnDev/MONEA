export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { errorResponse } from "@/lib/api-utils";

// Legacy getAdminUser removed

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getServerUser();
    if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = params.id;

    try {
        let targetUser;
        try {
            targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    deletedAt: true,
                    twoFactorEnabled: true,
                    weddings: true
                }
            });
        } catch (e) {
            targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    twoFactorEnabled: true,
                    weddings: true
                }
            });
        }

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: targetUser });
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return errorResponse("Internal Server Error", 500, error.message);
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const user = await getServerUser();
    if (!user || (user.role !== ROLES.PLATFORM_OWNER && user.role !== ROLES.EVENT_MANAGER)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only PLATFORM_OWNER can modify users
    if (user.role !== ROLES.PLATFORM_OWNER) {
        return NextResponse.json({ error: "Forbidden: Only platform owners can manage users" }, { status: 403 });
    }

    const targetUserId = params.id;

    // Check if trying to edit themselves or another SUPERADMIN
    if (targetUserId === user.userId) {
        return NextResponse.json({ error: "Cannot modify your own active session from here" }, { status: 400 });
    }

    try {
        const body = await req.json();

        // Prevent editing superadmin role if it's the main seed user (optional extra protection)
        const currentTargetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (currentTargetUser?.role === ROLES.PLATFORM_OWNER && body.role !== undefined) {
            return NextResponse.json({ error: "Cannot change role of Platform Owners" }, { status: 400 });
        }

        const updateData: any = {};
        if (body.role && Object.values(ROLES).includes(body.role)) {
            updateData.role = body.role;
        }

        if (body.restore === true) {
            updateData.deletedAt = null;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
        }

        let updatedUser;
        try {
            updatedUser = await prisma.user.update({
                where: { id: targetUserId },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    role: true,
                }
            });
        } catch (e) {
            // Fallback for missing deletedAt field in Prisma Client using parameterized query
            if (updateData.deletedAt !== undefined) {
                const isRestoring = updateData.deletedAt === null;
                if (updateData.role) {
                    await (prisma as any).$executeRaw`UPDATE "User" SET "deletedAt" = ${isRestoring ? null : new Date()}, "role" = ${updateData.role} WHERE "id" = ${targetUserId}`;
                } else {
                    await (prisma as any).$executeRaw`UPDATE "User" SET "deletedAt" = ${isRestoring ? null : new Date()} WHERE "id" = ${targetUserId}`;
                }
            } else if (updateData.role) {
                await (prisma as any).$executeRaw`UPDATE "User" SET "role" = ${updateData.role} WHERE "id" = ${targetUserId}`;
            }
            
            updatedUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, email: true, role: true }
            });
        }

        return NextResponse.json({ data: updatedUser, message: "User updated successfully" });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return errorResponse("Internal Server Error", 500, error.message);
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const user = await getServerUser();
    if (!user || user.role !== ROLES.PLATFORM_OWNER) {
        return NextResponse.json({ error: "Unauthorized: Only Platform Owners can delete users" }, { status: 401 });
    }

    const targetUserId = params.id;

    if (targetUserId === user.userId) {
        return NextResponse.json({ error: "Cannot delete your own account from the admin panel" }, { status: 400 });
    }

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: { _count: { select: { weddings: true } } }
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Perform soft deletion
        try {
            await prisma.user.update({
                where: { id: targetUserId },
                data: { deletedAt: new Date() }
            });
        } catch (e) {
            // Fallback for missing deletedAt field in Prisma Client - Parameterized
            await (prisma as any).$executeRaw`UPDATE "User" SET "deletedAt" = ${new Date()} WHERE "id" = ${targetUserId}`;
        }

        return NextResponse.json({ success: true, message: "User account deactivated (Soft Delete) for 30 days." });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return errorResponse("Internal Server Error", 500, error.message);
    }
}
