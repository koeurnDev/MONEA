"use client";
import * as React from "react";
import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const mobile = window.innerWidth < 768 || (navigator.maxTouchPoints > 0);
        setIsMobile(mobile);
    }, []);

    const isDashboard = pathname?.startsWith("/dashboard");
    const duration = isDashboard ? 0.05 : 0.2;

    // To prevent hydration mismatch, the initial render on the client must match the server.
    // The server doesn't "know" if it's mobile or if it's mounted.
    // We default to no animation for the first pass and enable it only after mounting on non-mobile.
    const animationProps = (mounted && !isMobile) ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration, ease: "easeOut" as const }
    } : {
        initial: undefined,
        animate: undefined,
        exit: undefined
    };

    return (
        <AnimatePresence mode="wait">
            <m.div
                key={pathname}
                {...animationProps}
            >
                {children}
            </m.div>
        </AnimatePresence>
    );
}
