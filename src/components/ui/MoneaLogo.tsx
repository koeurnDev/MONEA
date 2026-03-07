"use client";

import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface MoneaLogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    variant?: "light" | "dark" | "system";
    performance?: boolean;
}

export function MoneaLogo({ className, showText = false, size = "md", variant = "system", performance = true }: MoneaLogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Determine the color based on variant or resolved system theme
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
                <span className={cn(
                    "font-kantumruy font-extrabold tracking-widest uppercase transition-colors duration-300",
                    activeColor,
                    size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl"
                )}>
                    MONEA
                </span>
            )}
        </div>
    );
}
