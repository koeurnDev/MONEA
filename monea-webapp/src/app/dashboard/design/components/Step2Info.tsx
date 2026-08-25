import React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import ImageUpload from "@/components/ui/image-upload-widget";
import { Users, Heart, Sparkles, MessageSquareHeart } from "lucide-react";
import type { WeddingData } from '@/components/templates/types';
import { useTranslation } from "@/i18n/LanguageProvider";

interface Step2InfoProps {
    wedding: WeddingData;
    updateWedding: (key: keyof WeddingData, value: any) => void;
    updateTheme: (key: string, value: any) => void;
    updateParent: (key: string, value: string) => void;
    updateLabel: (key: string, value: string) => void;
    addGalleryItem: (url: string, publicId?: string, index?: number) => void;
    removeGalleryItem: (index: number) => void;
}

const Step2Info: React.FC<Step2InfoProps> = ({ 
    wedding, 
    updateWedding, 
    updateTheme,
    updateParent,
    updateLabel,
    addGalleryItem,
    removeGalleryItem
}) => {
    const { t } = useTranslation();
    const isAnniv = wedding.eventType === 'anniversary';

    return (
        <div className="space-y-8 font-kantumruy">
            {/* Header info banner */}
            <div className="bg-rose-500/5 p-5 rounded-3xl border border-rose-500/10 shadow-sm relative overflow-hidden">
                <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                    {t("wizard.steps.2.coupleTitle", { defaultValue: "ព័ត៌មានរបស់គូស្នេហ៍" })}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAnniv 
                        ? t("wizard.steps.2.coupleSubtitleAnniv", { defaultValue: "បញ្ចូលឈ្មោះ និងរូបថតគូដណ្តឹងទាំងសងខាង" }) 
                        : t("wizard.steps.2.coupleSubtitle", { defaultValue: "បញ្ចូលឈ្មោះ និងរូបថតកូនកំលោះ និងកូនក្រមុំ" })}
                </p>
            </div>

            {/* 1. Couple Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Groom / Husband */}
                <div className="space-y-4 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground block">
                            {isAnniv ? t("wizard.steps.2.husbandName", { defaultValue: "ឈ្មោះគូដណ្តឹង (ខាងប្រុស)" }) : t("wizard.steps.2.groomName", { defaultValue: "ឈ្មោះកូនកំលោះ" })} <span className="text-rose-500">*</span>
                        </Label>
                        <DebouncedInput
                            value={wedding.groomName}
                            onDebouncedChange={(val) => updateWedding("groomName", val)}
                            className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm"
                            placeholder={isAnniv ? t("wizard.steps.2.husbandPlaceholder", { defaultValue: "បញ្ចូលឈ្មោះគូដណ្តឹងខាងប្រុស" }) : t("wizard.steps.2.groomPlaceholder", { defaultValue: "បញ្ចូលឈ្មោះកូនកំលោះ" })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-muted-foreground block">{t("wizard.steps.2.photo", { defaultValue: "រូបថត" })}</Label>
                        <ImageUpload
                            value={wedding?.galleryItems?.[9]?.url || ""}
                            onChange={(url, publicId) => addGalleryItem(url, publicId, 9)}
                            onRemove={() => removeGalleryItem(9)}
                            label={isAnniv ? "រូបថតគូដណ្តឹង (ខាងប្រុស)" : "រូបថតកូនកំលោះ"}
                            folder={wedding.id}
                        />
                    </div>
                </div>

                {/* Bride / Wife */}
                <div className="space-y-4 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-foreground block">
                            {isAnniv ? t("wizard.steps.2.wifeName", { defaultValue: "ឈ្មោះគូដណ្តឹង (ខាងស្រី)" }) : t("wizard.steps.2.brideName", { defaultValue: "ឈ្មោះកូនក្រមុំ" })} <span className="text-rose-500">*</span>
                        </Label>
                        <DebouncedInput
                            value={wedding.brideName}
                            onDebouncedChange={(val) => updateWedding("brideName", val)}
                            className="h-11 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 font-bold text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm"
                            placeholder={isAnniv ? t("wizard.steps.2.wifePlaceholder", { defaultValue: "បញ្ចូលឈ្មោះគូដណ្តឹងខាងស្រី" }) : t("wizard.steps.2.bridePlaceholder", { defaultValue: "បញ្ចូលឈ្មោះកូនក្រមុំ" })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-muted-foreground block">{t("wizard.steps.2.photo", { defaultValue: "រូបថត" })}</Label>
                        <ImageUpload
                            value={wedding?.galleryItems?.[10]?.url || ""}
                            onChange={(url, publicId) => addGalleryItem(url, publicId, 10)}
                            onRemove={() => removeGalleryItem(10)}
                            label={isAnniv ? "រូបថតគូដណ្តឹង (ខាងស្រី)" : "រូបថតកូនក្រមុំ"}
                            folder={wedding.id}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Vows & Messages */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageSquareHeart className="w-4 h-4 text-rose-500" />
                    <span>{isAnniv ? "សារជូនពរ និងពាក្យស្លោក" : "ពាក្យសច្ចាប្រណិធាន (Vows)"}</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground">
                            {isAnniv ? "ពាក្យជូនពរពីស្វាមី" : "ពាក្យសច្ចាកូនកំលោះ"}
                        </Label>
                        <DebouncedTextarea
                            className="min-h-[90px] rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm"
                            value={wedding.themeSettings?.groomVow || ""}
                            onDebouncedChange={(val) => updateTheme('groomVow', val)}
                            placeholder="បញ្ចូលពាក្យពេចន៍ជូនពរ..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground">
                            {isAnniv ? "ពាក្យជូនពរពីភរិយា" : "ពាក្យសច្ចាកូនក្រមុំ"}
                        </Label>
                        <DebouncedTextarea
                            className="min-h-[90px] rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm"
                            value={wedding.themeSettings?.brideVow || ""}
                            onDebouncedChange={(val) => updateTheme('brideVow', val)}
                            placeholder="បញ្ចូលពាក្យពេចន៍ជូនពរ..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">{t("wizard.steps.2.quoteLabel", { defaultValue: "ពាក្យស្លោកស្នេហា (Main Quote)" })}</Label>
                    <DebouncedTextarea
                        className="min-h-[70px] rounded-xl bg-rose-50/40 dark:bg-rose-500/5 border border-rose-200/50 dark:border-rose-500/10 p-3 text-center italic text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm"
                        value={wedding.themeSettings?.mainQuote || ""}
                        onDebouncedChange={(val) => updateTheme('mainQuote', val)}
                        placeholder="ឧ. ស្នេហាពិត គឺការរួមដំណើរជាមួយគ្នាជារៀងរហូត..."
                    />
                </div>
            </div>

            {/* 3. Family / Parents Information */}
            {!isAnniv && (
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <Users className="w-4 h-4 text-rose-500" />
                        <span>{t("wizard.steps.2.parentsTitle", { defaultValue: "ព័ត៌មានមាតាបិតាទាំងសងខាង" })}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Groom Parents */}
                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block border-b border-slate-200/80 dark:border-white/10 pb-2">
                                មាតាបិតាខាងកូនកំលោះ
                            </span>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-muted-foreground">{t("wizard.steps.2.father", { defaultValue: "លោកឪពុក" })}</Label>
                                <DebouncedInput 
                                    placeholder="ឈ្មោះលោកឪពុក" 
                                    className="h-10 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                    value={wedding.themeSettings?.parents?.groomFather || ""} 
                                    onDebouncedChange={(val) => updateParent('groomFather', val as string)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-muted-foreground">{t("wizard.steps.2.mother", { defaultValue: "អ្នកម្តាយ" })}</Label>
                                <DebouncedInput 
                                    placeholder="ឈ្មោះអ្នកម្តាយ" 
                                    className="h-10 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                    value={wedding.themeSettings?.parents?.groomMother || ""} 
                                    onDebouncedChange={(val) => updateParent('groomMother', val as string)} 
                                />
                            </div>
                        </div>

                        {/* Bride Parents */}
                        <div className="space-y-3 bg-slate-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block border-b border-slate-200/80 dark:border-white/10 pb-2">
                                មាតាបិតាខាងកូនក្រមុំ
                            </span>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-muted-foreground">{t("wizard.steps.2.father", { defaultValue: "លោកឪពុក" })}</Label>
                                <DebouncedInput 
                                    placeholder="ឈ្មោះលោកឪពុក" 
                                    className="h-10 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                    value={wedding.themeSettings?.parents?.brideFather || ""} 
                                    onDebouncedChange={(val) => updateParent('brideFather', val as string)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-muted-foreground">{t("wizard.steps.2.mother", { defaultValue: "អ្នកម្តាយ" })}</Label>
                                <DebouncedInput 
                                    placeholder="ឈ្មោះអ្នកម្តាយ" 
                                    className="h-10 rounded-xl bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                    value={wedding.themeSettings?.parents?.brideMother || ""} 
                                    onDebouncedChange={(val) => updateParent('brideMother', val as string)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default React.memo(Step2Info);
