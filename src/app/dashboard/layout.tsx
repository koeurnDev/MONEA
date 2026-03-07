export const dynamic = 'force-dynamic';
import { getServerUser } from "@/lib/auth";
import { DashboardShell } from "./_components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getServerUser();

    const isStaff = user?.type === "staff";
    const isAdmin = user?.type === "admin";

    return (
        <DashboardShell isStaff={isStaff} isAdmin={isAdmin} initialUser={user}>
            {children}
        </DashboardShell>
    );
}
