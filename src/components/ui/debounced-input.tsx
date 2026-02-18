"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string | number;
    onDebouncedChange: (value: string | number) => void;
    debounce?: number;
}

export function DebouncedInput({
    value: initialValue,
    onDebouncedChange,
    debounce = 500,
    ...props
}: DebouncedInputProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value !== initialValue) {
                onDebouncedChange(value as string);
            }
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, initialValue, onDebouncedChange]);

    return (
        <Input
            {...props}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
}
