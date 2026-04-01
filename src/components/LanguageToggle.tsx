"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle({ className }: { className?: string }) {
    const { locale, setLocale } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("rounded-full w-9 h-9", className)}>
                    <Languages className="h-[1.1rem] w-[1.1rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 min-w-[120px]">
                <DropdownMenuItem
                    onSelect={() => setLocale("km")}
                    className={cn(
                        "rounded-xl font-kantumruy text-xs py-2 cursor-pointer",
                        locale === "km" ? "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 font-bold" : ""
                    )}
                >
                    ភាសាខ្មែរ (Khmer)
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={() => setLocale("en")}
                    className={cn(
                        "rounded-xl font-kantumruy text-xs py-2 cursor-pointer",
                        locale === "en" ? "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 font-bold" : ""
                    )}
                >
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
