"use client";

import * as React from "react";
import { Languages, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminLanguageToggle({ className }: { className?: string }) {
    const { locale, setLocale, t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className={cn(
                        "h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-slate-900", 
                        className
                    )}
                >
                    <Languages size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-red-500 transition-colors" />
                    <span className="sr-only">切换语言 / Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 mb-1">
                    Language Selection
                </div>
                <DropdownMenuItem
                    onSelect={() => setLocale("km")}
                    className={cn(
                        "rounded-xl font-kantumruy text-sm py-3 px-3 cursor-pointer flex items-center justify-between transition-all duration-300",
                        locale === "km" 
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                >
                    <span>ភាសាខ្មែរ (Khmer)</span>
                    {locale === "km" && <Check size={14} className="animate-in zoom-in-50" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => setLocale("en")}
                    className={cn(
                        "rounded-xl font-kantumruy text-sm py-3 px-3 cursor-pointer flex items-center justify-between transition-all duration-300",
                        locale === "en" 
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                >
                    <span>English</span>
                    {locale === "en" && <Check size={14} className="animate-in zoom-in-50" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
