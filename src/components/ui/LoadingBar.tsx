"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { useLoading } from "@/components/providers/LoadingProvider";

export function LoadingBar() {
    const pathname = usePathname();
    const { isLoading: isGlobalLoading } = useLoading();
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, [pathname]);

    const active = isLoading || isGlobalLoading;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none">
            <AnimatePresence>
                {active && (
                    <m.div
                        initial={{ width: "0%", opacity: 1 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            width: { duration: 0.4, ease: "easeInOut" },
                            opacity: { duration: 0.2 }
                        }}
                        className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
