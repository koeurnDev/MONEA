"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface DebouncedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value?: string;
    onDebouncedChange: (value: string) => void;
    debounce?: number;
}

export function DebouncedTextarea({
    value: initialValue,
    onDebouncedChange,
    debounce = 500,
    className,
    ...props
}: DebouncedTextareaProps) {
    const [value, setValue] = React.useState(initialValue || "");

    React.useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (value !== initialValue) {
                onDebouncedChange(value);
            }
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, initialValue, onDebouncedChange]);

    return (
        <textarea
            {...props}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
                "w-full p-3 text-sm border border-border rounded-lg bg-muted/50 text-foreground focus:ring-1 focus:ring-primary outline-none transition-all",
                className
            )}
        />
    );
}
