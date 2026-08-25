import * as React from "react";
import { AnimatePresence, m } from "framer-motion";
import { useLoading } from "@/components/providers/LoadingProvider";

export function LoadingBar() {
    const { isLoading } = useLoading();

    return (
        <AnimatePresence>
            {isLoading && (
                <div className="fixed top-0 left-0 right-0 z-[999999] h-[3px] pointer-events-none overflow-hidden bg-transparent">
                    <m.div
                        initial={{ x: "-100%", opacity: 1 }}
                        animate={{
                            x: ["-100%", "-20%", "0%"],
                            transition: {
                                duration: 1.5,
                                ease: [0.22, 1, 0.36, 1],
                                repeat: Infinity,
                                repeatType: "mirror"
                            }
                        }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        className="h-full w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(225,29,72,0.8)]"
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
