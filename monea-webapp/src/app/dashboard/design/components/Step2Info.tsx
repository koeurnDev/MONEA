import React from 'react';
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { DebouncedInput } from "@/components/ui/debounced-input";
import ImageUpload from "@/components/ui/image-upload-widget";
import { Slider } from "@/components/ui/slider";
import { Users, Heart, Sparkles } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';
import { useTranslation } from "@/i18n/LanguageProvider";

interface ParentNameFieldProps {
    id: string;
    label: string;
    placeholder: string;
    value?: string;
    onChange: (value: string) => void;
}

const ParentNameField: React.FC<ParentNameFieldProps> = ({ id, label, placeholder, value, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(Boolean(value?.trim()));
    const isVisible = isOpen || Boolean(value?.trim());

    if (!isVisible) {
        return (
            <button
                type="button"
                aria-expanded={false}
                onClick={() => setIsOpen(true)}
                className="min-h-10 flex-1 rounded-xl border border-dashed border-teal-500/40 bg-white/70 px-3 py-2 text-[11px] font-bold text-teal-700 transition-colors hover:bg-teal-50 dark:bg-black/10 dark:text-teal-300 dark:hover:bg-teal-900/20"
            >
                + {label}
            </button>
        );
    }

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between gap-2">
                <Label htmlFor={id} className="text-[11px] font-bold text-muted-foreground">{label}</Label>
                <button
                    type="button"
                    aria-label={`ដក ${label}`}
                    onClick={() => {
                        onChange("");
                        setIsOpen(false);
                    }}
                    className="rounded-md px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-white/10"
                >
                    ដកចេញ
                </button>
            </div>
            <DebouncedInput
                id={id}
                autoComplete="off"
                placeholder={placeholder}
                className="h-10 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm"
                value={value || ""}
                onDebouncedChange={(nextValue) => onChange(String(nextValue))}
            />
        </div>
    );
};

interface Step2InfoProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    updateParent: (key: string, value: string) => void;
    updateLabel: (key: string, value: string) => void;
}

