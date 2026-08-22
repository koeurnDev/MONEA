import { prisma, queryRaw } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { redirect } from "next/navigation";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
    const user = await getServerUser();
    if (!user || (user.role !== ROLES.EVENT_MANAGER && user.role !== ROLES.PLATFORM_OWNER)) {
        redirect("/sign-in");
    }

    // Parallel Server-Side Fetching
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    
    // Stats Fetching
    const statsPromise = (async () => {
        const [userResults, projectResults, activeResults, todayResults, giftResults] = await Promise.all([
            queryRaw('SELECT count(*) as count FROM "User"'),
            queryRaw('SELECT count(*) as count FROM "Wedding"'),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE status = \'ACTIVE\''),
            queryRaw('SELECT count(*) as count FROM "Wedding" WHERE "createdAt" >= $1', today),
            queryRaw('SELECT currency, SUM(amount) as amount FROM "Gift" GROUP BY currency')
        ]);

        const financialOverview = giftResults.reduce((acc: any, curr: any) => {
            acc[curr.currency] = Number(curr.amount || 0);
            return acc;
        }, { USD: 0, KHR: 0 });

        return {
            totalUsers: Number(userResults[0]?.count || 0),
            totalProjects: Number(projectResults[0]?.count || 0),
            activeProjects: Number(activeResults[0]?.count || 0),
            newProjectsToday: Number(todayResults[0]?.count || 0),
            financialOverview
        };
    })();

    // Logs Fetching
    const logsPromise = (async () => {
        if (user.role === ROLES.PLATFORM_OWNER) {
            // Platform owners see global logs
            return []; // Adjust if they should see specific logs on overview
        }

        const userProjects = await prisma.wedding.findMany({
            where: { userId: user.id },
            select: { id: true }
        });
        const projectIds = userProjects.map(w => w.id);

        return await prisma.log.findMany({
            where: { weddingId: { in: projectIds } },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
    })();

    const [stats, logs] = await Promise.all([statsPromise, logsPromise]);

    return (
        <AdminDashboardClient 
            initialStats={stats} 
            initialLogs={JSON.parse(JSON.stringify(logs))} 
            userRole={user.role} 
        />
    );
}
