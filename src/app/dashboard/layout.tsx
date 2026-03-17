import { getServerUser } from "@/lib/auth";
import { DashboardShell } from "./_components/DashboardShell";
import { ToastProvider } from "@/components/ui/Toast";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getServerUser();
    console.log(`[DashboardLayout Debug] User: ${user?.userId}, Type: ${user?.type}, Wedding: ${(user as any)?.weddingId}`);

    let weddingId = (user as any)?.weddingId;
    if (!weddingId && user?.userId) {
        const wedding = await prisma.wedding.findFirst({
            where: { userId: user.userId },
            select: { id: true }
        });
        weddingId = wedding?.id;
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
