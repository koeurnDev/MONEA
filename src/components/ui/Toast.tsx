"use client";
// Force HMR refresh

import * as React from "react";
import { AnimatePresence, m } from "framer-motion";
import { X, Bell, MessageSquare, Heart } from "lucide-react";

export interface ToastMessage {
    id: string;
    title: string;
    description?: string;
    type: "info" | "success" | "wish" | "error";
}

interface ToastContextType {
    showToast: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = React.useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

    const showToast = React.useCallback((msg: Omit<ToastMessage, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { ...msg, id }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <m.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-2xl flex items-start gap-3 w-80 pointer-events-auto"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                toast.type === "wish" ? "bg-pink-500/20 text-pink-500" : 
                                toast.type === "success" ? "bg-emerald-500/20 text-emerald-500" :
                                toast.type === "error" ? "bg-red-500/20 text-red-500" :
                                "bg-blue-500/20 text-blue-500"
                            }`}>
                                {toast.type === "wish" ? <Heart size={18} fill="currentColor" /> : 
                                 toast.type === "success" ? <MessageSquare size={18} /> : 
                                 toast.type === "error" ? <Bell size={18} className="animate-shake" /> :
                                 <Bell size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black font-kantumruy truncate">{toast.title}</h4>
                                <p className="text-xs text-muted-foreground font-medium line-clamp-2">{toast.description}</p>
                            </div>
                            <button 
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </m.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
