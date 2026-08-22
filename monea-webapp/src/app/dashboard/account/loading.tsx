import { FormSkeleton } from "../_components/SkeletonComponents";

export default function AccountLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-muted animate-pulse" />
                <div className="space-y-2">
                    <div className="h-6 bg-muted rounded-lg w-40 animate-pulse" />
                    <div className="h-4 bg-muted/60 rounded w-28 animate-pulse" />
                </div>
            </div>
            <div className="bg-card p-8 md:p-12 rounded-[2.5rem] border border-border">
                <FormSkeleton />
            </div>
        </div>
    );
}
