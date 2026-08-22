"use client";
import * as React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export const AccordionItem = ({ icon: Icon, title, subtitle, children, isOpen, onClick }: any) => (
    <div className={clsx(
        "transition-all duration-300",
        isOpen
            ? "bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl ring-1 ring-slate-100 dark:ring-white/5"
            : "border-b border-slate-100 dark:border-white/5"
    )}>
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between py-6 px-4 text-left transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    isOpen
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-slate-50/50 dark:bg-white/5 text-slate-400 group-hover:bg-rose-500 group-hover:text-white"
                )}>
                    <Icon size={16} />
                </div>
                <div>
                    <h3 className="text-[12px] font-bold text-slate-900 dark:text-white font-kantumruy tracking-tight capitalize">{title}</h3>
                    <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className={clsx(
                "transition-transform duration-300 text-slate-300",
                isOpen && "rotate-180 text-rose-500"
            )}>
                <ChevronDown size={14} />
            </div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <div className="px-4 pb-8">
                        {children}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    </div>
);
