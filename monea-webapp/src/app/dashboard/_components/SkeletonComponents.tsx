"use client";

import { cn } from "@/lib/utils";

export function TableSkeleton() {
    return (
        <div className="w-full space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-xl w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                    <div className="h-12 bg-muted/50 rounded-xl flex-1" />
                    <div className="h-12 bg-muted/50 rounded-xl flex-1" />
                    <div className="h-12 bg-muted/50 rounded-xl w-24" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-card p-6 rounded-[2rem] border border-border space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-muted rounded-2xl" />
                <div className="h-4 bg-muted rounded-full w-20" />
            </div>
            <div className="space-y-2">
                <div className="h-8 bg-muted rounded-lg w-3/4" />
                <div className="h-4 bg-muted rounded-full w-1/2" />
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-12 bg-muted/50 rounded-2xl w-full" />
                </div>
            ))}
            <div className="h-14 bg-muted rounded-2xl w-full mt-8" />
        </div>
    );
}