const Step2Info: React.FC<Step2InfoProps> = ({ 
    wedding, 
    updateWedding, 
    updateTheme,
    updateParent,
    updateLabel,
}) => {
    const { user } = useAuth();
    const isPlatformAdmin = user?.role === 'SUPERADMIN' || user?.role === 'PLATFORM_OWNER';
    const { t } = useTranslation();
    const isAnniv = wedding.eventType === 'anniversary';

    return (
        <div className="space-y-8 font-kantumruy">
            {/* Header info banner */}
            <div className="bg-teal-500/5 p-5 rounded-3xl border border-teal-500/10 shadow-sm relative overflow-hidden">
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-teal-600 fill-teal-600" />
                    {t("wizard.steps.2.coupleTitle", { defaultValue: "ព័ត៌មានរបស់គូស្នេហ៍" })}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAnniv 
                        ? t("wizard.steps.2.coupleSubtitleAnniv", { defaultValue: "បញ្ចូលឈ្មោះគូស្វាមីភរិយាទាំងពីរ។ រូបភាពអាចបន្ថែមនៅជំហានបន្ទាប់។" })
                        : t("wizard.steps.2.coupleSubtitle", { defaultValue: "បញ្ចូលឈ្មោះកូនកំលោះ និងកូនក្រមុំ។ រូបភាពអាចបន្ថែមនៅជំហានបន្ទាប់។" })}
                </p>
                <div className="mt-3 inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-black text-teal-700 shadow-sm dark:bg-white/10 dark:text-teal-300">
                    ត្រូវបំពេញឈ្មោះទាំងពីរ។ ព័ត៌មានមាតាបិតាអាចរំលងបាន។
                </div>
            </div>

            {/* 1. Couple Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Groom / Husband */}
                <div className="space-y-4 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground block">
                            {isAnniv ? t("wizard.steps.2.husbandName", { defaultValue: "ឈ្មោះគូដណ្តឹង (ខាងប្រុស)" }) : t("wizard.steps.2.groomName", { defaultValue: "ឈ្មោះកូនកំលោះ" })} <span className="text-teal-500">*</span>
                        </Label>
                        <DebouncedInput
                            autoFocus
                            aria-required="true"
                            value={wedding.groomName}
                            onDebouncedChange={(val) => updateWedding("groomName", val)}
                            className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm"
                            placeholder={isAnniv ? t("wizard.steps.2.husbandPlaceholder", { defaultValue: "បញ្ចូលឈ្មោះគូដណ្តឹងខាងប្រុស" }) : t("wizard.steps.2.groomPlaceholder", { defaultValue: "បញ្ចូលឈ្មោះកូនកំលោះ" })}
                        />
                    </div>
                </div>

                {/* Bride / Wife */}
                <div className="space-y-4 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground block">
                            {isAnniv ? t("wizard.steps.2.wifeName", { defaultValue: "ឈ្មោះគូដណ្តឹង (ខាងស្រី)" }) : t("wizard.steps.2.brideName", { defaultValue: "ឈ្មោះកូនក្រមុំ" })} <span className="text-teal-500">*</span>
                        </Label>
                        <DebouncedInput
                            aria-required="true"
                            value={wedding.brideName}
                            onDebouncedChange={(val) => updateWedding("brideName", val)}
                            className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm"
                            placeholder={isAnniv ? t("wizard.steps.2.wifePlaceholder", { defaultValue: "បញ្ចូលឈ្មោះគូដណ្តឹងខាងស្រី" }) : t("wizard.steps.2.bridePlaceholder", { defaultValue: "បញ្ចូលឈ្មោះកូនក្រមុំ" })}
                        />
                    </div>
                </div>
            </div>
            
            {/* Custom Typography (Design Name from Illustrator) - ADMIN ONLY */}
            {isPlatformAdmin && (
                <div className="space-y-4 bg-teal-50/30 dark:bg-teal-900/10 p-4 rounded-2xl border border-teal-100 dark:border-teal-900/30 relative mt-5">
                    <div className="absolute -top-3 -right-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Admin Only</div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-teal-500" />
                        <Label className="text-xs font-bold text-foreground block">
                            អក្សរឈ្មោះរចនា (Custom Typography SVG/PNG)
                        </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                        (Admin Only): Upload SVG ឬ PNG ពី Illustrator។ វានឹងទៅជំនួសអក្សរវាយធម្មតានៅលើ Cover។
                    </p>
                    <div className="max-w-xs">
                        <ImageUpload
                            value={wedding?.themeSettings?.customTypographyUrl || ""}
                            onChange={(url, publicId) => {
                                updateTheme("customTypographyUrl", url);
                                updateTheme("customTypographyPublicId", publicId || "");
                            }}
                            onRemove={() => {
                                updateTheme("customTypographyUrl", "");
                                updateTheme("customTypographyPublicId", "");
                            }}
                            label="បញ្ចូលរូបរចនាឈ្មោះ"
                            folder={wedding.id}
                        />
                        
                        {wedding?.themeSettings?.customTypographyUrl && (
                            <div className="mt-4 space-y-3 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ទំហំ (Scale)</Label>
                                    <span className="text-[10px] font-mono text-slate-500">{wedding?.themeSettings?.customTypographyScale || 100}%</span>
                                </div>
                                <Slider
                                    value={[wedding?.themeSettings?.customTypographyScale || 100]}
                                    onValueChange={(val) => updateTheme("customTypographyScale", val[0])}
                                    min={50}
                                    max={300}
                                    step={5}
                                    className="py-2"
                                />
                                
                                <div className="flex justify-between items-center pt-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ទីតាំង លើ-ក្រោម (Y Offset)</Label>
                                    <span className="text-[10px] font-mono text-slate-500">{wedding?.themeSettings?.customTypographyY || 0}px</span>
                                </div>
                                <Slider
                                    value={[wedding?.themeSettings?.customTypographyY || 0]}
                                    onValueChange={(val) => updateTheme("customTypographyY", val[0])}
                                    min={-150}
                                    max={150}
                                    step={5}
                                    className="py-2"
                                />

                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">កម្រិតស្រមោល (Drop Shadow)</Label>
                                    <select 
                                        className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200/50 bg-white/50 dark:bg-black/50 text-foreground"
                                        value={wedding?.themeSettings?.customTypographyDropShadow || "0px 2px 4px rgba(0,0,0,0.5)"}
                                        onChange={(e) => updateTheme("customTypographyDropShadow", e.target.value)}
                                    >
                                        <option value="none">គ្មានស្រមោល (None)</option>
                                        <option value="0px 2px 4px rgba(0,0,0,0.5)">ធម្មតា (Normal)</option>
                                        <option value="0px 4px 10px rgba(0,0,0,0.8)">ដិតខ្លាំង (Heavy)</option>
                                        <option value="0px 0px 15px rgba(255,255,255,0.6)">ស្រមោលស (White Glow)</option>
                                        <option value="0px 0px 15px rgba(212,175,55,0.6)">ស្រមោលមាស (Gold Glow)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-6 mb-2">
                        <Sparkles className="w-4 h-4 text-teal-500" />
                        <Label className="text-xs font-bold text-foreground block">
                            អក្សរកាត់ឈ្មោះ (Custom Monogram SVG/PNG)
                        </Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                        (Admin Only): Upload SVG ឬ PNG អក្សរកាត់ (ឧទាហរណ៍ S & M)។ វានឹងជំនួសអក្សរកាត់នៅតាមផ្ទាំងផ្សេងៗក្នុង Template។
                    </p>
                    <div className="max-w-xs">
                        <ImageUpload
                            value={wedding?.themeSettings?.customMonogramUrl || ""}
                            onChange={(url, publicId) => {
                                updateTheme("customMonogramUrl", url);
                                updateTheme("customMonogramPublicId", publicId || "");
                            }}
                            onRemove={() => {
                                updateTheme("customMonogramUrl", "");
                                updateTheme("customMonogramPublicId", "");
                            }}
                            label="បញ្ចូលរូបរចនាឈ្មោះកាត់"
                            folder={wedding.id}
                        />
                        
                        {wedding?.themeSettings?.customMonogramUrl && (
                            <div className="mt-4 space-y-3 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ទំហំ (Scale)</Label>
                                    <span className="text-[10px] font-mono text-slate-500">{wedding?.themeSettings?.customMonogramScale || 100}%</span>
                                </div>
                                <Slider
                                    value={[wedding?.themeSettings?.customMonogramScale || 100]}
                                    onValueChange={(val) => updateTheme("customMonogramScale", val[0])}
                                    min={50}
                                    max={300}
                                    step={5}
                                    className="py-2"
                                />
                                
                                <div className="flex justify-between items-center pt-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ទីតាំង លើ-ក្រោម (Y Offset)</Label>
                                    <span className="text-[10px] font-mono text-slate-500">{wedding?.themeSettings?.customMonogramY || 0}px</span>
                                </div>
                                <Slider
                                    value={[wedding?.themeSettings?.customMonogramY || 0]}
                                    onValueChange={(val) => updateTheme("customMonogramY", val[0])}
                                    min={-150}
                                    max={150}
                                    step={5}
                                    className="py-2"
                                />

                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">កម្រិតស្រមោល (Drop Shadow)</Label>
                                    <select 
                                        className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200/50 bg-white/50 dark:bg-black/50 text-foreground"
                                        value={wedding?.themeSettings?.customMonogramDropShadow || "0px 2px 4px rgba(0,0,0,0.5)"}
                                        onChange={(e) => updateTheme("customMonogramDropShadow", e.target.value)}
                                    >
                                        <option value="none">គ្មានស្រមោល (None)</option>
                                        <option value="0px 2px 4px rgba(0,0,0,0.5)">ធម្មតា (Normal)</option>
                                        <option value="0px 4px 10px rgba(0,0,0,0.8)">ដិតខ្លាំង (Heavy)</option>
                                        <option value="0px 0px 15px rgba(255,255,255,0.6)">ស្រមោលស (White Glow)</option>
                                        <option value="0px 0px 15px rgba(212,175,55,0.6)">ស្រមោលមាស (Gold Glow)</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Family / Parents Information */}
            <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-teal-500" />
                        <span>
                            {t("wizard.steps.2.parentsTitle", { defaultValue: "ព័ត៌មានមាតាបិតាទាំងសងខាង" })}
                        </span>
                    </h4>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        អាចបំពេញឈ្មោះឪពុក ឬម្តាយតាមដែលចង់បាន។ វាលទាំងនេះអាចទុកចោលបាន។
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Groom Parents */}
                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block border-b border-slate-200/80 dark:border-white/10 pb-2">
                                មាតាបិតាខាងកូនកំលោះ
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <ParentNameField
                                    id="parent-groom-father"
                                    label={t("wizard.steps.2.father", { defaultValue: "លោកឪពុក" })}
                                    placeholder="ឈ្មោះលោកឪពុក"
                                    value={wedding.themeSettings?.parents?.groomFather ?? wedding.groomFather}
                                    onChange={(value) => updateParent('groomFather', value)}
                                />
                                <ParentNameField
                                    id="parent-groom-mother"
                                    label={t("wizard.steps.2.mother", { defaultValue: "អ្នកម្តាយ" })}
                                    placeholder="ឈ្មោះអ្នកម្តាយ"
                                    value={wedding.themeSettings?.parents?.groomMother ?? wedding.groomMother}
                                    onChange={(value) => updateParent('groomMother', value)}
                                />
                            </div>
                        </div>

                        {/* Bride Parents */}
                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block border-b border-slate-200/80 dark:border-white/10 pb-2">
                                មាតាបិតាខាងកូនក្រមុំ
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <ParentNameField
                                    id="parent-bride-father"
                                    label={t("wizard.steps.2.father", { defaultValue: "លោកឪពុក" })}
                                    placeholder="ឈ្មោះលោកឪពុក"
                                    value={wedding.themeSettings?.parents?.brideFather ?? wedding.brideFather}
                                    onChange={(value) => updateParent('brideFather', value)}
                                />
                                <ParentNameField
                                    id="parent-bride-mother"
                                    label={t("wizard.steps.2.mother", { defaultValue: "អ្នកម្តាយ" })}
                                    placeholder="ឈ្មោះអ្នកម្តាយ"
                                    value={wedding.themeSettings?.parents?.brideMother ?? wedding.brideMother}
                                    onChange={(value) => updateParent('brideMother', value)}
                                />
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default React.memo(Step2Info);
