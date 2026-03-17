"use client";
import * as React from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

    React.useEffect(() => {
        if (isDashboard) return;

        // Detection for touch devices to use native scroll
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 0);

        if (isMobile) {
            console.log("[Performance] Mobile/Touch detected - using native scroll");
            return;
        }

        let rafId: number;
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.1,
            touchMultiplier: 1.5,
            syncTouch: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [isDashboard]);

    return <>{children}</>;
}
