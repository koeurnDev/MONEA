import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Terminal, ExternalLink, Save, Loader2, CheckCircle2 } from "lucide-react";

interface BakongCardProps {
    bakongInfo: any;
    bakongManualToken: string;
    setBakongManualToken: (val: string) => void;
    handleBakongManualSave: () => void;
    isBakongLoading: boolean;
}

export function BakongCard({
    bakongInfo,
    bakongManualToken,
    setBakongManualToken,
    handleBakongManualSave,
    isBakongLoading
}: BakongCardProps) {
    return (
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden font-kantumruy">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
                            <CreditCard size={22} />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-slate-900 dark:text-white">Bakong KHQR Gateway</h4>
                            <p className="text-xs text-slate-400 font-bold">Manage NBC Bakong Connection</p>
                        </div>
                    </div>
                    {bakongInfo?.isConnected && (
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Connected</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <Terminal size={14} className="text-red-600" />
                            <span>API Token (JWT)</span>
                        </label>
                        <a 
                            href="https://api-bakong.nbc.gov.kh" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                        >
                            <span>NBC Portal</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>
                    <textarea
                        placeholder="Paste your production JWT token here..."
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/70 text-xs font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all min-h-[100px] resize-none"
                        value={bakongManualToken}
                        onChange={(e) => setBakongManualToken(e.target.value)}
                    />
                    <Button 
                        onClick={handleBakongManualSave} 
                        disabled={isBakongLoading || !bakongManualToken}
                        className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                        {isBakongLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>កំពុងរក្សាទុក...</span>
                            </>
                        ) : (
                            <>
                                <Save size={15} />
                                <span>រក្សាទុក Bakong Token</span>
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
