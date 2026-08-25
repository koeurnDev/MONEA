import * as React from "react";
import { cn } from "@/lib/utils";

interface DebouncedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value?: string;
    onDebouncedChange: (value: string) => void;
    debounce?: number;
}

export function DebouncedTextarea({
    value,
    onDebouncedChange,
    debounce = 0,
    className,
    onChange,
    ...props
}: DebouncedTextareaProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDebouncedChange(e.target.value);
        onChange?.(e);
    };

    return (
        <textarea
            {...props}
            value={value ?? ""}
            onChange={handleChange}
            className={cn(
                "flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300",
                className
            )}
        />
    );
}
