"use client";
import * as React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload-widget";
import { Palette, Heart, CreditCard, Type, Clock, Sparkles, Loader2, Save, X, RotateCcw, Trash2, Plus, BookOpen, MessageSquare, Eye, Facebook, Send, Globe, Share2, ExternalLink, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import type { WeddingData } from '@/components/templates/types';

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
    <div className="rounded-2xl overflow-hidden bg-card shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={clsx(
                    "p-2 rounded-xl transition-colors",
                    isOpen ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-xs font-black text-foreground font-kantumruy">{title}</h3>
                    <p className="text-[10px] text-muted-foreground font-medium font-kantumruy truncate max-w-[180px]">{subtitle}</p>
                </div>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0">
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
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isPremium = packageType === "PREMIUM";
    return (
        <div className="space-y-4 pb-10 font-khmer">
            <div className="bg-muted/40 p-4 rounded-xl mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none font-khmer">
                <h3 className="text-sm font-bold text-foreground font-kantumruy mb-1">ជំហានទី៥៖ ការកំណត់បន្ថែម និងតេស្តមើលមុន</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">រៀបចំពណ៌ចម្បង, ព័ត៌មានគ្រួសារមាតាបិតា, ប្រវត្តិស្នេហា, បណ្ដាញសង្គម និងការមើលមុនពេលស៊ែរ (Social Preview)។</p>
            </div>

            <div className="bg-card border-2 border-primary/10 rounded-2xl overflow-hidden shadow-xl mb-6 font-khmer group">
                <div className="bg-primary/5 px-4 py-3 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-wider">Social Share Preview (ការមើលមុនពេលស៊ែរ)</span>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span>https://monea.app/invitation/{wedding.id}</span>
                    </div>
                    <div className="bg-muted/30 rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                        <div className="aspect-[1.91/1] bg-muted relative">
                            {wedding.themeSettings?.heroImage ? (
                                <Image 
                                    src={wedding.themeSettings.heroImage} 
                                    alt="Social Preview" 
                                    fill
                                    className="object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 italic text-[10px]">គ្មានរូបភាពបដា</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="p-4 bg-white dark:bg-card">
                            <h4 className="text-sm font-black text-foreground font-kantumruy mb-1 line-clamp-1">
                                {wedding.themeSettings?.customLabels?.invite_title || `អបអរសាទរអាពាហ៍ពិពាហ៍៖ ${wedding.groomName} 🙏 ${wedding.brideName}`}
                            </h4>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {wedding.themeSettings?.welcomeMessage || `យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកចូលរួមកម្មវិធីអាពាហ៍ពិពាហ៍របស់យើង នៅថ្ងៃទី ${mounted ? new Date(wedding.date).toLocaleDateString('km-KH') : '...'}`}
                            </p>
                        </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground italic bg-primary/5 p-2 rounded-lg">
                        * បញ្ជាក់៖ នេះជារូបភាពដែលភ្ញៀវនឹងឃើញពេលអ្នកផ្ញើតំណភ្ជាប់តាមរយៈ Facebook, Telegram ឬ Messenger។
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                <AccordionItem
                    icon={Palette}
                    title="ពណ៌ចម្បង"
                    subtitle="ជ្រើសរើសពណ៌សម្រាប់ធៀបរបស់អ្នក"
                    isOpen={activeAccordion === 'theme'}
                    onClick={() => setActiveAccordion(activeAccordion === 'theme' ? null : 'theme')}
                >
                    <div className="space-y-6 pt-2">
                        <div>
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 block">ជម្រើសពណ៌</Label>
                            <div className="grid grid-cols-5 gap-3 relative">
                                {!isPremium && (
                                    <div className="absolute inset-0 z-20 bg-card/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center border-2 border-dashed border-primary/20 cursor-help group/lock" title="សូមដំឡើងទៅគម្រោងកម្រិតខ្ពស់ ដើម្បីប្តូរពណ៌តាមចិត្ត!">
                                        <div className="bg-white p-2 rounded-full shadow-lg group-hover/lock:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </div>
                                        <span className="ml-2 text-[10px] font-black text-foreground uppercase tracking-wider">មុខងារពិសេស (Premium)</span>
                                    </div>
                                )}
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => isPremium && updateTheme('primaryColor', color)}
                                        disabled={!isPremium}
                                        className={clsx(
                                            "w-10 h-10 rounded-full border-4 shadow-sm transition-transform hover:scale-110",
                                            wedding.themeSettings?.primaryColor === color ? "border-primary scale-110" : "border-transparent",
                                            !isPremium && "cursor-not-allowed"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-inner">
                                    <DebouncedInput
                                        type="color"
                                        disabled={!isPremium}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-none"
                                        value={wedding.themeSettings?.primaryColor || "#8E5A5A"}
                                        onDebouncedChange={(val) => isPremium && updateTheme('primaryColor', val as string)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={BookOpen}
                    title="សាច់រឿងស្នេហា & សារស្វាគមន៍"
                    subtitle="សារស្វាគមន៍ភ្ញៀវ និងរឿងរ៉ាវរបស់កូនកំលោះកូនក្រមុំ"
                    isOpen={activeAccordion === 'story'}
                    onClick={() => setActiveAccordion(activeAccordion === 'story' ? null : 'story')}
                >
                    <div className="space-y-4 pt-2">
                        <div>
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">សារថ្លែងអំណរគុណ</Label>
                            <DebouncedTextarea
                                className="min-h-[60px]"
                                value={wedding.themeSettings?.acknowledgment || ""}
                                onDebouncedChange={(val) => updateTheme('acknowledgment', val)}
                                placeholder="បញ្ចូលសារថ្លែងអំណរគុណ..."
                            />
                        </div>
                        <div>
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">សារស្វាគមន៍</Label>
                            <DebouncedTextarea
                                className="min-h-[60px]"
                                value={wedding.themeSettings?.welcomeMessage || ""}
                                onDebouncedChange={(val) => updateTheme('welcomeMessage', val)}
                                placeholder="សូមស្វាគមន៍មកកាន់កម្មវិធីអាពាហ៍ពិពាហ៍របស់យើង..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">រឿងរ៉ាវកូនប្រុស</Label>
                                <DebouncedTextarea
                                    className="min-h-[80px]"
                                    value={wedding.themeSettings?.groomStory || ""}
                                    onDebouncedChange={(val) => updateTheme('groomStory', val)}
                                    placeholder="រៀបរាប់ពីប្រវត្តិកូនប្រុស..."
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">រឿងរ៉ាវកូនស្រី</Label>
                                <DebouncedTextarea
                                    className="min-h-[80px]"
                                    value={wedding.themeSettings?.brideStory || ""}
                                    onDebouncedChange={(val) => updateTheme('brideStory', val)}
                                    placeholder="រៀបរាប់ពីប្រវត្តិកូនស្រី..."
                                />
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={MessageSquare}
                    title="បណ្ដាញសង្គម"
                    subtitle="Facebook និង Telegram របស់កូនមង្គលការ"
                    isOpen={activeAccordion === 'social'}
                    onClick={() => setActiveAccordion(activeAccordion === 'social' ? null : 'social')}
                >
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 mb-1"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</Label>
                                <DebouncedInput
                                    placeholder="បញ្ចូលតំណភ្ជាប់ Facebook..."
                                    value={wedding.themeSettings?.facebookUrl || ""}
                                    onDebouncedChange={(val) => updateTheme('facebookUrl', val as string)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 mb-1"><Send className="w-4 h-4 text-sky-500" /> Telegram</Label>
                                <DebouncedInput
                                    placeholder="បញ្ចូលតំណភ្ជាប់ Telegram..."
                                    value={wedding.themeSettings?.telegramUrl || ""}
                                    onDebouncedChange={(val) => updateTheme('telegramUrl', val as string)}
                                />
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Eye}
                    title="ការបង្ហាញ និងពុម្ពអក្សរ"
                    subtitle="បិទ/បើកផ្នែកផ្សេងៗ និងប្តូរប្រភេទអក្សរ"
                    isOpen={activeAccordion === 'display'}
                    onClick={() => setActiveAccordion(activeAccordion === 'display' ? null : 'display')}
                >
                    <div className="space-y-6 pt-2">
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-foreground uppercase pb-2">កំណត់ការបង្ហាញផ្នែកខ្លះៗ</h4>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'showStory', label: 'បង្ហាញប្រវត្តិ' },
                                    { key: 'showGallery', label: 'បង្ហាញរូបភាព' },
                                    { key: 'showTimeline', label: 'បង្ហាញកម្មវិធី' },
                                    { key: 'showGuestbook', label: 'បង្ហាញសៀវភៅពរ' }
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg shadow-sm">
                                        <Label className="text-xs font-bold leading-none cursor-pointer" htmlFor={key}>
                                            {label}
                                        </Label>
                                        <Switch
                                            id={key}
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

                        <div className="space-y-4 pt-4">
                            <h4 className="text-[11px] font-bold text-foreground uppercase pb-2">ប្រភេទអក្សរ (Font Style)</h4>
                            <select
                                className="w-full h-11 border-none rounded-lg px-3 bg-muted text-xs text-foreground font-sans focus:ring-1 focus:ring-red-500 outline-none shadow-sm"
                                value={wedding.themeSettings?.fontStyle || 'default'}
                                onChange={(e) => updateTheme('fontStyle', e.target.value)}
                            >
                                <option value="default">អក្សរខ្មែរស្ដង់ដារ</option>
                                <option value="kantumruy">កន្ទុមរុយ (Kantumruy)</option>
                                <option value="suwannaphum">សុវណ្ណភូមិ (Suwannaphum)</option>
                                <option value="battambang">បាត់ដំបង (Battambang)</option>
                                <option value="preahvihear">ព្រះវិហារ (Preahvihear)</option>
                            </select>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={CreditCard}
                    title="គណនីធនាគារ"
                    subtitle="សម្រាប់ភ្ញៀវផ្ញើចំណងដៃ"
                    isOpen={activeAccordion === 'payment'}
                    onClick={() => setActiveAccordion(activeAccordion === 'payment' ? null : 'payment')}
                >
                    <div className="space-y-4 pt-2">
                        {wedding.themeSettings?.bankAccounts?.map((acc: any, idx: number) => (
                            <div key={idx} className="bg-muted/40 p-4 rounded-xl shadow-sm relative group">
                                <button
                                    onClick={() => {
                                        const newAccs = wedding.themeSettings?.bankAccounts?.filter((_, i) => i !== idx);
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                    className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <select
                                        className="w-full h-10 border-none rounded-lg px-2 bg-background text-xs text-foreground shadow-sm font-bold"
                                        value={acc.side || 'groom'}
                                        onChange={(e) => {
                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                            newAccs[idx] = { ...newAccs[idx], side: e.target.value };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    >
                                        <option value="groom">ខាងកូនប្រុស</option>
                                        <option value="bride">ខាងកូនស្រី</option>
                                        <option value="both">ទាំងសងខាង</option>
                                    </select>
                                    <select
                                        className="w-full h-10 border-none rounded-lg px-2 bg-background text-xs text-foreground shadow-sm"
                                        value={acc.bankName}
                                        onChange={(e) => {
                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                            newAccs[idx] = { ...newAccs[idx], bankName: e.target.value };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    >
                                        <option value="KHQR">KHQR</option>
                                        <option value="ACLEDA Bank">ACLEDA Bank</option>
                                        <option value="Wing Bank">Wing Bank</option>
                                        <option value="Other">ផ្សេងៗ</option>
                                    </select>
                                    <DebouncedInput
                                        placeholder="ឈ្មោះគណនី"
                                        className="h-10 text-xs rounded-lg"
                                        value={acc.accountName}
                                        onDebouncedChange={(val) => {
                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                            newAccs[idx] = { ...newAccs[idx], accountName: val as string };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    />
                                </div>
                                <DebouncedInput
                                    placeholder="លេខគណនី"
                                    className="h-10 text-xs rounded-lg mb-3"
                                    value={acc.accountNumber}
                                    onDebouncedChange={(val) => {
                                        const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                        newAccs[idx] = { ...newAccs[idx], accountNumber: val as string };
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                />
                                <div className="mt-2">
                                    <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-1 block">អាប់ឡូត QR កូដទីនេះ</Label>
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
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] border-dashed"
                            onClick={() => {
                                const newAccs = [...(wedding.themeSettings?.bankAccounts || []), { side: "bride", bankName: "KHQR", accountName: "", accountNumber: "", qrUrl: "" }];
                                updateTheme('bankAccounts', newAccs);
                            }}
                        >
                            <Plus size={14} className="mr-1" /> បន្ថែមគណនី
                        </Button>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Type}
                    title="ចំណងជើង និងអត្ថបទ"
                    subtitle="ប្ដូរអត្ថបទ និងចំណងជើងគ្រប់ផ្នែកទាំងអស់"
                    isOpen={activeAccordion === 'labels'}
                    onClick={() => setActiveAccordion(activeAccordion === 'labels' ? null : 'labels')}
                >
                    <div className="space-y-8 pt-2">
                        {/* 1. Hero & Intro */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Hero & Intro (ផ្នែកខាងលើបង្អស់)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងធំ (Main Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.invite_title || ""} onDebouncedChange={(val) => updateLabel('invite_title', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងរង (Hero Subtitle)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.hero_subtitle || ""} onDebouncedChange={(val) => updateLabel('hero_subtitle', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ប៊ូតុងបើកសំបុត្រ (Open Button)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.hero_button || ""} onDebouncedChange={(val) => updateLabel('hero_button', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ពាក្យភ្ជាប់ឈ្មោះ (e.g. និង/AND)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.andLabel || ""} onDebouncedChange={(val) => updateLabel('andLabel', val as string)} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Invitation & Parents */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Invitation (ផ្នែកអញ្ជើញ)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ផ្លាកសញ្ញាលើ (Badge)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.invitationBadge || ""} onDebouncedChange={(val) => updateLabel('invitationBadge', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងអញ្ជើញ (Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.invitationTitle || ""} onDebouncedChange={(val) => updateLabel('invitationTitle', val as string)} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងកិត្តិយស (Honor Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.invitationHonorTitle || ""} onDebouncedChange={(val) => updateLabel('invitationHonorTitle', val as string)} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">អត្ថបទរៀបរាប់ (Invitation Body)</Label>
                                    <DebouncedTextarea className="min-h-[80px] rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.invitationText || ""} onDebouncedChange={(val) => updateTheme('invitationText', val)} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Location & Countdown */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Location & Time (ទីតាំង និងពេលវេលា)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងទីតាំង (Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.locationTitle || ""} onDebouncedChange={(val) => updateLabel('locationTitle', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងរងទីតាំង (Subtitle)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.locationSubtitle || ""} onDebouncedChange={(val) => updateLabel('locationSubtitle', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ផ្លាកលើផែនទី (Map Label)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.locationCardLabel || ""} onDebouncedChange={(val) => updateLabel('locationCardLabel', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">អត្ថបទ Countdown (Label)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.countdownLabel || ""} onDebouncedChange={(val) => updateLabel('countdownLabel', val as string)} />
                                </div>
                            </div>
                        </div>

                        {/* 4. Gallery & Editorial */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Gallery & Story (រូបភាព និងសាច់រឿង)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងអាល់ប៊ុម (Album Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.gallery_title || ""} onDebouncedChange={(val) => updateLabel('gallery_title', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងរងអាល់ប៊ុម (Subtitle)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.gallerySubtitle || ""} onDebouncedChange={(val) => updateLabel('gallerySubtitle', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">អត្ថបទរឿងរ៉ាវ ១ (Editorial 1)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.editorialText1 || ""} onDebouncedChange={(val) => updateTheme('editorialText1', val)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">អត្ថបទរឿងរ៉ាវ ២ (Editorial 2)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.editorialText2 || ""} onDebouncedChange={(val) => updateTheme('editorialText2', val)} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">អត្ថបទរឿងរ៉ាវ ៣ (Editorial 3)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.editorialText3 || ""} onDebouncedChange={(val) => updateTheme('editorialText3', val)} />
                                </div>
                            </div>
                        </div>

                        {/* 5. Gift & RSVP */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Gift & RSVP (ចំណងដៃ និងការឆ្លើយតប)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងចំណងដៃ (Gift Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.giftTitle || ""} onDebouncedChange={(val) => updateLabel('giftTitle', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ផ្លាកសញ្ញាចំណងដៃ (Badge)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.giftBadge || ""} onDebouncedChange={(val) => updateLabel('giftBadge', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ប៊ូតុងចម្លង (Copy Button)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.giftCopyBtn || ""} onDebouncedChange={(val) => updateLabel('giftCopyBtn', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">អត្ថបទជោគជ័យ (Copied Text)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.giftCopied || ""} onDebouncedChange={(val) => updateLabel('giftCopied', val as string)} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">សារជូនពរឆ្លើយតប (RSVP Success)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.rsvpSubmittedText || ""} onDebouncedChange={(val) => updateLabel('rsvpSubmittedText', val as string)} />
                                </div>
                            </div>
                        </div>

                        {/* 6. Finale & Thank You */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-2 border-primary pl-2">Finale & Thank You (សារបញ្ចប់)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងអរគុណ (Title)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.thankYouTitle || ""} onDebouncedChange={(val) => updateLabel('thankYouTitle', val as string)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">ផ្លាកសញ្ញាបញ្ចប់ (Footer Badge)</Label>
                                    <DebouncedInput className="h-11 rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.footerBadge || ""} onDebouncedChange={(val) => updateLabel('footerBadge', val as string)} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">សារថ្លែងអំណរគុណចុងក្រោយ (Thank You Message)</Label>
                                    <DebouncedTextarea className="min-h-[80px] rounded-xl bg-muted border-none shadow-sm" value={wedding.themeSettings?.customLabels?.thankYouMessage || ""} onDebouncedChange={(val) => updateLabel('thankYouMessage', val as string)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Clock}
                    title="ប្រវត្តិនៃការកែប្រែ"
                    subtitle="រក្សាទុក ឬត្រឡប់ទៅម៉ូដចាស់ៗ"
                    isOpen={activeAccordion === 'history'}
                    onClick={() => {
                        const isOpen = activeAccordion === 'history';
                        setActiveAccordion(isOpen ? null : 'history');
                        if (!isOpen) fetchVersions();
                    }}
                >
                    <div className="space-y-4 pt-4">
                        <div className="bg-muted/40 p-4 rounded-xl space-y-3 shadow-inner">
                            <Label className="text-[10px] text-muted-foreground font-bold uppercase block">រក្សាទុកជា Version ថ្មី</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="ឈ្មោះ Version (ឧ. មុនដូរពណ៌...)"
                                    value={newVersionTitle}
                                    onChange={(e) => setNewVersionTitle(e.target.value)}
                                    className="h-10 text-xs rounded-lg border-none shadow-sm"
                                />
                                <Button
                                    onClick={handleSaveVersion}
                                    disabled={isSavingVersion || !newVersionTitle}
                                    className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground px-4 rounded-lg text-xs"
                                >
                                    {isSavingVersion ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] text-muted-foreground font-bold uppercase block px-1">បញ្ជី Version ដែលបានរក្សាទុក</Label>
                            {fetchingVersions ? (
                                <div className="flex flex-col items-center py-8 gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
                                    <span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">កំពុងទាញយក...</span>
                                </div>
                            ) : templateVersions.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase">មិនទាន់មាន Version នៅឡើយទេ</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                                    {templateVersions.map((ver) => (
                                        <div key={ver.id} className="bg-card p-3 rounded-xl flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-foreground font-kantumruy truncate">{ver.versionName}</span>
                                                    <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">រក្សាទុក</span>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground mt-0.5">{mounted ? new Date(ver.createdAt).toLocaleString('km-KH', { timeZone: 'Asia/Phnom_Penh' }) : '...'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRollback(ver.id)}
                                                    className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg"
                                                    title="Restore this version"
                                                >
                                                    <RotateCcw size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteVersion(ver.id)}
                                                    className="h-8 w-8 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
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
