"use client";
import React from 'react';
import { Plus, Trash2, Sparkles } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

interface SacredBondSectionProps {
    wedding: any;
    setActiveSlotIdx: (idx: number) => void;
    slotInputRef: React.RefObject<HTMLInputElement>;
    removeGalleryItem: (idx: number) => void;
    slotUploading: boolean;
    t: any;
}

export const SacredBondSection: React.FC<SacredBondSectionProps> = ({
    wedding,
    setActiveSlotIdx,
    slotInputRef,
    removeGalleryItem,
    slotUploading,
    t
}) => {
    return (
        <section className="space-y-8">
            <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    {t("wizard.steps.4.bondTitle")}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">{t("wizard.steps.4.bondSubtitle")}</p>
            </div>
            
            <div className="mx-3">
                {(() => {
                    const cert = wedding.galleryItems?.find((i: any) => i.type === 'CERTIFICATE');
                    const certIdx = wedding.galleryItems?.findIndex((i: any) => i.type === 'CERTIFICATE');
                    const hasCert = !!cert?.url;

                    return (
                        <div className={clsx(
                            "relative rounded-xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center group transition-all duration-500 min-h-[260px]",
                            !hasCert && "hover:border-rose-100 dark:hover:border-rose-500/10"
                        )}>
                            {hasCert ? (
                                <>
                                    <Image src={cert.url} alt="Sacred Bond" className="object-cover transition-transform duration-1000 group-hover:scale-105" fill sizes="(max-width: 768px) 100vw, 80vw" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setActiveSlotIdx(-1);
                                                    slotInputRef.current?.click();
                                                }}
                                                className="bg-white text-rose-500 p-3 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                                            >
                                                <Plus size={20} />
                                            </button>
                                            <button
                                                onClick={() => certIdx !== undefined && certIdx !== -1 && removeGalleryItem(certIdx)}
                                                className="bg-white text-red-500 p-3 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button 
                                    disabled={slotUploading}
                                    onClick={() => {
                                        setActiveSlotIdx(-1);
                                        slotInputRef.current?.click();
                                    }} 
                                    className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-200 group-hover:text-rose-500 shadow-sm transition-all">
                                        <Sparkles size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-slate-600 dark:text-white/40 font-bold block group-hover:text-rose-500 transition-colors">{t("wizard.steps.4.uploadBond")}</span>
                                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-widest">{t("wizard.steps.4.recommendSize")}</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    );
                })()}
            </div>
        </section>
    );
};
