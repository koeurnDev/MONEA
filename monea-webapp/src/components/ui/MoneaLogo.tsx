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
    const brandName = "MONEO";

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
        <div
            role={showText ? "img" : undefined}
            aria-label={showText ? brandName : undefined}
            className={cn("inline-flex shrink-0 items-center justify-center whitespace-nowrap border-none bg-transparent p-0 shadow-none", className)}
        >
            {showText && (
                <span className={cn(
                    "inline-flex items-center gap-1.5 leading-none",
                    size === "sm" ? "text-sm" : size === "md" ? "text-lg" : size === "xl" ? "text-4xl" : size === "2xl" ? "text-5xl" : "text-2xl"
                )}>
                    <m.span
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                            "cursor-default select-none whitespace-nowrap font-black transition-all duration-300",
                                "font-outfit uppercase tracking-[0.15em]",
                                activeColor
                        )}
                    >
                        {brandName}
                    </m.span>
                </span>
            )}
        </div>
    );
}
