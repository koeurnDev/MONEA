import { TableSkeleton } from "../_components/SkeletonComponents";

export default function StaffLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
                <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
                <div className="h-10 bg-muted rounded-xl w-32 animate-pulse" />
            </div>
            <div className="bg-card p-8 rounded-[2.5rem] border border-border">
                <TableSkeleton />
            </div>
        </div>
    );
}
