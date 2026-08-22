"use client";

import { Variants } from 'framer-motion';

export const overlayVariants: Variants = {
    initial: { opacity: 1 },
    exit: { opacity: 0, scale: 1.1 },
};

export const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 1,
            delay: 0.5
        }
    }
};

export const heroTextVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({
        y: 0,
        opacity: 1,
        transition: { delay: custom, duration: 1.2 }
    })
};

export const scrollIndicatorVariants: Variants = {
    animate: {
        opacity: [0, 1, 0],
        transition: { duration: 2, repeat: Infinity }
    }
};
