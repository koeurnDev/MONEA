export default function UpgradeLoading() {
    return (
        <div className="container max-w-7xl py-6 md:py-12 px-2 md:px-4 space-y-8 animate-in fade-in duration-200">
            <div className="text-center space-y-4 max-w-xl mx-auto">
                <div className="h-6 bg-muted rounded-full w-40 mx-auto animate-pulse" />
                <div className="h-10 bg-muted rounded-2xl w-3/4 mx-auto animate-pulse" />
                <div className="h-4 bg-muted/60 rounded-full w-1/2 mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-card border border-border space-y-6 animate-pulse">
                        <div className="flex justify-between items-center">
                            <div className="w-12 h-12 bg-muted rounded-2xl" />
                            <div className="h-8 bg-muted rounded-xl w-20" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-6 bg-muted rounded-lg w-1/2" />
                            <div className="h-4 bg-muted/60 rounded w-full" />
                        </div>
                        <div className="space-y-3 pt-4 border-t border-border">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="h-4 bg-muted/40 rounded w-5/6" />
                            ))}
                        </div>
                        <div className="h-14 bg-muted rounded-2xl w-full mt-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
