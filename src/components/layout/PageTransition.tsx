"use client";
import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isDashboard = pathname?.startsWith("/dashboard");
    const duration = isDashboard ? 0.05 : 0.2;

    // Aggressive Performance: Disable animations on mobile/touch
    if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth < 768 || (navigator.maxTouchPoints > 0);
        if (isMobile) return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait">
            <m.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: "easeOut" }}
            >
                {children}
            </m.div>
        </AnimatePresence>
    );
}
