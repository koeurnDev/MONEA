"use client";

import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { useTheme } from "next-themes";
import * as React from "react";

interface MoneaLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    variant?: "light" | "dark" | "system";
    performance?: boolean;
}

export function MoneaLogo({ className, showText = false, size = "md", variant = "system", performance = true }: MoneaLogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    // Determine the color based on variant or resolved system theme.
    const activeColor = variant === "dark"
        ? "text-white"
        : variant === "light"
            ? "text-black"
            : mounted && resolvedTheme === "dark"
                ? "text-white"
                : "text-black";

    return (
        <div className={cn("inline-flex items-center bg-transparent p-0 m-0 border-none shadow-none", className)}>
            {showText && (
                <m.span 
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                    "font-outfit font-black tracking-[0.2em] uppercase transition-all duration-300 cursor-default select-none",
                    activeColor,
                    size === "sm" ? "text-sm" : size === "md" ? "text-lg" : size === "xl" ? "text-4xl" : size === "2xl" ? "text-5xl" : "text-2xl"
                )}>
                    MONEA
                </m.span>
            )}
        </div>
    );
}
