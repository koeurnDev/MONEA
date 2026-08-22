import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./_components/DashboardShell";
import { ToastProvider } from "@/components/ui/Toast";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { prisma } from "@/lib/prisma";

async function getWeddingId(userId: string): Promise<string | undefined> {
    try {
        const results = await (prisma as any).$queryRawUnsafe(
            'SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1',
            userId
        );
        return results[0]?.id;
    } catch (e) {
        console.error("[DashboardLayout] DB Fetch failed:", e);
        return undefined;
    }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getServerUser();
    if (!user) {
        redirect("/sign-in");
    }

    let weddingId = (user as any)?.weddingId;
    if (!weddingId && user?.userId) {
        weddingId = await getWeddingId(user.userId);
    }

    const isStaff = user?.type === "staff";
    const isAdmin = user?.type === "admin";

    return (
        <ToastProvider>
            <NotificationProvider weddingId={weddingId}>
                <DashboardShell isStaff={isStaff} isAdmin={isAdmin} initialUser={user}>
                    {children}
                </DashboardShell>
            </NotificationProvider>
        </ToastProvider>
    );
}
