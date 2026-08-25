import * as React from 'react';
import { m } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import type { WeddingData } from '@/components/templates/types';

interface LabelsSectionProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    updateLabel: (key: string, value: string) => void;
    t: (key: string, opts?: any) => string;
}

const LABEL_SECTIONS = [
    {
        title: "ក្បាលទំព័រ និងការអញ្ជើញ (Header & Invitation)",
        fields: [
            { key: 'invite_title', label: "ចំណងជើងធៀបការ (Invitation Title)", type: 'input', placeholder: "ឧ. សិរីសួស្តី អាពាហ៍ពិពាហ៍" },
            { key: 'hero_subtitle', label: "ពាក្យស្លោកលើរូបភាព (Hero Subtitle)", type: 'input', placeholder: "ឧ. យើងខ្ញុំសូមគោរពអញ្ជើញ..." },
            { key: 'hero_button', label: "ប៊ូតុងបើកសំបុត្រ (Open Button)", type: 'input', placeholder: "ឧ. បើកសំបុត្រអញ្ជើញ" },
            { key: 'invitationText', label: "ខ្លឹមសារលិខិតអញ្ជើញ (Invitation Body Text)", type: 'textarea', placeholder: "ខ្លឹមសារលម្អិតនៃលិខិតអញ្ជើញ..." }
        ]
    },
    {
        title: "ទីតាំង និងពេលវេលា (Location & Countdown)",
        fields: [
            { key: 'locationTitle', label: "ចំណងជើងទីតាំង (Location Title)", type: 'input', placeholder: "ឧ. ទីតាំងនៃកម្មវិធី" },
            { key: 'locationSubtitle', label: "ការពិពណ៌នាទីតាំង (Location Subtitle)", type: 'input', placeholder: "ឧ. សូមចុចលើផែនទីដើម្បីស្វែងរកផ្លូវ" },
            { key: 'countdownLabel', label: "ចំណងជើងរាប់ថយក្រោយ (Countdown Label)", type: 'input', placeholder: "ឧ. កម្មវិធីនឹងចាប់ផ្តើមក្នុងរយៈពេល" }
        ]
    },
    {
        title: "វិចិត្រសាល និងការជូនពរ (Gallery & Wishes)",
        fields: [
            { key: 'gallery_title', label: "ចំណងជើងរូបថត (Gallery Title)", type: 'input', placeholder: "ឧ. កម្រងរូបភាពអនុស្សាវរីយ៍" },
            { key: 'giftTitle', label: "ចំណងជើងចំណងដៃ (Gift Registry Title)", type: 'input', placeholder: "ឧ. ចូលរួមជូនពរ & ចំណងដៃ" },
            { key: 'giftBadge', label: "ស្លាកលើ QR (Gift Badge)", type: 'input', placeholder: "ឧ. ស្កេន KHQR ដើម្បីចងដៃ" }
        ]
    }
];

export function LabelsSection({ wedding, updateTheme, updateLabel, t }: LabelsSectionProps) {
    return (
        <div className="space-y-6 pt-2 font-kantumruy">
            {LABEL_SECTIONS.map((section, sIdx) => (
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIdx * 0.05 }}
                    key={sIdx}
                    className="space-y-3"
                >
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <h5 className="text-xs font-bold text-foreground">{section.title}</h5>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 bg-white dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                        {section.fields.map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <Label className="text-xs font-bold text-muted-foreground">{field.label}</Label>
                                {field.type === 'textarea' ? (
                                    <DebouncedTextarea
                                        placeholder={field.placeholder}
                                        value={field.key === 'invitationText' ? (wedding.themeSettings?.invitationText || "") : ((wedding.themeSettings?.customLabels as any)?.[field.key] || "")}
                                        onDebouncedChange={(val) => field.key === 'invitationText' ? updateTheme('invitationText', val) : updateLabel(field.key, val)}
                                        className="min-h-[75px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                                    />
                                ) : (
                                    <DebouncedInput
                                        placeholder={field.placeholder}
                                        value={(wedding.themeSettings?.customLabels as any)?.[field.key] || ""}
                                        onDebouncedChange={(val) => updateLabel(field.key, val as string)}
                                        className="h-10 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 px-3.5 text-xs font-medium text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 placeholder:text-muted-foreground/60 shadow-sm"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </m.div>
            ))}
        </div>
    );
}
