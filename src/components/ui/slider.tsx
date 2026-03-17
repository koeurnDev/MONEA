
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onValueChange'> {
  value: number[]
  onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        value={value[0]}
        onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
        className={cn(
          "w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-red-600",
          className
        )}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
