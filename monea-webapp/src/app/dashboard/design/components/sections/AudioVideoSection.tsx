"use client";
import React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import { Music } from "lucide-react";
import clsx from "clsx";

interface AudioVideoSectionProps {
    wedding: any;
    isAnniv: boolean;
    updateTheme: (key: string, value: any, autoSave?: boolean) => void;
    removeThemeAsset: (urlKey: string, publicIdKey: string) => Promise<void>;
    t: any;
}

export const AudioVideoSection: React.FC<AudioVideoSectionProps> = ({
    wedding,
    isAnniv,
    updateTheme,
    removeThemeAsset,
    t
}) => {
    return (
        <section className="space-y-12">
            <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    {t("wizard.steps.4.audioVideoTitle")}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">
                    {isAnniv ? t("wizard.steps.4.audioVideoSubtitleAnniv", { defaultValue: "បន្ថែមបរិយាកាសរ៉ូមែនទិកទៅក្នុងធៀបខួបរបស់អ្នក" }) : t("wizard.steps.4.audioVideoSubtitle")}
                </p>
            </div>

            <div className="pl-3 space-y-10">
                {/* Audio Section */}
                <div className="space-y-4">
                    <Label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{t("wizard.steps.4.bgMusic")}</Label>
                    <AudioUploadWidget
                        value={wedding.themeSettings?.musicUrl || ""}
                        onChange={(url, publicId) => {
                            updateTheme('musicUrl', url);
                            if (publicId) {
                                updateTheme('musicUrlPublicId', publicId, true);
                            } else {
                                updateTheme('musicUrl', url, true);
                            }
                        }}
                        onRemove={() => removeThemeAsset('musicUrl', 'musicUrlPublicId')}
                        folder={wedding.id}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                        {[
                            { title: "Traditional", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123456/samples/wedding_sample_1.mp3" },
                            { title: "True Love", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123457/samples/wedding_sample_2.mp3" },
                            { title: "Happy Day", url: "https://res.cloudinary.com/dmsh9p6af/video/upload/v1710123458/samples/wedding_sample_3.mp3" }
                        ].map((song, i) => (
                            <button
                                key={i}
                                onClick={() => updateTheme('musicUrl', song.url, true)}
                                className={clsx(
                                    "flex items-center justify-center p-3 rounded-xl text-[10px] transition-all border font-bold uppercase tracking-widest",
                                    wedding.themeSettings?.musicUrl === song.url
                                        ? "bg-rose-500 text-white border-rose-500 shadow-md"
                                        : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:border-rose-200"
                                )}
                            >
                                <Music size={12} className="mr-2" />
                                {song.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* YouTube Section */}
                <div className="space-y-4">
                    <Label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">{t("wizard.steps.4.youtubeTitle")}</Label>
                    <DebouncedInput
                        placeholder={t("wizard.steps.4.youtubePlaceholder")}
                        value={wedding.themeSettings?.videoUrl || ""}
                        onDebouncedChange={(val) => updateTheme('videoUrl', val as string, true)}
                        className="h-12 rounded-xl border-none bg-slate-50 dark:bg-white/5 focus:ring-1 ring-rose-500/20 font-medium text-sm transition-all"
                    />
                </div>
            </div>
        </section>
    );
};
