"use client";
import * as React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { Switch } from "@/components/ui/switch";
import { Palette, Heart, CreditCard, Type, Clock, BookOpen, MessageSquare, Eye, Facebook, Send, ChevronDown, ImageIcon, Trash2, Plus } from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import type { WeddingData } from '@/components/templates/types';
import { useTranslation } from "@/i18n/LanguageProvider";
import { AccordionItem } from "./sections/AccordionItem";
import { PaymentSection } from "./sections/PaymentSection";
import { LabelsSection } from "./sections/LabelsSection";
import { HistorySection } from "./sections/HistorySection";

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
    const isAnniv = wedding.eventType === 'anniversary';
    React.useEffect(() => { setMounted(true); }, []);

    const isPremium = packageType === "PREMIUM";

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
                updateTheme('socialPreviewImage', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8 pb-10 font-khmer">
            {/* Header */}
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
                            <p className="text-[10px] text-slate-500 dark:text-white/40 line-clamp-2 leading-relaxed">
                                {isAnniv ? t("wizard.steps.5.socialPreviewDescAnniv", { defaultValue: "សូមចូលរួមអបអរសាទរថ្ងៃខួបអាពាហ៍ពិពាហ៍របស់យើង..." }) : t("wizard.steps.5.socialPreviewDesc")}
                            </p>
                            <span className="text-[9px] text-slate-400 uppercase tracking-tighter">{t("wizard.steps.5.socialPreviewDomain")}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 pl-1">{t("wizard.steps.5.searchTitle")}</Label>
                            <DebouncedInput
                                placeholder={isAnniv ? t("wizard.steps.5.searchPlaceholderAnniv", { defaultValue: "ឧ. ខួបអាពាហ៍ពិពាហ៍របស់ (ឈ្មោះស្វាមី) និង (ឈ្មោះភរិយា)" }) : t("wizard.steps.5.searchPlaceholder")}
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
                {/* Theme Color */}
                <AccordionItem
                    icon={Palette}
                    title={t("wizard.steps.5.themeTitle")}
                    subtitle={isAnniv ? t("wizard.steps.5.themeSubtitleAnniv", { defaultValue: "ជ្រើសរើសពណ៌ចម្បងសម្រាប់កម្មវិធីខួបរបស់អ្នក" }) : t("wizard.steps.5.themeSubtitle")}
                    isOpen={activeAccordion === 'theme'}
                    onClick={() => setActiveAccordion(activeAccordion === 'theme' ? null : 'theme')}
                >
                    <div className="space-y-8 pt-4">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-6 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t("wizard.steps.5.colorLabel")}</Label>
                                {!isPremium && <div className="bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm shadow-rose-500/20">{t("wizard.steps.5.premiumBadge")}</div>}
                            </div>
                            <div className="grid grid-cols-5 gap-2 md:gap-4 relative">
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
                                        className={clsx("aspect-square rounded-2xl border-4 transition-all hover:scale-110 shadow-sm", wedding.themeSettings?.primaryColor === color ? "border-rose-500 scale-110 shadow-lg shadow-rose-500/20" : "border-white dark:border-white/10", !isPremium && "opacity-50")}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white dark:border-white/10 shadow-sm group/picker">
                                    <DebouncedInput type="color" disabled={!isPremium} className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer border-none bg-transparent scale-150" value={wedding.themeSettings?.primaryColor || "#8E5A5A"} onDebouncedChange={(val) => isPremium && updateTheme('primaryColor', val as string)} />
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-white/50 opacity-0 group-hover/picker:opacity-100 transition-opacity"><Palette size={14} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* Love Story */}
                <AccordionItem icon={BookOpen} title={t("wizard.steps.5.storyTitle")} subtitle={t("wizard.steps.5.storySubtitle")} isOpen={activeAccordion === 'story'} onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}>
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50/50 dark:bg-white/5 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                                <Label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.thankYou")}</Label>
                                <DebouncedTextarea className="min-h-[100px] rounded-2xl border-none bg-white dark:bg-white/5 shadow-inner focus:ring-2 ring-rose-500/10 text-xs py-4 px-4 font-medium leading-relaxed" value={wedding.themeSettings?.acknowledgment || ""} onDebouncedChange={(val) => updateTheme('acknowledgment', val)} placeholder={t("wizard.steps.5.thankYouPlaceholder")} />
                            </div>
                            <div className="bg-slate-50/50 dark:bg-white/5 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                                <Label className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">{t("wizard.steps.5.welcome")}</Label>
                                <DebouncedTextarea className="min-h-[100px] rounded-2xl border-none bg-white dark:bg-white/5 shadow-inner focus:ring-2 ring-rose-500/10 text-xs py-4 px-4 font-medium leading-relaxed" value={wedding.themeSettings?.welcomeMessage || ""} onDebouncedChange={(val) => updateTheme('welcomeMessage', val)} placeholder={t("wizard.steps.5.welcomePlaceholder")} />
                            </div>
                        </div>
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-8">
                            <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3"><Heart size={16} /> {t("wizard.steps.5.loveStory")}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.groomStory")}</Label>
                                    <DebouncedTextarea className="min-h-[140px] rounded-[2rem] border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-rose-500/10 text-[13px] p-6 font-medium leading-[1.8]" value={wedding.themeSettings?.groomStory || ""} onDebouncedChange={(val) => updateTheme('groomStory', val)} placeholder={t("wizard.steps.5.groomStoryPlaceholder")} />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] px-1 italic">— {t("wizard.steps.5.brideStory")}</Label>
                                    <DebouncedTextarea className="min-h-[140px] rounded-[2rem] border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-rose-500/10 text-[13px] p-6 font-medium leading-[1.8]" value={wedding.themeSettings?.brideStory || ""} onDebouncedChange={(val) => updateTheme('brideStory', val)} placeholder={t("wizard.steps.5.brideStoryPlaceholder")} />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* Social Media */}
                <AccordionItem icon={MessageSquare} title={t("wizard.steps.5.socialMediaTitle")} subtitle={t("wizard.steps.5.socialMediaSubtitle")} isOpen={activeAccordion === 'social'} onClick={() => setActiveAccordion(activeAccordion === 'social' ? null : 'social')}>
                    <div className="pt-4">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-4">
                                <Label className="flex items-center gap-3 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20"><Facebook size={16} /></div>
                                    {t("wizard.steps.5.facebook")}
                                </Label>
                                <DebouncedInput placeholder={t("wizard.steps.5.facebookPlaceholder")} value={wedding.themeSettings?.facebookUrl || ""} onDebouncedChange={(val) => updateTheme('facebookUrl', val as string)} className="h-14 rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-blue-500/20 font-bold px-6" />
                            </div>
                            <div className="space-y-4">
                                <Label className="flex items-center gap-3 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">
                                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20"><Send size={16} /></div>
                                    {t("wizard.steps.5.telegram")}
                                </Label>
                                <DebouncedInput placeholder={t("wizard.steps.5.telegramPlaceholder")} value={wedding.themeSettings?.telegramUrl || ""} onDebouncedChange={(val) => updateTheme('telegramUrl', val as string)} className="h-14 rounded-2xl border-none bg-white dark:bg-white/5 shadow-sm focus:ring-2 ring-sky-500/20 font-bold px-6" />
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* Display & Typography */}
                <AccordionItem icon={Eye} title={t("wizard.steps.5.displayTitle")} subtitle={t("wizard.steps.5.displaySubtitle")} isOpen={activeAccordion === 'display'} onClick={() => setActiveAccordion(activeAccordion === 'display' ? null : 'display')}>
                    <div className="space-y-10 pt-4">
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-6">
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
                                            <div className="w-8 h-8 rounded-lg bg-slate-50/50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-colors"><Icon size={16} /></div>
                                            <Label className="text-xs font-black text-slate-700 dark:text-white/60 leading-none cursor-pointer" htmlFor={key}>{label}</Label>
                                        </div>
                                        <Switch id={key} className="data-[state=checked]:bg-rose-500" checked={wedding.themeSettings?.visibility ? (wedding.themeSettings.visibility as any)[key] !== false : true} onCheckedChange={(checked) => { const newVisibility = { ...(wedding.themeSettings?.visibility || {}), [key]: checked }; updateTheme('visibility', newVisibility); }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-5 md:p-8 rounded-2xl ring-1 ring-slate-100 dark:ring-white/5 space-y-6">
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b dark:border-white/5 pb-4 px-1">{t("wizard.steps.5.typography")}</h4>
                            <div className="relative">
                                <select className="w-full h-14 border-none rounded-2xl px-6 bg-white dark:bg-white/5 text-[13px] text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none outline-none" value={wedding.themeSettings?.fontStyle || 'default'} onChange={(e) => updateTheme('fontStyle', e.target.value)}>
                                    <option value="default">{t("wizard.steps.5.fontStandard")}</option>
                                    <option value="kantumruy">{t("wizard.steps.5.fontKantumruy")}</option>
                                    <option value="suwannaphum">{t("wizard.steps.5.fontSuwannaphum")}</option>
                                    <option value="battambang">{t("wizard.steps.5.fontBattambang")}</option>
                                    <option value="preahvihear">{t("wizard.steps.5.fontPreahvihear")}</option>
                                </select>
                                <div className="absolute top-1/2 right-6 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                            </div>
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] border-b dark:border-white/5 pb-4 px-1 mt-6">រចនាឈ្មោះកូនកំលោះ-ក្រមុំ (Couple Names)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">ប្រភេទអក្សរ (Font Style)</label>
                                    <select className="w-full h-14 border-none rounded-2xl px-6 bg-white dark:bg-white/5 text-[13px] text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none outline-none" value={wedding.themeSettings?.nameFont || 'suwannaphum'} onChange={(e) => updateTheme('nameFont', e.target.value)}>
                                        <option value="suwannaphum">Suwannaphum (ស្តើងស្រឡះ)</option>
                                        <option value="moul">Khmer Moul (មូលដិត)</option>
                                        <option value="kantumruy">Kantumruy (ធម្មតា)</option>
                                    </select>
                                    <div className="absolute top-[42px] right-6 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                                </div>
                                <div className="relative">
                                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">ពាក្យភ្ជាប់ (Separator)</label>
                                    <select className="w-full h-14 border-none rounded-2xl px-6 bg-white dark:bg-white/5 text-[13px] text-slate-900 dark:text-white font-black focus:ring-2 focus:ring-rose-500/20 shadow-sm appearance-none outline-none" value={wedding.themeSettings?.nameSeparator || 'and'} onChange={(e) => updateTheme('nameSeparator', e.target.value)}>
                                        <option value="and">ពាក្យ &quot;និង&quot;</option>
                                        <option value="ampersand">សញ្ញា &quot;&amp;&quot;</option>
                                        <option value="heart">សញ្ញាបេះដូង &quot;♥&quot;</option>
                                    </select>
                                    <div className="absolute top-[42px] right-6 -translate-y-1/2 pointer-events-none text-slate-400"><ChevronDown size={18} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* Payment — sub-component */}
                <AccordionItem icon={CreditCard} title={t("wizard.steps.5.paymentTitle")} subtitle={t("wizard.steps.5.paymentSubtitle")} isOpen={activeAccordion === 'payment'} onClick={() => setActiveAccordion(activeAccordion === 'payment' ? null : 'payment')}>
                    <PaymentSection wedding={wedding} updateTheme={updateTheme} t={t} />
                </AccordionItem>

                {/* Labels — sub-component */}
                <AccordionItem icon={Type} title={t("wizard.steps.5.labelsTitle")} subtitle={t("wizard.steps.5.labelsSubtitle")} isOpen={activeAccordion === 'labels'} onClick={() => setActiveAccordion(activeAccordion === 'labels' ? null : 'labels')}>
                    <LabelsSection wedding={wedding} updateTheme={updateTheme} updateLabel={updateLabel} t={t} />
                </AccordionItem>

                {/* Version History — sub-component */}
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
                    <HistorySection
                        handleSaveVersion={handleSaveVersion}
                        handleRollback={handleRollback}
                        handleDeleteVersion={handleDeleteVersion}
                        templateVersions={templateVersions}
                        fetchingVersions={fetchingVersions}
                        isSavingVersion={isSavingVersion}
                        newVersionTitle={newVersionTitle}
                        setNewVersionTitle={setNewVersionTitle}
                        mounted={mounted}
                        t={t}
                    />
                </AccordionItem>
            </div>
        </div>
    );
};

export default React.memo(Step5Extra);
