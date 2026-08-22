import { FormSkeleton } from "../_components/SkeletonComponents";

export default function SupportLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="space-y-3">
                <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
                <div className="h-4 bg-muted/60 rounded-full w-3/4 animate-pulse" />
            </div>
            <div className="bg-card p-8 md:p-12 rounded-[2.5rem] border border-border">
                <FormSkeleton />
            </div>
        </div>
    );
}
