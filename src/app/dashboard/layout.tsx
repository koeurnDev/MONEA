export const dynamic = 'force-dynamic';
import { cookies } from "next/headers";
import { DashboardShell } from "./_components/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // Server-Side Check for Staff Token (HttpOnly)
    const cookieStore = cookies();
    const staffToken = cookieStore.get("staff_token")?.value;
    const adminToken = cookieStore.get("token")?.value;

    const isStaff = !!staffToken && !adminToken;
    const isAdmin = !!adminToken;

    return (
        <DashboardShell isStaff={isStaff} isAdmin={isAdmin}>
            {children}
        </DashboardShell>
    )
}
