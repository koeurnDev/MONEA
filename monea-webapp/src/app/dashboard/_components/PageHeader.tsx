import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  stackActionOnMobile?: boolean;
  className?: string;
}

/**
 * Shared dashboard page header — consistent across all pages.
 * Simple: large title + small icon left + optional action button right.
 */
export function PageHeader({
  title,
  icon: Icon,
  iconColor = "text-primary",
  action,
  stackActionOnMobile = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between gap-3 border-b border-border/60 bg-transparent pb-4 pt-1",
        stackActionOnMobile && "flex-col items-stretch sm:flex-row sm:items-center",
        className
      )}
    >
      {/* Left: Icon + Title */}
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-accent shadow-sm shrink-0">
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground font-kantumruy leading-tight tracking-tight break-words">
          {title}
        </h1>
      </div>

      {/* Right: Action slot */}
      {action && (
        <div className={cn(
          "flex shrink-0 items-center gap-2",
          stackActionOnMobile && "w-full flex-wrap justify-start sm:w-auto sm:justify-end"
        )}>
          {action}
        </div>
      )}
    </div>
  );
}
