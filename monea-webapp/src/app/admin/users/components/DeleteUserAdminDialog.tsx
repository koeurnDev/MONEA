"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, Loader2, ShieldAlert, Sparkles } from "lucide-react";

interface DeleteUserAdminDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
    userEmail: string;
}

export function DeleteUserAdminDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    isDeleting, 
    userEmail 
}: DeleteUserAdminDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] rounded-[3.5rem] border border-white/20 shadow-[0_40px_80px_-20px_rgba(220,38,38,0.25)] p-0 overflow-hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl">
                <div className="relative p-10 pt-16 text-center">
                    {/* Premium Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent -z-10" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -z-10" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -z-10" />
                    
                    <div className="mb-8 relative inline-block">
                        <div className="w-24 h-24 bg-gradient-to-tr from-red-600 via-rose-500 to-orange-400 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/50 rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-105 active:scale-95 group cursor-default">
                            <Trash2 size={42} strokeWidth={2.5} className="group-hover:animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xl border-4 border-red-50 dark:border-red-950/30">
                            <ShieldAlert size={18} className="text-red-600 animate-bounce" />
                        </div>
                    </div>

                    <DialogHeader className="space-y-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-red-200" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/60">Danger Zone</span>
                           <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-red-200" />
                        </div>
                        <DialogTitle className="text-4xl font-black text-slate-900 dark:text-white font-kantumruy leading-tight tracking-tight">
                            តើអ្នកចង់<span className="text-red-600">ផ្អាក</span>គណនី?<br/>
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 font-kantumruy text-sm leading-relaxed max-w-[85%] mx-auto bg-slate-500/5 py-4 px-6 rounded-2xl border border-slate-500/10">
                            អ្នកកំពុងរៀបនឹងផ្អាកគណនី <span className="text-slate-900 dark:text-white font-bold font-mono text-xs">{userEmail}</span>។ 
                            ទិន្នន័យទាំងអស់នឹងត្រូវរក្សាទុកក្នុង &quot;Recovery Zone&quot; រយៈពេល ៣០ ថ្ងៃ។
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-10 bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 rounded-[2.5rem] p-6 border border-red-500/10 flex items-start gap-5 text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={48} className="text-red-500" />
                        </div>
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 shrink-0 border border-slate-100 dark:border-slate-700">
                            <AlertCircle className="text-red-500" size={24} />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.1em] text-red-600/80 mb-1">គោលការណ៍សុវត្ថិភាពខ្ពស់</h4>
                            <p className="text-xs font-bold font-kantumruy text-slate-600 dark:text-slate-300 leading-relaxed">
                                គណនីនឹងត្រូវលុបជាស្ថាពរបន្ទាប់ពី ៣០ ថ្ងៃ ប្រសិនបើមិនមានការស្នើសុំយកវិញ។
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-16 rounded-[1.75rem] font-black font-kantumruy text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            បោះបង់
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="h-16 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-[1.75rem] font-black font-kantumruy shadow-2xl shadow-red-500/30 active:scale-[0.98] transition-all group overflow-hidden relative border-t border-white/20"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3 text-sm uppercase tracking-wider">
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5" />
                                        កំពុងដំណើរការ...
                                    </>
                                ) : (
                                    <>
                                        យល់ព្រមផ្អាក
                                        <ArrowLeft size={16} className="rotate-180" />
                                    </>
                                )}
                            </span>
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper icons needed inside
function ArrowLeft({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
        </svg>
    );
}
