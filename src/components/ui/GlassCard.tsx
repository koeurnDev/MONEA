import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradient?: boolean;
}

export function GlassCard({ className, children, gradient, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border border-white/20 bg-white/60 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-black/40",
                gradient && "bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-black/20",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
