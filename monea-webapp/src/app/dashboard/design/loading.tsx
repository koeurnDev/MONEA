import { Loader2 } from "lucide-react";

export default function DesignLoading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest font-kantumruy">
                កំពុងផ្ទុក...
            </p>
        </div>
    );
}
