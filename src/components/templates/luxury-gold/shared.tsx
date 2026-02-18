import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Gold Gradient Text Helper
export const GoldText = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] bg-[length:200%_auto] animate-shine", className)}>
        {children}
    </span>
);

export const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
