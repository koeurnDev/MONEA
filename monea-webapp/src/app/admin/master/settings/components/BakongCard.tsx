"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Terminal, ExternalLink, Save, Loader2 } from "lucide-react";

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
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/60 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden relative group mt-8">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-800 opacity-20 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-8 lg:p-10">
                <div className="flex flex-col space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white font-kantumruy">Bakong API</h4>
                                <p className="text-[10px] text-slate-400 font-bold">Manage Connection</p>
                            </div>
                        </div>
                        {bakongInfo?.isConnected && (
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Connected</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Terminal size={12} className="text-red-600" /> API Token (JWT)
                                </label>
                                <a 
                                    href="https://api-bakong.nbc.gov.kh" 
                                    target="_blank" 
                                    className="text-[9px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                >
                                    Portal <ExternalLink size={10} />
                                </a>
                            </div>
                            <textarea
                                placeholder="Paste your production JWT token here..."
                                className="w-full p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all min-h-[140px] resize-none shadow-inner"
                                value={bakongManualToken}
                                onChange={(e) => setBakongManualToken(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={handleBakongManualSave}
                            disabled={isBakongLoading || !bakongManualToken}
                            className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {isBakongLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                            Update Connection Token
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
