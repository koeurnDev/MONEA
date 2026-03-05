"use client";
import { AnimatePresence, m } from "framer-motion";
import { AlertTriangle, Trash2, RotateCcw, ShieldAlert, LucideIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    loading?: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
    detail?: string; // optional extra info card (e.g. version name)
}

const variantConfig: Record<ConfirmVariant, {
    bg: string; icon: LucideIcon; iconBg: string; confirmClass: string; iconColor: string;
}> = {
    danger: {
        bg: "from-red-600 to-red-700",
        icon: Trash2,
        iconBg: "bg-white/20",
        iconColor: "text-white",
        confirmClass: "bg-red-600 hover:bg-red-700 shadow-red-200",
    },
    warning: {
        bg: "from-amber-500 to-amber-600",
        icon: AlertTriangle,
        iconBg: "bg-white/20",
        iconColor: "text-white",
        confirmClass: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    },
    info: {
        bg: "from-slate-700 to-slate-900",
        icon: RotateCcw,
        iconBg: "bg-white/10",
        iconColor: "text-white",
        confirmClass: "bg-slate-900 hover:bg-black shadow-slate-200",
    },
};

export function ConfirmModal({
    open, onClose, onConfirm, loading = false,
    title, description, confirmLabel = " បញ្ជាក់", cancelLabel = "បោះបង់",
    variant = "danger", detail
}: ConfirmModalProps) {
    const cfg = variantConfig[variant];
    const Icon = cfg.icon;
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => !loading && onClose()}
                >
                    <m.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-full max-w-md overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Gradient header */}
                        <div className={`bg-gradient-to-br ${cfg.bg} p-8 flex flex-col items-center gap-3 relative overflow-hidden`}>
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-white" />
                            </div>
                            <div className={`w-16 h-16 rounded-2xl ${cfg.iconBg} backdrop-blur-sm flex items-center justify-center border border-white/30`}>
                                <Icon size={28} className={cfg.iconColor} />
                            </div>
                            <div className="text-center z-10">
                                <h2 className="text-xl font-black text-white">{title}</h2>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-5">
                            <p className="text-sm text-slate-600 leading-relaxed text-center">{description}</p>

                            {detail && (
                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                        <ShieldAlert size={16} />
                                    </div>
                                    <p className="text-sm font-black text-slate-800">{detail}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    <X size={15} className="mr-1.5" /> {cancelLabel}
                                </Button>
                                <Button
                                    className={`flex-1 h-12 rounded-2xl text-white font-black gap-2 shadow-lg ${cfg.confirmClass}`}
                                    onClick={onConfirm}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
                                    {loading ? "Processing..." : confirmLabel}
                                </Button>
                            </div>
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
