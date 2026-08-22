import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
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
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/50",
        className
      )}
    >
      {/* Left: Icon + Title */}
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/60 shrink-0">
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-kantumruy leading-tight">
          {title}
        </h1>
      </div>

      {/* Right: Action slot */}
      {action && (
        <div className="flex items-center gap-2 shrink-0">{action}</div>
      )}
    </div>
  );
}
