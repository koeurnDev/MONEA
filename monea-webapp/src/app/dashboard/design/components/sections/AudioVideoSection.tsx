import React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import { Music, Video, Play, ExternalLink } from "lucide-react";
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
        <section className="space-y-6 font-kantumruy">
            <div className="space-y-1 border-b border-slate-200/80 dark:border-white/10 pb-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Music className="w-4 h-4 text-rose-500" />
                    <span>តន្ត្រីផ្ទៃខាងក្រោយ & វីដេអូ (Background Music & Video)</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                    បន្ថែមបទភ្លេង និងវីដេអូ Pre-wedding ដើម្បីឱ្យធៀបការកាន់តែរស់រវើក
                </p>
            </div>

            <div className="space-y-6">
                {/* Audio Section */}
                <div className="space-y-3 bg-white dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                    <Label className="block text-xs font-bold text-foreground">
                        បទភ្លេងកំដរលើធៀប (Background Music)
                    </Label>
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
                </div>

                {/* Video URL Section */}
                <div className="space-y-2.5 bg-white dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-rose-500" />
                            <span>វីដេអូ Pre-wedding / YouTube Link</span>
                        </Label>
                    </div>
                    <DebouncedInput
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={wedding.themeSettings?.videoUrl || ""}
                        onDebouncedChange={(val) => updateTheme('videoUrl', val as string)}
                        className="h-11 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-xs font-bold text-foreground px-3.5 shadow-sm placeholder:text-muted-foreground/60"
                    />
                </div>
            </div>
        </section>
    );
};
