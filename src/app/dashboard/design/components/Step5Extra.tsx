"use client";
import * as React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload-widget";
import { Palette, Heart, CreditCard, Type, Clock, Sparkles, Loader2, Save, X, RotateCcw, Trash2, Plus, BookOpen, MessageSquare, Eye, Facebook, Send, Globe, Share2, ExternalLink, ChevronDown, ImageIcon } from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import type { WeddingData } from '@/components/templates/types';
import { useTranslation } from "@/i18n/LanguageProvider";

interface Step5ExtraProps {
    wedding: WeddingData;
    updateTheme: (key: string, value: any) => void;
    updateParent: (key: string, value: string) => void;
    updateLabel: (key: string, value: string) => void;
    handleSaveVersion: () => Promise<void>;
    handleRollback: (versionId: string) => Promise<void>;
    handleDeleteVersion: (versionId: string) => Promise<void>;
    fetchVersions: () => Promise<void>;
    templateVersions: any[];
    fetchingVersions: boolean;
    isSavingVersion: boolean;
    newVersionTitle: string;
    setNewVersionTitle: (val: string) => void;
    activeAccordion: string | null;
    setActiveAccordion: (val: string | null) => void;
    PRESET_COLORS: string[];
    packageType?: string | null;
    addGalleryItem: (url: string, publicId?: string, index?: number) => void;
    removeGalleryItem: (index: number) => void;
}

const AccordionItem = ({ icon: Icon, title, subtitle, children, isOpen, onClick }: any) => (
    <div className={clsx(
        "transition-all duration-300",
        isOpen 
            ? "bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl ring-1 ring-slate-100 dark:ring-white/5" 
            : "border-b border-slate-100 dark:border-white/5"
    )}>
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between py-6 px-4 text-left transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                    isOpen 
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" 
                        : "bg-slate-50/50 dark:bg-white/5 text-slate-400 group-hover:bg-rose-500 group-hover:text-white"
                )}>
                    <Icon size={16} />
                </div>
                <div>
                    <h3 className="text-[12px] font-bold text-slate-900 dark:text-white font-kantumruy tracking-tight capitalize">{title}</h3>
                    <p className="text-[9px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className={clsx(
                "transition-transform duration-300 text-slate-300",
                isOpen && "rotate-180 text-rose-500"
            )}>
                <ChevronDown size={14} />
            </div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <div className="px-4 pb-8">
                        {children}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    </div>
);

