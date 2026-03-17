export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export async function GET(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const weddingId = searchParams.get("weddingId");

        if (!weddingId) {
            return NextResponse.json({ error: "Wedding ID is required" }, { status: 400 });
        }

        // Verify ownership/access
        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true }
        });

        if (!wedding || (wedding.userId !== user.userId && user.role !== ROLES.PLATFORM_OWNER)) {
            return NextResponse.json({ error: "Unauthorized access to this wedding" }, { status: 403 });
        }

        const versions = await prisma.weddingTemplateVersion.findMany({
            where: { weddingId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(versions);
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { weddingId, versionName, description } = body;

        if (!weddingId || !versionName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const wedding = await prisma.wedding.findUnique({
            where: { id: weddingId },
            select: { userId: true, templateId: true, themeSettings: true }
        });

        if (!wedding || (wedding.userId !== user.userId && user.role !== ROLES.PLATFORM_OWNER)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const version = await prisma.weddingTemplateVersion.create({
            data: {
                weddingId,
                versionName,
                description,
                templateId: wedding.templateId,
                themeData: (wedding.themeSettings as any) || {},
                createdBy: user.name || user.userId
            }
        });

        return NextResponse.json(version);
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_POST]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
        }

        const version = await prisma.weddingTemplateVersion.findUnique({
            where: { id },
            include: { wedding: true }
        });

        if (!version) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        if (version.wedding.userId !== user.userId && user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.weddingTemplateVersion.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_DELETE]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
        }

        const version = await prisma.weddingTemplateVersion.findUnique({
            where: { id },
            include: { wedding: true }
        });

        if (!version) {
            return NextResponse.json({ error: "Version not found" }, { status: 404 });
        }

        if (version.wedding.userId !== user.userId && user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Perform the rollback
        await prisma.wedding.update({
            where: { id: version.weddingId },
            data: {
                templateId: version.templateId,
                themeSettings: version.themeData as any,
                updatedAt: new Date()
            }
        });

        // Log the rollback action if needed (optional, could use a separate governance log)

        return NextResponse.json({ success: true, templateId: version.templateId, themeSettings: version.themeData });
    } catch (error) {
        console.error("[TEMPLATE_VERSIONS_PATCH]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
