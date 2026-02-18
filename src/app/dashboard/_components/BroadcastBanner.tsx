"use client";
import { useEffect, useState } from "react";
import { Megaphone, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function BroadcastBanner() {
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/admin/master/broadcast")
            .then(res => res.json())
            .then(data => {
                const active = data.filter((b: any) => b.active);
                setBroadcasts(active);
            })
            .catch(() => { });
    }, []);

    const activeBroadcasts = broadcasts.filter(b => !dismissed.includes(b.id));

    if (activeBroadcasts.length === 0) return null;

    return (
        <div className="space-y-2 mb-6">
            <AnimatePresence>
                {activeBroadcasts.map((b) => (
                    <motion.div
                        key={b.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={cn(
                            "relative overflow-hidden rounded-2xl border p-4 shadow-sm",
                            b.type === 'WARNING' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                b.type === 'SUCCESS' ? 'bg-green-50 border-green-100 text-green-900' :
                                    'bg-blue-50 border-blue-100 text-blue-900'
                        )}
                    >
                        <div className="flex items-start gap-4 pr-10">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                b.type === 'WARNING' ? 'bg-amber-100' :
                                    b.type === 'SUCCESS' ? 'bg-green-100' :
                                        'bg-blue-100'
                            )}>
                                <Megaphone size={18} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-tight">{b.title}</h4>
                                <p className="text-xs font-medium leading-relaxed opacity-80">{b.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDismissed([...dismissed, b.id])}
                            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-black/5 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
