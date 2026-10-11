import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export const AccordionItem = ({ id, icon: Icon, title, subtitle, children, isOpen, onClick, hideWhenClosed = false, hideHeader = false }: any) => (
    <div className={clsx(
        "transition-all duration-300 rounded-[1.35rem] overflow-hidden mb-3 border",
        hideWhenClosed && !isOpen && "hidden",
        isOpen
            ? "bg-white dark:bg-white/[0.02] border-teal-200/80 dark:border-teal-500/20 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
            : "bg-[#f8f6f3] dark:bg-white/[0.02] border-stone-200/90 dark:border-white/10 hover:border-stone-300 dark:hover:border-white/20"
    )} id={id}>
        {!hideHeader && (
            <button
                type="button"
                onClick={onClick}
                className="w-full flex items-center justify-between py-3.5 px-3.5 sm:px-5 text-left transition-colors group outline-none"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
                        isOpen
                            ? "bg-teal-500 text-white shadow-sm shadow-teal-500/20"
                            : "bg-white dark:bg-white/5 text-slate-500 group-hover:text-teal-600 border border-stone-200/80 dark:border-white/10"
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
                    isOpen && "rotate-180 text-teal-500 bg-teal-500/10"
                )}>
                    <ChevronDown size={16} />
                </div>
            </button>
        )}
        {isOpen && (
            <div className={clsx(
                "px-3.5 sm:px-5 pb-4 border-t border-stone-100 dark:border-white/5 bg-white/60 dark:bg-white/[0.02]",
                hideHeader ? "pt-4" : "pt-1"
            )}>
                {children}
            </div>
        )}
    </div>
);
