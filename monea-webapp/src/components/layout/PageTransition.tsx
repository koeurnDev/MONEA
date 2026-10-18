import * as React from "react";
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation();
    return <div key={pathname}>{children}</div>;
}
