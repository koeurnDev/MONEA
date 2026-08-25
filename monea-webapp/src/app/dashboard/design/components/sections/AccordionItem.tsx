import * as React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export const AccordionItem = ({ icon: Icon, title, subtitle, children, isOpen, onClick }: any) => (
    <div className={clsx(
        "transition-all duration-300 rounded-2xl overflow-hidden mb-3 border",
        isOpen
            ? "bg-white dark:bg-white/[0.02] border-rose-500/30 dark:border-rose-500/20 shadow-sm"
            : "bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
    )}>
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-between py-4 px-4 sm:px-5 text-left transition-colors group outline-none"
        >
            <div className="flex items-center gap-3.5 min-w-0">
                <div className={clsx(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
                    isOpen
                        ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
                        : "bg-white dark:bg-white/5 text-slate-500 group-hover:text-rose-600 border border-slate-200/80 dark:border-white/10"
                )}>
                    <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-foreground font-kantumruy tracking-tight truncate">{title}</h3>
                    {subtitle && (
                        <p className="text-[11px] text-muted-foreground font-kantumruy truncate mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>
            <div className={clsx(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 text-muted-foreground flex-shrink-0 ml-2",
                isOpen && "rotate-180 text-rose-500 bg-rose-500/10"
            )}>
                <ChevronDown size={16} />
            </div>
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/5">
                        {children}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    </div>
);
