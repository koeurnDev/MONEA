export default function ScheduleLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-card border border-border flex items-center gap-6 animate-pulse">
                        <div className="w-14 h-14 rounded-2xl bg-muted" />
                        <div className="space-y-2 flex-1">
                            <div className="h-5 bg-muted rounded-lg w-1/3" />
                            <div className="h-3 bg-muted/60 rounded w-1/4" />
                        </div>
                        <div className="w-20 h-8 bg-muted/40 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
