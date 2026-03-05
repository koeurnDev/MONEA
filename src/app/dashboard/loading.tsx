import { CardSkeleton, TableSkeleton } from "./_components/SkeletonComponents";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50">
                <TableSkeleton />
            </div>
        </div>
    );
}
