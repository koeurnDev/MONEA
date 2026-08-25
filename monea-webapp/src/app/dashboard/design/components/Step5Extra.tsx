import * as React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
    Palette, Heart, CreditCard, Type, Clock, BookOpen, 
    MessageSquare, Eye, Facebook, Send, ChevronDown, ImageIcon, 
    Trash2, Plus, Info, Settings, Sparkles, Share2, Lock
} from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from 'framer-motion';
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
        <div className="space-y-6 font-kantumruy">
            {/* Social Share & Link Preview */}
            <section className="space-y-4 bg-white dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-rose-500" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {t("wizard.steps.5.socialTitle", { defaultValue: "ការចែករំលែកលើបណ្តាញសង្គម (Social Preview)" })}
                    </h4>
                </div>

                <div className="space-y-4">
                    {/* Social Meta Card Preview */}
                    <div className="max-w-md bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
                        <div 
                            className="aspect-[1.91/1] bg-slate-100 dark:bg-white/5 relative group cursor-pointer"
                            onClick={() => socialInputRef.current?.click()}
                        >
                            {socialPreviewUrl ? (
                                <img src={socialPreviewUrl} alt="Social Meta" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground group-hover:text-rose-500 transition-colors">
                                    <ImageIcon size={28} />
                                    <span className="text-xs font-bold">ចុចដើម្បីដាក់រូបភាព Share Preview</span>
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" className="p-2 bg-white dark:bg-slate-900 rounded-xl text-rose-600 shadow-md" onClick={(e) => { e.stopPropagation(); socialInputRef.current?.click(); }}>
                                    <Plus size={14} />
                                </button>
                                {socialPreviewUrl && (
                                    <button type="button" className="p-2 bg-white dark:bg-slate-900 rounded-xl text-rose-600 shadow-md" onClick={(e) => { e.stopPropagation(); setSocialPreviewUrl(null); updateTheme('socialPreviewImage', null); }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-3.5 bg-white dark:bg-white/[0.02] border-t border-slate-200/80 dark:border-white/10 space-y-1">
                            <h5 className="text-xs font-bold text-foreground truncate">
                                {wedding.themeSettings?.customLabels?.invite_title || `${wedding.groomName || 'កូនកំលោះ'} & ${wedding.brideName || 'កូនក្រមុំ'}`}
                            </h5>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                                {isAnniv ? "សូមគោរពអញ្ជើញចូលរួមកម្មវិធីភ្ជាប់ពាក្យ..." : "សូមគោរពអញ្ជើញឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី..."}
                            </p>
                            <span className="text-[10px] text-rose-500 font-mono font-bold block">monea.me</span>
                        </div>
                    </div>

                    <div className="space-y-3.5">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">ចំណងជើងពេលផ្ញើ Link (Title)</Label>
                            <DebouncedInput
                                placeholder={isAnniv ? "ឧ. សិរីសួស្តី ពិធីភ្ជាប់ពាក្យ" : "ឧ. សិរីសួស្តី អាពាហ៍ពិពាហ៍ សុខ សាន្ត & គង់ សុជាតា"}
                                value={wedding.themeSettings?.customLabels?.invite_title || ""}
                                onDebouncedChange={(val) => updateLabel('invite_title', val as string)}
                                className="h-11 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-xs font-bold text-foreground px-3.5 shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <Label className="text-xs font-bold text-foreground">លេខកូដសម្ងាត់មើលធៀប (Passcode)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="text-muted-foreground hover:text-rose-500 transition-colors"><Info size={13} /></button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-xl rounded-xl text-xs font-kantumruy">
                                        បើអ្នកចង់ឱ្យភ្ញៀវបញ្ចូលលេខកូដទើបអាចបើកមើលធៀបបាន សូមដាក់លេខកូដនៅទីនេះ។ បើមិនត្រូវការទេ សូមទុកទទេ (Optional)។
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <DebouncedInput
                                placeholder="ទុកចន្លោះទំនេរ បើមិនចង់ចាក់សោ (Optional)"
                                value={wedding.themeSettings?.passcode || ""}
                                onDebouncedChange={(val) => updateTheme('passcode', val as string)}
                                className="h-11 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-xs font-mono font-bold text-foreground px-3.5 shadow-sm"
                            />
                        </div>
                    </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={socialInputRef} onChange={onSocialFileChange} />
            </section>

            {/* Accordion Settings Sections */}
            <div className="space-y-3">
                {/* 1. Theme Color */}
                <AccordionItem
                    icon={Palette}
                    title="ពណ៌ចម្បង (Theme Color)"
                    subtitle="ជ្រើសរើសពណ៌ចម្បងសម្រាប់ធៀបការរបស់អ្នក"
                    isOpen={activeAccordion === 'theme'}
                    onClick={() => setActiveAccordion(activeAccordion === 'theme' ? null : 'theme')}
                >
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-foreground">ក្ដារពណ៌ (Preset Colors)</Label>
                            {!isPremium && (
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
                                    PRO / PREMIUM
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-6 gap-2.5">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => updateTheme('primaryColor', color)}
                                    className={clsx(
                                        "aspect-square rounded-2xl border-2 transition-all hover:scale-105 shadow-sm",
                                        wedding.themeSettings?.primaryColor === color 
                                            ? "border-rose-600 scale-110 ring-2 ring-rose-500/20 shadow-md" 
                                            : "border-slate-200/80 dark:border-white/10"
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </AccordionItem>

                {/* 2. Payment & Registry */}
                <AccordionItem 
                    icon={CreditCard} 
                    title="គណនីធនាគារ & KHQR (Gift Registry)" 
                    subtitle="កំណត់ QR Code និងគណនីធនាគារទទួលចំណងដៃ" 
                    isOpen={activeAccordion === 'payment'} 
                    onClick={() => setActiveAccordion(activeAccordion === 'payment' ? null : 'payment')}
                >
                    <PaymentSection wedding={wedding} updateTheme={updateTheme} t={t} />
                </AccordionItem>

                {/* 3. Love Story */}
                <AccordionItem 
                    icon={BookOpen} 
                    title="សារថ្លែងអំណរគុណ & រឿងរ៉ាវស្នេហា" 
                    subtitle="សារស្វាគមន៍ និងពាក្យពេចន៍ជូនភ្ញៀវ" 
                    isOpen={activeAccordion === 'story'} 
                    onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}
                >
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">ដំណើររឿងផ្តើមស្នេហ៍ (Our Love Story)</Label>
                            <DebouncedTextarea 
                                className="min-h-[85px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                value={wedding.themeSettings?.loveStory || ""} 
                                onDebouncedChange={(val) => updateTheme('loveStory', val)} 
                                placeholder="ឧ. ដំណើររឿងសេចក្តីស្រឡាញ់របស់យើងខ្ញុំ បានចាប់ផ្តើមឡើងពីថ្ងៃដែល..." 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">សារស្វាគមន៍ (Welcome Message)</Label>
                            <DebouncedTextarea 
                                className="min-h-[85px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                value={wedding.themeSettings?.welcomeMessage || ""} 
                                onDebouncedChange={(val) => updateTheme('welcomeMessage', val)} 
                                placeholder="ឧ. សូមស្វាគមន៍មកកាន់ទំព័រមង្គលការរបស់យើងខ្ញុំ..." 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">សារថ្លែងអំណរគុណ (Thank You Message)</Label>
                            <DebouncedTextarea 
                                className="min-h-[85px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-rose-500/20 shadow-sm" 
                                value={wedding.themeSettings?.acknowledgment || ""} 
                                onDebouncedChange={(val) => updateTheme('acknowledgment', val)} 
                                placeholder="ឧ. សូមអរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម..." 
                            />
                        </div>
                    </div>
                </AccordionItem>

                {/* 4. Social Media Links */}
                <AccordionItem 
                    icon={MessageSquare} 
                    title="តំណភ្ជាប់បណ្តាញសង្គម (Social Links)" 
                    subtitle="Telegram និង Facebook សម្រាប់ភ្ញៀវទាក់ទង" 
                    isOpen={activeAccordion === 'social'} 
                    onClick={() => setActiveAccordion(activeAccordion === 'social' ? null : 'social')}
                >
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center"><Facebook size={12} /></div>
                                <span>Facebook Link</span>
                            </Label>
                            <DebouncedInput 
                                placeholder="https://facebook.com/..." 
                                value={wedding.themeSettings?.facebookUrl || ""} 
                                onDebouncedChange={(val) => updateTheme('facebookUrl', val as string)} 
                                className="h-11 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-xs font-bold text-foreground px-3.5 shadow-sm" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <div className="w-5 h-5 rounded-md bg-sky-500 text-white flex items-center justify-center"><Send size={12} /></div>
                                <span>Telegram Link</span>
                            </Label>
                            <DebouncedInput 
                                placeholder="https://t.me/..." 
                                value={wedding.themeSettings?.telegramUrl || ""} 
                                onDebouncedChange={(val) => updateTheme('telegramUrl', val as string)} 
                                className="h-11 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 text-xs font-bold text-foreground px-3.5 shadow-sm" 
                            />
                        </div>
                    </div>
                </AccordionItem>

                {/* 5. Display & Typography */}
                <AccordionItem 
                    icon={Eye} 
                    title="ទម្រង់អក្សរ & ការបង្ហាញ (Display & Typography)" 
                    subtitle="បើក/បិទផ្នែកនានា និងកំណត់ពុម្ពអក្សរ" 
                    isOpen={activeAccordion === 'display'} 
                    onClick={() => setActiveAccordion(activeAccordion === 'display' ? null : 'display')}
                >
                    <div className="space-y-5 pt-2">
                        {/* Visibility Toggles */}
                        <div className="space-y-2.5">
                            <Label className="text-xs font-bold text-foreground block">បើក/បិទផ្នែកលើធៀប (Section Visibility)</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { key: 'showStory', label: "រឿងរ៉ាវស្នេហា (Love Story)", icon: Heart },
                                    { key: 'showGallery', label: "វិចិត្រសាលរូបថត (Photo Gallery)", icon: ImageIcon },
                                    { key: 'showTimeline', label: "កាលវិភាគកម្មវិធី (Schedule Timeline)", icon: Clock },
                                    { key: 'showGuestbook', label: "សៀវភៅជូនពរ (Guestbook Wishes)", icon: MessageSquare }
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-black/20 rounded-xl border border-slate-200/80 dark:border-white/10">
                                        <div className="flex items-center gap-2.5">
                                            <Icon size={15} className="text-rose-500" />
                                            <span className="text-xs font-bold text-foreground">{label}</span>
                                        </div>
                                        <Switch 
                                            id={key} 
                                            className="data-[state=checked]:bg-rose-600" 
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

                        {/* Typography */}
                        <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-white/10">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">ពុម្ពអក្សរទូទៅ (Font Family)</Label>
                                <select 
                                    className="w-full h-11 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 bg-slate-50/50 dark:bg-black/20 text-xs text-foreground font-bold shadow-sm outline-none cursor-pointer" 
                                    value={wedding.themeSettings?.fontStyle || 'default'} 
                                    onChange={(e) => updateTheme('fontStyle', e.target.value)}
                                >
                                    <option value="default">Kantumruy Pro (ស្តង់ដារ)</option>
                                    <option value="suwannaphum">Suwannaphum (ស្រឡះ)</option>
                                    <option value="battambang">Battambang (មូល)</option>
                                    <option value="preahvihear">Preahvihear (ប្រណីត)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-foreground">ពាក្យភ្ជាប់ឈ្មោះកូនកំលោះ-ក្រមុំ (Separator)</Label>
                                <select 
                                    className="w-full h-11 border border-slate-200/80 dark:border-white/10 rounded-xl px-3.5 bg-slate-50/50 dark:bg-black/20 text-xs text-foreground font-bold shadow-sm outline-none cursor-pointer" 
                                    value={wedding.themeSettings?.nameSeparator || 'and'} 
                                    onChange={(e) => updateTheme('nameSeparator', e.target.value)}
                                >
                                    <option value="and">ពាក្យ &quot;និង&quot;</option>
                                    <option value="ampersand">សញ្ញា &quot;&amp;&quot;</option>
                                    <option value="heart">សញ្ញាបេះដូង &quot;♥&quot;</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* 6. Custom Labels */}
                <AccordionItem 
                    icon={Type} 
                    title="ប្តូរអក្សរចំណងជើង (Custom Labels)" 
                    subtitle="ប្តូរឈ្មោះក្បាលទំព័រ និងអត្ថបទលើធៀបតាមចិត្ត" 
                    isOpen={activeAccordion === 'labels'} 
                    onClick={() => setActiveAccordion(activeAccordion === 'labels' ? null : 'labels')}
                >
                    <LabelsSection wedding={wedding} updateTheme={updateTheme} updateLabel={updateLabel} t={t} />
                </AccordionItem>
            </div>
        </div>
    );
};

export default React.memo(Step5Extra);
