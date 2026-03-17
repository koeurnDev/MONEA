"use client";

import { useState, useEffect } from 'react';

interface HydratedDateProps {
    date: Date | string | number;
    options?: Intl.DateTimeFormatOptions;
    locale?: string;
    className?: string;
}

export function HydratedDate({ date, options, locale, className }: HydratedDateProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span className={className}>...</span>;
    }

    try {
        const d = new Date(date);
        const defaultOptions: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Phnom_Penh',
            ...options
        };
        return (
            <span className={className}>
                {d.toLocaleDateString(locale || 'km-KH', defaultOptions)}
            </span>
        );
    } catch (e) {
        return <span className={className}>---</span>;
    }
}
