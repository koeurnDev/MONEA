import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/constants";
import { Navigate } from "react-router-dom";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardPage() {
    const { user, isLoading: isUserLoading } = useAuth();

    // 1. Check user loading first to prevent premature rendering
    if (isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    // 2. Check role authorization immediately
    if (!user || (user.role !== ROLES.EVENT_MANAGER && user.role !== ROLES.PLATFORM_OWNER)) {
        return <Navigate to="/sign-in" replace />;
    }

    // 3. Only fetch data once user role is verified & authorized
    const { data: statsResponse, isLoading: isStatsLoading } = useSWR('/api/admin/stats', fetcher);
    const { data: logsResponse, isLoading: isLogsLoading } = useSWR('/api/admin/logs', fetcher);

    if (isStatsLoading || isLogsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    return (
        <AdminDashboardClient
            initialStats={statsResponse?.data || (statsResponse && !statsResponse.error ? statsResponse : {})}
            initialLogs={logsResponse?.data || (Array.isArray(logsResponse) ? logsResponse : [])}
            userRole={user.role}
        />
    );
}