import React from 'react';
import { m } from 'framer-motion';

export const ParallaxDivider = ({ text }: { text: string }) => {
    return (
        <section className="flex w-full items-center justify-center bg-[#f4efdf] px-6 py-8">
            <m.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex w-full max-w-xs items-center gap-4"
            >
                <span className="h-px flex-1 bg-[#cfc5af]" aria-hidden="true" />
                <h2 className="whitespace-nowrap font-playfair text-sm sm:text-base font-medium uppercase tracking-[0.22em] text-[#827a68]">
                    {text}
                </h2>
                <span className="h-px flex-1 bg-[#cfc5af]" aria-hidden="true" />
            </m.div>
        </section>
    );
};
