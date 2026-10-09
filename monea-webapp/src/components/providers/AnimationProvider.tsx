import * as React from "react";

import { LazyMotion, domAnimation } from "framer-motion";
import { useMobileDetection } from "@/hooks/useMobileDetection";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
    const { isMobile } = useMobileDetection();

    if (isMobile) return <>{children}</>;

    return (
        <LazyMotion features={domAnimation}>
            {children}
        </LazyMotion>
    );
}
