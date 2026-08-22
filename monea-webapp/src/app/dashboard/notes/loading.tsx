export default function NotesLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-card border border-border space-y-4 animate-pulse">
                        <div className="h-5 bg-muted rounded-lg w-1/2" />
                        <div className="space-y-2">
                            <div className="h-3 bg-muted/60 rounded w-full" />
                            <div className="h-3 bg-muted/60 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
