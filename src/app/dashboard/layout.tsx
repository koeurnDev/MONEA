import { getServerUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "./_components/DashboardShell";
import { ToastProvider } from "@/components/ui/Toast";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getServerUser();
    if (!user) {
        redirect("/sign-in");
    }
    console.log(`[DashboardLayout Debug] User: ${user?.userId}, Type: ${user?.type}, Wedding: ${(user as any)?.weddingId}`);

    let weddingId = (user as any)?.weddingId;
    if (!weddingId && user?.userId) {
        try {
            const results = await (prisma as any).$queryRawUnsafe(
                'SELECT id FROM "Wedding" WHERE "userId" = $1 LIMIT 1',
                user.userId
            );
            weddingId = results[0]?.id;
        } catch (e) {
            console.error("[DashboardLayout] DB Fetch failed:", e);
        }
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
