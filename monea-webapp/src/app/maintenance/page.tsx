import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { ShieldAlert, Sparkles, Heart, RefreshCw } from "lucide-react";
import PageTransition from '@/components/layout/PageTransition';
import { getApiUrl } from '@/lib/api-url';
import { useSocialLinks } from "@/hooks/useSocialLinks";

export default function MaintenancePage() {
    const telegramLink = useSocialLinks().find((link) => link.platform === "telegram");
    const [isChecking, setIsChecking] = useState(false);
    const [checkError, setCheckError] = useState('');

    const checkMaintenanceStatus = async () => {
        setIsChecking(true);
        setCheckError('');
        try {
            const response = await fetch(getApiUrl('/system/status'), {
                cache: 'no-store',
                credentials: 'include',
            });
            if (!response.ok && response.status !== 503) {
                throw new Error(`Status check failed with HTTP ${response.status}`);
            }

            const status: unknown = await response.json();
            const maintenance = response.status === 503 ||
                (typeof status === 'object' && status !== null && 'maintenance' in status && typeof status.maintenance === 'boolean'
                    ? status.maintenance
                    : undefined);
            if (maintenance === undefined) {
                throw new Error('Status check returned an invalid response');
            }
            if (!maintenance) {
                window.location.replace('/');
            }
        } catch (error) {
            console.error('[MaintenancePage] Could not check maintenance status:', error);
            setCheckError('មិនអាចពិនិត្យស្ថានភាពបានទេ។ សូមសាកល្បងម្ដងទៀត។');
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        void checkMaintenanceStatus();
        const interval = window.setInterval(() => void checkMaintenanceStatus(), 30000);
        return () => window.clearInterval(interval);
    }, []);

    return (
        <PageTransition>
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center selection:bg-red-500/30">
                <div className="max-w-2xl w-full">
                    <m.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        {/* Premium Glow Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-red-600/10 rounded-full blur-[120px] opacity-40 pointer-events-none" />

                        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-10 relative z-10 shadow-2xl">
                            <ShieldAlert size={48} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight font-kantumruy">
                            ប្រព័ន្ធកំពុង <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient-x">
                                ថែទាំបណ្ដោះអាសន្ន
                            </span>
                        </h1>

                        <p className="text-white/70 font-medium font-kantumruy text-base mb-8 max-w-md mx-auto leading-relaxed">
                            យើងខ្ញុំកំពុងកែលម្អប្រព័ន្ធ។ សូមអភ័យទោសចំពោះការរំខាននេះ។
                        </p>

                        <div className="relative z-20 mb-8 flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={() => void checkMaintenanceStatus()}
                                disabled={isChecking}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-kantumruy font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-wait disabled:opacity-70"
                            >
                                <RefreshCw size={18} className={isChecking ? "animate-spin" : ""} />
                                {isChecking ? "កំពុងពិនិត្យ..." : "ពិនិត្យស្ថានភាពម្ដងទៀត"}
                            </button>
                            {checkError && <p role="alert" className="max-w-sm font-kantumruy text-sm text-red-200">{checkError}</p>}
                            {telegramLink && <a
                                href={telegramLink.url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={telegramLink.label}
                                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-kantumruy text-sm font-semibold text-white/70 transition hover:border-amber-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                            >
                                <Sparkles className="text-amber-400" size={16} />
                                ទាក់ទងជំនួយ
                            </a>}
                        </div>

                        <m.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white/30 uppercase tracking-[0.2em]">
                                <Heart size={10} className="text-red-500 animate-pulse" /> 
                                Powered by MONEO Premium
                            </div>
                        </m.div>
                    </m.div>
                </div>
            </div>
        </PageTransition>
    );
}
