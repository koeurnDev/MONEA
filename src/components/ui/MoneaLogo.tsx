"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { m } from "framer-motion";

interface MoneaLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "light" | "dark" | "system";
    performance?: boolean;
}

export function MoneaLogo({ className, showText = false, size = "md", variant = "system", performance = true }: MoneaLogoProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-24 h-24"
    };

    const logoSize = sizeClasses[size];

    return (
        <m.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn("flex items-center gap-4 group cursor-pointer", className)}
        >
            <m.div
                className={cn("relative flex items-center justify-center shrink-0", logoSize)}
            >
                {/* Visual Accent Ring */}
                <div className={cn(
                    "absolute inset-0 rounded-full border border-dashed transition-all duration-700 opacity-20 group-hover:opacity-40 group-hover:rotate-180",
                    variant === "dark" ? "border-white" : "border-slate-900"
                )} />

                {/* Main Logo Image */}
                <div className="relative w-full h-full p-1.5">
                    <img
                        src="/logo.png"
                        alt="MONEA"
                        className="w-full h-full object-contain drop-shadow-sm"
                    />
                </div>
            </m.div>

            {showText && (
                <div className="flex flex-col">
                    <span className={cn(
                        "font-kantumruy font-bold tracking-[0.3em] uppercase transition-colors duration-300",
                        variant === "dark" ? "text-white" : "text-slate-900",
                        size === "sm" ? "text-[10px]" : size === "md" ? "text-sm" : "text-lg"
                    )}>
                        MONEA
                    </span>
                    <span className={cn(
                        "text-[8px] tracking-[0.2em] font-medium opacity-50 uppercase",
                        variant === "dark" ? "text-white" : "text-slate-500",
                        size === "sm" ? "hidden" : "block"
                    )}>
                        Digital Experience
                    </span>
                </div>
            )}
        </m.div>
    );
}