const Step5Extra: React.FC<Step5ExtraProps> = ({
    wedding,
    updateTheme,
    updateParent,
    updateLabel,
    handleSaveVersion,
    handleRollback,
    handleDeleteVersion,
    fetchVersions,
    templateVersions,
    fetchingVersions,
    isSavingVersion,
    newVersionTitle,
    setNewVersionTitle,
    activeAccordion,
    setActiveAccordion,
    PRESET_COLORS,
    packageType,
    addGalleryItem,
    removeGalleryItem
}) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isPremium = packageType === "PREMIUM";

    // New state and ref for social preview
    const [socialPreviewUrl, setSocialPreviewUrl] = React.useState<string | null>(wedding.themeSettings?.socialPreviewImage || null);
    const socialInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setSocialPreviewUrl(wedding.themeSettings?.socialPreviewImage || null);
    }, [wedding.themeSettings?.socialPreviewImage]);

    const onSocialFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSocialPreviewUrl(reader.result as string);
                updateTheme('socialPreviewImage', reader.result as string); // Update theme with base64 or URL
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 pb-10 font-khmer">
            {/* Header Section */}
            <section className="space-y-1">
                <h3 className="text-lg font-bold font-kantumruy text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {t("wizard.steps.5.title")}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-widest font-medium pl-3.5">{t("wizard.steps.5.subtitle")}</p>
            </section>

            {/* Social Preview / Meta Data */}
            <section className="space-y-6">
                <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        {t("wizard.steps.5.socialTitle")}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium pl-3">{t("wizard.steps.5.socialSubtitle")}</p>
                </div>

                <div className="pl-3 space-y-8">
                    {/* Social Simulator */}
                    <div className="max-w-md bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-[1.91/1] bg-slate-50/50 dark:bg-white/5 relative group cursor-pointer" onClick={() => socialInputRef.current?.click()}>
                            {socialPreviewUrl ? (
                                <Image src={socialPreviewUrl} alt="Social Meta" className="object-cover" fill />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300 group-hover:text-rose-400 transition-colors">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">{t("wizard.steps.5.uploadPreview")}</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-lg text-rose-500 shadow-sm" onClick={(e) => { e.stopPropagation(); socialInputRef.current?.click(); }}><Plus size={14}/></button>
                                {socialPreviewUrl && <button className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-lg text-red-500 shadow-sm" onClick={(e) => { e.stopPropagation(); setSocialPreviewUrl(null); updateTheme('socialPreviewImage', null); }}><Trash2 size={14}/></button>}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 space-y-1">
                            <h5 className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">{wedding.themeSettings?.customLabels?.invite_title || `${wedding.groomName} & ${wedding.brideName}`}</h5>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 line-clamp-2 leading-relaxed">{t("wizard.steps.5.socialPreviewDesc")}</p>
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{t("wizard.steps.5.socialPreviewDomain")}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pl-1">{t("wizard.steps.5.searchTitle")}</Label>
                             <DebouncedInput 
                                placeholder={t("wizard.steps.5.searchPlaceholder")}
                                value={wedding.themeSettings?.customLabels?.invite_title || ""}
                                onDebouncedChange={(val) => updateLabel('invite_title', val as string)}
                                className="h-11 rounded-xl border-none bg-slate-50/50 dark:bg-white/5 focus:ring-1 ring-rose-500/20 text-xs font-medium"
                             />
                        </div>
                        <div className="space-y-2">
                             <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pl-1">{t("wizard.steps.5.passcode")}</Label>
                             <DebouncedInput 
                                placeholder={t("wizard.steps.5.passcodePlaceholder")}
                                value={wedding.themeSettings?.passcode || ""}
                                onDebouncedChange={(val) => updateTheme('passcode', val as string)}
                                className="h-11 rounded-xl border-none bg-slate-50/50 dark:bg-white/5 focus:ring-1 ring-rose-500/20 text-xs font-medium"
                             />
                        </div>
                    </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={socialInputRef} onChange={onSocialFileChange} />
            </section>

            <div className="space-y-2">
                <AccordionItem
                    icon={Palette}
                    title={t("wizard.steps.5.themeTitle")}
                    subtitle={t("wizard.steps.5.themeSubtitle")}
                    isOpen={activeAccordion === 'theme'}
                    onClick={() => setActiveAccordion(activeAccordion === 'theme' ? null : 'theme')}
                >
                    <div className="space-y-8 pt-4">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-6 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t("wizard.steps.5.colorLabel")}</Label>
                                {!isPremium && (
                                    <div className="bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/20">{t("wizard.steps.5.premiumBadge")}</div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-5 gap-4 relative">
                                {!isPremium && (
                                    <div className="absolute inset-x-0 -inset-y-2 z-20 bg-white/20 dark:bg-slate-900/40 backdrop-blur-[1px] rounded-[2rem] flex items-center justify-center border-2 border-dashed border-rose-500/20 cursor-help group/lock" title={t("wizard.steps.5.premiumColorUnlockHint")}>
                                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-full shadow-xl shadow-rose-500/10 group-hover/lock:scale-110 transition-transform text-rose-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </div>
                                    </div>
                                )}
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => isPremium && updateTheme('primaryColor', color)}
                                        disabled={!isPremium}
                                        className={clsx(
                                            "aspect-square rounded-2xl border-4 transition-all hover:scale-110 shadow-sm",
                                            wedding.themeSettings?.primaryColor === color ? "border-rose-500 scale-110 shadow-lg shadow-rose-500/20" : "border-white dark:border-white/10",
                                            !isPremium && "opacity-50"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white dark:border-white/10 shadow-sm group/picker">
                                    <DebouncedInput
                                        type="color"
                                        disabled={!isPremium}
                                        className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer border-none bg-transparent scale-150"
                                        value={wedding.themeSettings?.primaryColor || "#8E5A5A"}
                                        onDebouncedChange={(val) => isPremium && updateTheme('primaryColor', val as string)}
                                    />
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/50 opacity-0 group-hover/picker:opacity-100 transition-opacity">
                                        <Palette size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={BookOpen}
                    title={t("wizard.steps.5.storyTitle")}
                    subtitle={t("wizard.steps.5.storySubtitle")}
                    isOpen={activeAccordion === 'story'}
                    onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}
                >
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                                <Label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.thankYou")}</Label>
                                <DebouncedTextarea
                                    className="min-h-[100px] rounded-2xl border-none bg-white dark:bg-white/5 shadow-inner focus:ring-2 ring-rose-500/10 text-xs py-4 px-4 font-medium leading-relaxed"
                                    value={wedding.themeSettings?.acknowledgment || ""}
                                    onDebouncedChange={(val) => updateTheme('acknowledgment', val)}
                                    placeholder={t("wizard.steps.5.thankYouPlaceholder")}
                                />
                            </div>
                            <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                                <Label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.welcome")}</Label>
                                <DebouncedTextarea
                                    className="min-h-[100px] rounded-2xl border-none bg-white dark:bg-white/5 shadow-inner focus:ring-2 ring-rose-500/10 text-xs py-4 px-4 font-medium leading-relaxed"
                                    value={wedding.themeSettings?.welcomeMessage || ""}
                                    onDebouncedChange={(val) => updateTheme('welcomeMessage', val)}
                                    placeholder={t("wizard.steps.5.welcomePlaceholder")}
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-8">
                            <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">
                                <Heart size={16} /> {t("wizard.steps.5.loveStory")}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.groomStory")}</Label>
                                    <DebouncedTextarea
                                        className="min-h-[140px] rounded-[2rem] border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-rose-500/10 text-[13px] p-6 font-medium leading-[1.8]"
                                        value={wedding.themeSettings?.groomStory || ""}
                                        onDebouncedChange={(val) => updateTheme('groomStory', val)}
                                        placeholder={t("wizard.steps.5.groomStoryPlaceholder")}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.brideStory")}</Label>
                                    <DebouncedTextarea
                                        className="min-h-[140px] rounded-[2rem] border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-rose-500/10 text-[13px] p-6 font-medium leading-[1.8]"
                                        value={wedding.themeSettings?.brideStory || ""}
                                        onDebouncedChange={(val) => updateTheme('brideStory', val)}
                                        placeholder={t("wizard.steps.5.brideStoryPlaceholder")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={MessageSquare}
                    title={t("wizard.steps.5.socialMediaTitle")}
                    subtitle={t("wizard.steps.5.socialMediaSubtitle")}
                    isOpen={activeAccordion === 'social'}
                    onClick={() => setActiveAccordion(activeAccordion === 'social' ? null : 'social')}
                >
                    <div className="pt-4">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Label className="flex items-center gap-3 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Facebook size={16} />
                                    </div>
                                    {t("wizard.steps.5.facebook")}
                                </Label>
                                <DebouncedInput
                                    placeholder={t("wizard.steps.5.facebookPlaceholder")}
                                    value={wedding.themeSettings?.facebookUrl || ""}
                                    onDebouncedChange={(val) => updateTheme('facebookUrl', val as string)}
                                    className="h-14 rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-blue-500/20 font-bold px-6"
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="flex items-center gap-3 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">
                                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
                                        <Send size={16} />
                                    </div>
                                    {t("wizard.steps.5.telegram")}
                                </Label>
                                <DebouncedInput
                                    placeholder={t("wizard.steps.5.telegramPlaceholder")}
                                    value={wedding.themeSettings?.telegramUrl || ""}
                                    onDebouncedChange={(val) => updateTheme('telegramUrl', val as string)}
                                    className="h-14 rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-sky-500/20 font-bold px-6"
                                />
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Eye}
                    title={t("wizard.steps.5.displayTitle")}
                    subtitle={t("wizard.steps.5.displaySubtitle")}
                    isOpen={activeAccordion === 'display'}
                    onClick={() => setActiveAccordion(activeAccordion === 'display' ? null : 'display')}
                >
                    <div className="space-y-10 pt-4">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-6">
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b dark:border-white/5 pb-4 px-1">{t("wizard.steps.5.displaySubtitle")}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { key: 'showStory', label: t("wizard.steps.5.visStory"), icon: Heart },
                                    { key: 'showGallery', label: t("wizard.steps.5.visGallery"), icon: ImageIcon },
                                    { key: 'showTimeline', label: t("wizard.steps.5.visTimeline"), icon: Clock },
                                    { key: 'showGuestbook', label: t("wizard.steps.5.visGuestbook"), icon: MessageSquare }
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50/50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors">
                                                <Icon size={16} />
                                            </div>
                                            <Label className="text-xs font-black text-slate-700 dark:text-white/60 leading-none cursor-pointer" htmlFor={key}>
                                                {label}
                                            </Label>
                                        </div>
                                        <Switch
                                            id={key}
                                            className="data-[state=checked]:bg-rose-500"
                                            checked={wedding.themeSettings?.visibility ? (wedding.themeSettings.visibility as any)[key] !== false : true}
                                            onCheckedChange={(checked) => {
                                                const newVisibility = { ...(wedding.themeSettings?.visibility || {}), [key]: checked };
                                                updateTheme('visibility', newVisibility);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-6">
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b dark:border-white/5 pb-4 px-1">{t("wizard.steps.5.typography")}</h4>
                            <div className="relative">
                                <select
                                    className="w-full h-14 border-none rounded-2xl px-6 bg-white dark:bg-white/5 text-[13px] text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none outline-none"
                                    value={wedding.themeSettings?.fontStyle || 'default'}
                                    onChange={(e) => updateTheme('fontStyle', e.target.value)}
                                >
                                    <option value="default">{t("wizard.steps.5.fontStandard")}</option>
                                    <option value="kantumruy">{t("wizard.steps.5.fontKantumruy")}</option>
                                    <option value="suwannaphum">{t("wizard.steps.5.fontSuwannaphum")}</option>
                                    <option value="battambang">{t("wizard.steps.5.fontBattambang")}</option>
                                    <option value="preahvihear">{t("wizard.steps.5.fontPreahvihear")}</option>
                                </select>
                                <div className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={CreditCard}
                    title={t("wizard.steps.5.paymentTitle")}
                    subtitle={t("wizard.steps.5.paymentSubtitle")}
                    isOpen={activeAccordion === 'payment'}
                    onClick={() => setActiveAccordion(activeAccordion === 'payment' ? null : 'payment')}
                >
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 gap-6">
                            {wedding.themeSettings?.bankAccounts?.map((acc: any, idx: number) => (
                                <m.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx} 
                                    className="bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 relative group"
                                >
                                    <button
                                        onClick={() => {
                                            const newAccs = wedding.themeSettings?.bankAccounts?.filter((_: any, i: number) => i !== idx);
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:shadow-lg transition-all z-10"
                                    >
                                        <X size={14} />
                                    </button>
                                    
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="w-full md:w-1/3 space-y-4">
                                            <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.qrLabel")}</Label>
                                            <ImageUpload
                                                value={acc.qrUrl || ""}
                                                onChange={(url) => {
                                                    const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                    newAccs[idx] = { ...newAccs[idx], qrUrl: url };
                                                    updateTheme('bankAccounts', newAccs);
                                                }}
                                                onRemove={() => {
                                                    const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                    newAccs[idx] = { ...newAccs[idx], qrUrl: "" };
                                                    updateTheme('bankAccounts', newAccs);
                                                }}
                                                folder={wedding.id}
                                            />
                                        </div>
                                        
                                        <div className="flex-1 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.accOwner")}</Label>
                                                    <select
                                                        className="w-full h-12 border-none rounded-2xl px-4 bg-white dark:bg-white/5 text-xs text-slate-900 dark:text-white font-black shadow-sm outline-none appearance-none cursor-pointer"
                                                        value={acc.side || 'groom'}
                                                        onChange={(e) => {
                                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                            newAccs[idx] = { ...newAccs[idx], side: e.target.value };
                                                            updateTheme('bankAccounts', newAccs);
                                                        }}
                                                    >
                                                        <option value="groom">{t("wizard.steps.2.groomSide")}</option>
                                                        <option value="bride">{t("wizard.steps.2.brideSide")}</option>
                                                        <option value="both">{t("wizard.steps.5.bothSides")}</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.bank")}</Label>
                                                    <select
                                                        className="w-full h-12 border-none rounded-2xl px-4 bg-white dark:bg-white/5 text-xs text-slate-900 dark:text-white font-black shadow-sm outline-none appearance-none cursor-pointer"
                                                        value={acc.bankName}
                                                        onChange={(e) => {
                                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                            newAccs[idx] = { ...newAccs[idx], bankName: e.target.value };
                                                            updateTheme('bankAccounts', newAccs);
                                                        }}
                                                    >
                                                        <option value="KHQR">KHQR (Bakong)</option>
                                                        <option value="ACLEDA Bank">ACLEDA Bank</option>
                                                        <option value="ABA Bank">ABA Bank</option>
                                                        <option value="Wing Bank">Wing Bank</option>
                                                        <option value="Other">{t("wizard.steps.5.otherBank")}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.accName")}</Label>
                                                        <DebouncedInput
                                                            placeholder={t("wizard.steps.5.accName")}
                                                            className="h-12 text-xs rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm font-bold px-5"
                                                            value={acc.accountName}
                                                            onDebouncedChange={(val) => {
                                                                const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                                newAccs[idx] = { ...newAccs[idx], accountName: val as string };
                                                                updateTheme('bankAccounts', newAccs);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.accNumber")}</Label>
                                                        <DebouncedInput
                                                            placeholder={t("wizard.steps.5.accNumber")}
                                                            className="h-12 text-xs rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm font-bold px-5"
                                                            value={acc.accountNumber}
                                                            onDebouncedChange={(val) => {
                                                                const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                                newAccs[idx] = { ...newAccs[idx], accountNumber: val as string };
                                                                updateTheme('bankAccounts', newAccs);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </m.div>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => {
                                const newAccs = [...(wedding.themeSettings?.bankAccounts || []), { side: "bride", bankName: "KHQR", accountName: "", accountNumber: "", qrUrl: "" }];
                                updateTheme('bankAccounts', newAccs);
                            }}
                            className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5 hover:border-rose-300 dark:hover:border-rose-500/30 hover:bg-rose-50/30 dark:hover:bg-rose-500/5 transition-all flex flex-col items-center gap-3 text-slate-400 hover:text-rose-500 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-rose-500/10 transition-colors">
                                <Plus size={20} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">{t("wizard.steps.5.addBank")}</span>
                        </button>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Type}
                    title={t("wizard.steps.5.labelsTitle")}
                    subtitle={t("wizard.steps.5.labelsSubtitle")}
                    isOpen={activeAccordion === 'labels'}
                    onClick={() => setActiveAccordion(activeAccordion === 'labels' ? null : 'labels')}
                >
                    <div className="space-y-8 pt-4">
                        {[
                            {
                                title: t("wizard.steps.5.labelBannerSection"),
                                fields: [
                                    { key: 'invite_title', label: t("wizard.steps.5.labelInviteHeader"), type: 'input' },
                                    { key: 'hero_subtitle', label: t("wizard.steps.5.labelHeroSubtitle"), type: 'input' },
                                    { key: 'hero_button', label: t("wizard.steps.5.labelHeroButton"), type: 'input' },
                                    { key: 'andLabel', label: t("wizard.steps.5.labelAndLabel"), type: 'input' },
                                    { key: 'invitationBadge', label: t("wizard.steps.5.labelInvitationBadge"), type: 'input' },
                                    { key: 'invitationTitle', label: t("wizard.steps.5.labelInvitationTitle"), type: 'input' },
                                    { key: 'invitationHonorTitle', label: t("wizard.steps.5.labelInvitationHonorTitle"), type: 'input' },
                                    { key: 'invitationText', label: t("wizard.steps.5.labelInvitationText"), type: 'textarea' }
                                ]
                            },
                            {
                                title: t("wizard.steps.5.labelLocationSection"),
                                fields: [
                                    { key: 'locationTitle', label: t("wizard.steps.5.labelLocationTitle"), type: 'input' },
                                    { key: 'locationSubtitle', label: t("wizard.steps.5.labelLocationSubtitle"), type: 'input' },
                                    { key: 'locationCardLabel', label: t("wizard.steps.5.labelLocationCardLabel"), type: 'input' },
                                    { key: 'countdownLabel', label: t("wizard.steps.5.labelCountdownLabel"), type: 'input' }
                                ]
                            },
                            {
                                title: t("wizard.steps.5.labelGallerySection"),
                                fields: [
                                    { key: 'gallery_title', label: t("wizard.steps.5.labelGalleryTitle"), type: 'input' },
                                    { key: 'gallerySubtitle', label: t("wizard.steps.5.labelGallerySubtitle"), type: 'input' },
                                    { key: 'giftTitle', label: t("wizard.steps.5.labelGiftTitle"), type: 'input' },
                                    { key: 'giftBadge', label: t("wizard.steps.5.labelGiftBadge"), type: 'input' },
                                    { key: 'giftCopyBtn', label: t("wizard.steps.5.labelGiftCopyBtn"), type: 'input' },
                                    { key: 'rsvpSubmittedText', label: t("wizard.steps.5.labelRsvpSubmittedText"), type: 'input' }
                                ]
                            }
                        ].map((section, sIdx) => (
                            <m.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: sIdx * 0.1 }}
                                key={sIdx}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30" />
                                    <h5 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] italic">{section.title}</h5>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 dark:bg-white/[0.02] p-6 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5">
                                    {section.fields.map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pl-1">{field.label}</Label>
                                            {field.type === 'textarea' ? (
                                                <DebouncedTextarea
                                                    placeholder={field.label}
                                                    value={field.key === 'invitationText' ? (wedding.themeSettings?.invitationText || "") : ((wedding.themeSettings?.customLabels as any)?.[field.key] || "")}
                                                    onDebouncedChange={(val) => field.key === 'invitationText' ? updateTheme('invitationText', val) : updateLabel(field.key, val)}
                                                    className="min-h-[80px] rounded-xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-1 ring-rose-500/20 text-xs font-medium leading-relaxed"
                                                />
                                            ) : (
                                                <DebouncedInput
                                                    placeholder={field.label}
                                                    value={(wedding.themeSettings?.customLabels as any)?.[field.key] || ""}
                                                    onDebouncedChange={(val) => updateLabel(field.key, val as string)}
                                                    className="h-10 rounded-xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-1 ring-rose-500/20 text-xs font-medium"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </m.div>
                        ))}
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Clock}
                    title={t("wizard.steps.5.historyTitle")}
                    subtitle={t("wizard.steps.5.historySubtitle")}
                    isOpen={activeAccordion === 'history'}
                    onClick={() => {
                        const isOpen = activeAccordion === 'history';
                        setActiveAccordion(isOpen ? null : 'history');
                        if (!isOpen) fetchVersions();
                    }}
                >
                    <div className="space-y-8 pt-4">
                        <m.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-50/50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm"
                        >
                            <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.saveVersion")}</Label>
                            <div className="flex gap-3">
                                <Input
                                    placeholder={t("wizard.steps.5.versionPlaceholder")}
                                    value={newVersionTitle}
                                    onChange={(e) => setNewVersionTitle(e.target.value)}
                                    className="h-14 rounded-2xl border-none bg-white dark:bg-white/10 shadow-sm font-bold px-6 text-sm focus:ring-2 ring-rose-500/10 flex-1"
                                />
                                <button
                                    onClick={handleSaveVersion}
                                    disabled={isSavingVersion || !newVersionTitle}
                                    className="w-14 h-14 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-white/10 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 transition-all active:scale-95 shrink-0"
                                >
                                    {isSavingVersion ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                </button>
                            </div>
                        </m.div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1 flex items-center gap-3">
                                <Clock size={14} /> {t("wizard.steps.5.savedList")}
                            </Label>
                            
                            {fetchingVersions ? (
                                <div className="flex flex-col items-center py-12 gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={16} className="text-rose-500/20" />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("wizard.steps.5.loading")}</span>
                                </div>
                            ) : templateVersions.length === 0 ? (
                                <div className="bg-slate-50/50 dark:bg-white/5 py-12 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
                                    <RotateCcw size={32} className="text-slate-200 dark:text-white/5" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("wizard.steps.5.noVersions")}</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {templateVersions.map((ver, idx) => (
                                        <m.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={ver.id}
                                            className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors shrink-0">
                                                    <Clock size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-[13px] font-black text-slate-900 dark:text-white font-kantumruy tracking-tight truncate pr-4">{ver.versionName}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5 opacity-40">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {mounted ? new Date(ver.createdAt).toLocaleString(t("common.constants.locale") || 'km-KH', { timeZone: 'Asia/Phnom_Penh' }) : '...'}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{t("common.actions.save")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button
                                                    onClick={() => handleRollback(ver.id)}
                                                    className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:shadow-lg shadow-emerald-500/20 transition-all"
                                                    title={t("wizard.steps.5.rollback")}
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVersion(ver.id)}
                                                    className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:shadow-lg shadow-red-500/20 transition-all"
                                                    title={t("wizard.steps.5.delete")}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </m.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </AccordionItem>
            </div>
        </div>
    );
};

export default React.memo(Step5Extra);
