export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { SystemGovernance, GOVERNANCE_ACTIONS } from "@/lib/governance";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [history, logs, templateVersions, templateUsageRaw] = await Promise.all([
            SystemGovernance.getHistory(),
            SystemGovernance.getLogs(),
            prisma.weddingTemplateVersion.findMany({
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    wedding: {
                        select: { groomName: true, brideName: true, id: true }
                    }
                }
            }),
            prisma.wedding.groupBy({
                by: ['templateId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } }
            })
        ]);

        // Format template usage to be easier to consume
        const templateUsage = templateUsageRaw.map(item => ({
            templateId: item.templateId,
            count: item._count.id
        }));

        return NextResponse.json({ history, logs, templateVersions, templateUsage });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { versionName, description } = body;

        const snapshot = await SystemGovernance.createSnapshot(user.userId, versionName, description);

        // Log the publish action
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";
        await SystemGovernance.logAction(
            user.userId,
            (user as any).name || "Admin",
            GOVERNANCE_ACTIONS.PUBLISH,
            { versionName, versionId: snapshot.id },
            ip,
            userAgent
        );

        return NextResponse.json(snapshot);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getServerUser();
        if (!user || user.role !== ROLES.PLATFORM_OWNER) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { versionId } = body;

        const result = await SystemGovernance.rollback(versionId, user.userId, (user as any).name || "Admin");

        return NextResponse.json({ success: true, config: result });
    } catch (error) {
        console.error("Rollback API Error:", error);
        return NextResponse.json({ error: "Rollback failed" }, { status: 500 });
    }
}
