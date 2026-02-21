"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.7,
            easing: (t) => 1 - Math.pow(1 - t, 4),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.2,
            touchMultiplier: 2.0,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Initial scroll fix to prevent jumpy entrance
        window.scrollTo(0, 0);

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
