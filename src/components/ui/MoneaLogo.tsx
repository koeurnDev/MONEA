import React from 'react';
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface MoneaLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "light" | "dark";
}

export function MoneaLogo({ className, showText = false, size = "md", variant = "dark" }: MoneaLogoProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-lg",
        md: "w-11 h-11 text-2xl",
        lg: "w-16 h-16 text-4xl",
        xl: "w-24 h-24 text-6xl"
    };

    const logoSize = sizeClasses[size];

    return (
        <div className={cn("flex items-center gap-3 group", className)}>
            <div className={cn("relative flex items-center justify-center shrink-0", logoSize)}>
                {/* Artistic Glass Layers */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br rounded-xl border backdrop-blur-md transition-all duration-700",
                    variant === "dark"
                        ? "from-white/20 to-white/5 border-white/30 rotate-12 group-hover:rotate-0"
                        : "from-slate-900/10 to-transparent border-slate-200 -rotate-12 group-hover:rotate-0"
                )} />

                <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr rounded-xl border transition-all duration-500",
                    variant === "dark"
                        ? "from-pink-500/20 via-rose-500/10 to-transparent border-white/10 -rotate-6 group-hover:rotate-0"
                        : "from-rose-500/10 via-pink-500/5 to-transparent border-slate-100 rotate-3 group-hover:rotate-0"
                )} />

                {/* The Artistic M - Using Overlapping Hearts concept or Script Font */}
                <div className="relative flex items-center justify-center">
                    <span className={cn(
                        "font-great-vibes font-normal leading-none drop-shadow-md group-hover:scale-110 transition-transform duration-500",
                        variant === "dark" ? "text-white" : "text-slate-900"
                    )}>
                        M
                    </span>

                    {/* Integrated Tiny Heart for MONEA Branding */}
                    <div className="absolute -top-1 -right-1 w-2 h-2">
                        <Heart size={8} className={cn(
                            "fill-pink-500 text-pink-500 animate-pulse-slow",
                            size === "sm" && "w-1.5 h-1.5"
                        )} />
                    </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/30 to-rose-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {showText && (
                <div className="flex flex-col">
                    <div className="flex items-baseline">
                        <span className={cn(
                            "font-kantumruy font-black tracking-[0.15em] uppercase",
                            variant === "dark" ? "text-white" : "text-slate-900",
                            size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl"
                        )}>
                            MONEA
                        </span>
                    </div>
                    <div className={cn(
                        "h-[1px] bg-gradient-to-r from-pink-500 to-transparent transition-all duration-1000",
                        "w-0 group-hover:w-full"
                    )} />
                </div>
            )}
        </div>
    );
}
