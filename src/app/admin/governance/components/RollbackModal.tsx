"use client";
import { AnimatePresence, m } from 'framer-motion';
import { RotateCcw, AlertTriangle, GitBranch, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RollbackModalProps = {
    confirmModal: { open: boolean, versionId: string, versionName: string };
    setConfirmModal: (modal: { open: boolean, versionId: string, versionName: string }) => void;
    rollingBack: string | null;
    successModal: boolean;
    handleRollback: (versionId: string) => void;
};

export function RollbackModal({ confirmModal, setConfirmModal, rollingBack, successModal, handleRollback }: RollbackModalProps) {
    return (
        <>
            <AnimatePresence>
                {confirmModal.open && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => !rollingBack && setConfirmModal({ open: false, versionId: "", versionName: "" })}
                    >
                        <m.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-full max-w-md overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Red danger header */}
                            <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 flex flex-col items-center gap-3 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-white" />
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <RotateCcw size={28} className="text-white" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-black text-white">ការ Rollback ប្រព័ន្ធ</h2>
                                    <p className="text-red-100 text-xs mt-1 font-bold uppercase tracking-widest">System Rollback Confirmation</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-8 space-y-6">
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-2">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">ការព្រមាន (Warning)</span>
                                    </div>
                                    <p className="text-sm text-red-600 leading-relaxed">
                                        ការ Rollback នឹងធ្វើឱ្យការកំណត់ប្រព័ន្ធ <strong>ទាំងអស់</strong>ត្រឡប់ទៅ <strong>&quot;{confirmModal.versionName}&quot;</strong> ភ្លាមៗ រួមទាំង Maintenance Mode និងការរឹតបន្តឹងការចុះឈ្មោះ។
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                                        <GitBranch size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rollback Target</p>
                                        <p className="text-sm font-black text-slate-900">{confirmModal.versionName}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50"
                                        onClick={() => setConfirmModal({ open: false, versionId: "", versionName: "" })}
                                        disabled={!!rollingBack}
                                    >
                                        <X size={16} className="mr-1.5" /> Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black gap-2 shadow-lg shadow-red-200"
                                        onClick={() => handleRollback(confirmModal.versionId)}
                                        disabled={!!rollingBack}
                                    >
                                        {rollingBack ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                                        {rollingBack ? "Rolling Back..." : "Yes, Rollback"}
                                    </Button>
                                </div>
                            </div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* ===== SUCCESS TOAST ===== */}
            <AnimatePresence>
                {successModal && (
                    <m.div
                        initial={{ opacity: 0, y: -80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -80 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200"
                    >
                        <CheckCircle2 size={20} className="text-emerald-200" />
                        <div>
                            <p className="font-black text-sm">Rollback ជោគជ័យ! ✅</p>
                            <p className="text-emerald-200 text-[11px]">System is reverting, reloading...</p>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </>
    );
}
