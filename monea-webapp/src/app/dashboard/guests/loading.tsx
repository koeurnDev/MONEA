import { TableSkeleton, CardSkeleton } from "../_components/SkeletonComponents";

export default function GuestsLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="bg-card p-6 md:p-8 rounded-[2.5rem] border border-border">
                <TableSkeleton />
            </div>
        </div>
    );
}
