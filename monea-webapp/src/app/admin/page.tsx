import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/constants";
import { Navigate } from "react-router-dom";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardPage() {
    const { user, isLoading: isUserLoading } = useAuth();
    
    const { data: statsResponse, isLoading: isStatsLoading } = useSWR(user ? '/api/admin/stats' : null, fetcher);
    const { data: logsResponse, isLoading: isLogsLoading } = useSWR(user ? '/api/admin/logs' : null, fetcher);

    if (isUserLoading || isStatsLoading || isLogsLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    if (!user || (user.role !== ROLES.EVENT_MANAGER && user.role !== ROLES.PLATFORM_OWNER)) {
        return <Navigate to="/sign-in" replace />;
    }

    return (
        <AdminDashboardClient 
            initialStats={statsResponse?.data || {}} 
            initialLogs={logsResponse?.data || []} 
            userRole={user.role} 
        />
    );
}
