import * as React from "react";
import { Input } from "@/components/ui/input";

interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string | number;
    onDebouncedChange: (value: string | number) => void;
    debounce?: number;
}

export function DebouncedInput({
    value,
    onDebouncedChange,
    debounce = 0,
    onChange,
    ...props
}: DebouncedInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDebouncedChange(e.target.value);
        onChange?.(e);
    };

    return (
        <Input
            {...props}
            value={value ?? ""}
            onChange={handleChange}
        />
    );
}
