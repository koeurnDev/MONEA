import { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, className }: StatCardProps) {
    return (
        <GlassCard className={cn("p-4 flex flex-col justify-between h-[120px]", className)}>
            <div className="flex justify-between items-start">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Icon size={20} />
                </div>
                {trend && (
                    <span
                        className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            trendUp ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                        )}
                    >
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
                <h3 className="text-2xl font-bold font-kantumruy tracking-wide">{value}</h3>
            </div>
        </GlassCard>
    );
}
