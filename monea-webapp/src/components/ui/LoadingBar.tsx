import * as React from "react";
import { useLoading } from "@/components/providers/LoadingProvider";

/**
 * Top loading bar.
 *
 * Uses a pure CSS keyframe animation instead of framer-motion. `LoadingBar` is
 * mounted by `RootLayout`, i.e. on every route in the app, so pulling
 * framer-motion in here forced the whole animation library into the blocking
 * first-paint bundle for every visitor.
 */
export function LoadingBar() {
    const { isLoading } = useLoading();

    if (!isLoading) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[999999] h-[3px] pointer-events-none overflow-hidden bg-transparent"
            role="progressbar"
            aria-label="Loading"
        >
            <div className="monea-loading-bar h-full w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(225,29,72,0.8)]" />
        </div>
    );
}
