
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload-widget";
import { Palette, Heart, CreditCard, Type, Clock, Sparkles, Loader2, Save, X, RotateCcw, Trash2, Plus, BookOpen, MessageSquare, Eye, Facebook, Send } from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from 'framer-motion';
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
}

const AccordionItem = ({ icon: Icon, title, subtitle, children, isOpen, onClick }: any) => (
    <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
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
                    <div className="p-4 pt-0 border-t border-border">
                        {children}
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    </div>
);

const ChevronDown = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
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
    PRESET_COLORS
}) => {
    return (
        <div className="space-y-4 pb-10 font-khmer">
            <div className="bg-muted/50 border border-border p-4 rounded-xl mb-4">
                <h3 className="text-sm font-bold text-foreground font-kantumruy mb-1">ជំហានទី៥៖ ព័ត៌មានបន្ថែម (Extra Settings)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">រៀបចំពណ៌ចម្បង, ព័ត៌មានគ្រួសារមាតាបិតា, ប្រវត្តិស្នេហា, បណ្ដាញសង្គមរាង និងគណនីធនាគារ (កាត់ចំណងដៃ)។</p>
            </div>
            <div className="space-y-3">
                <AccordionItem
                    icon={Palette}
                    title="ពណ៌ចម្បង (Primary Color)"
                    subtitle="ជ្រើសរើសពណ៌សម្រាប់ធៀប"
                    isOpen={activeAccordion === 'theme'}
                    onClick={() => setActiveAccordion(activeAccordion === 'theme' ? null : 'theme')}
                >
                    <div className="space-y-6 pt-2">
                        <div>
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 block">ពណ៌ចម្បង (Primary Color)</Label>
                            <div className="grid grid-cols-5 gap-3">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => updateTheme('primaryColor', color)}
                                        className={clsx(
                                            "w-10 h-10 rounded-full border-4 shadow-sm transition-transform hover:scale-110",
                                            wedding.themeSettings?.primaryColor === color ? "border-primary scale-110" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                                    <DebouncedInput
                                        type="color"
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                        value={wedding.themeSettings?.primaryColor || "#8E5A5A"}
                                        onDebouncedChange={(val) => updateTheme('primaryColor', val as string)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Heart}
                    title="ព័ត៌មានគ្រួសារ"
                    subtitle="ឈ្មោះមាតាបិតាទាំងសងខាង"
                    isOpen={activeAccordion === 'family'}
                    onClick={() => setActiveAccordion(activeAccordion === 'family' ? null : 'family')}
                >
                    <div className="grid grid-cols-1 gap-6 pt-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                                <h4 className="text-[11px] font-bold text-foreground uppercase">ខាងកូនប្រុស</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input placeholder="ឈ្មោះឪពុក" className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.parents?.groomFather || ""} onChange={(e) => updateParent('groomFather', e.target.value)} />
                                <Input placeholder="ឈ្មោះម្តាយ" className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.parents?.groomMother || ""} onChange={(e) => updateParent('groomMother', e.target.value)} />
                            </div>
                            <Input placeholder="លេខទូរស័ព្ទ (សម្រាប់ភ្ញៀវទាក់ទង)" className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.parents?.groomPhone || ""} onChange={(e) => updateParent('groomPhone', e.target.value)} />
                        </div>
                        <div className="space-y-4 pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                <h4 className="text-[11px] font-bold text-foreground uppercase">ខាងកូនស្រី</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input placeholder="ឈ្មោះឪពុក" className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.parents?.brideFather || ""} onChange={(e) => updateParent('brideFather', e.target.value)} />
                                <Input placeholder="ឈ្មោះម្តាយ" className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.parents?.brideMother || ""} onChange={(e) => updateParent('brideMother', e.target.value)} />
                            </div>
                            <Input placeholder="លេខទូរស័ព្ទ (សម្រាប់ភ្ញៀវទាក់ទង)" className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.parents?.bridePhone || ""} onChange={(e) => updateParent('bridePhone', e.target.value)} />
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
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">សារថ្លែងអំណរគុណ (Acknowledgment)</Label>
                            <textarea
                                className="w-full p-3 text-sm border border-border rounded-lg bg-muted text-foreground min-h-[60px] focus:ring-1 focus:ring-primary outline-none"
                                value={wedding.themeSettings?.acknowledgment || ""}
                                onChange={(e) => updateTheme('acknowledgment', e.target.value)}
                                placeholder="បើកសេចក្តី រឺ បិទដោយអរគុណភ្ញៀវ..."
                            />
                        </div>
                        <div>
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">សារស្វាគមន៍ (Welcome Message)</Label>
                            <textarea
                                className="w-full p-3 text-sm border border-border rounded-lg bg-muted text-foreground min-h-[60px] focus:ring-1 focus:ring-primary outline-none"
                                value={wedding.themeSettings?.welcomeMessage || ""}
                                onChange={(e) => updateTheme('welcomeMessage', e.target.value)}
                                placeholder="សូមស្វាគមន៍មកកាន់ពាក្យអាពាហ៍ពិពាហ៍របស់យើង..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">រឿងកូនប្រុស (Groom's Story)</Label>
                                <textarea
                                    className="w-full p-3 text-sm border border-border rounded-lg bg-muted text-foreground min-h-[80px] focus:ring-1 focus:ring-primary outline-none"
                                    value={wedding.themeSettings?.groomStory || ""}
                                    onChange={(e) => updateTheme('groomStory', e.target.value)}
                                    placeholder="រៀបរាប់ពីប្រវត្តិកូនប្រុស..."
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">រឿងកូនស្រី (Bride's Story)</Label>
                                <textarea
                                    className="w-full p-3 text-sm border border-border rounded-lg bg-muted text-foreground min-h-[80px] focus:ring-1 focus:ring-primary outline-none"
                                    value={wedding.themeSettings?.brideStory || ""}
                                    onChange={(e) => updateTheme('brideStory', e.target.value)}
                                    placeholder="រៀបរាប់ពីប្រវត្តិកូនស្រី..."
                                />
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={MessageSquare}
                    title="បណ្ដាញសង្គមរាង"
                    subtitle="Facebook & Telegram"
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
                    title="ការបង្ហាញ & ហ្វុង (Display & Font)"
                    subtitle="បិទ/បើកផ្នែកផ្សេងៗនៃធៀប និងដូរប្រភេទអក្សរ"
                    isOpen={activeAccordion === 'display'}
                    onClick={() => setActiveAccordion(activeAccordion === 'display' ? null : 'display')}
                >
                    <div className="space-y-6 pt-2">
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-foreground uppercase border-b border-border pb-2">បិទ/បើកផ្នែកផ្សេងៗ</h4>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                {['showStory', 'showGallery', 'showTimeline', 'showGuestbook'].map((key) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                                        <Label className="text-xs font-bold leading-none cursor-pointer" htmlFor={key}>
                                            {key.replace('show', 'បង្ហាញ ')}
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

                        <div className="space-y-4 pt-2">
                            <h4 className="text-[11px] font-bold text-foreground uppercase border-b border-border pb-2">ប្រភេទអក្សរ (Font Family)</h4>
                            <select
                                className="w-full h-11 border border-border rounded-lg px-3 bg-muted text-xs text-foreground font-sans focus:ring-1 focus:ring-primary outline-none"
                                value={wedding.themeSettings?.fontStyle || 'default'}
                                onChange={(e) => updateTheme('fontStyle', e.target.value)}
                            >
                                <option value="default">Default Khmer Font</option>
                                <option value="kantumruy">Kantumruy Pro</option>
                                <option value="suwannaphum">Suwannaphum</option>
                                <option value="battambang">Battambang</option>
                                <option value="preahvihear">Preahvihear</option>
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
                            <div key={idx} className="bg-muted/50 p-4 rounded-xl border border-border relative group">
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
                                        className="w-full h-10 border border-border rounded-lg px-2 bg-background text-xs text-foreground"
                                        value={acc.bankName}
                                        onChange={(e) => {
                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                            newAccs[idx] = { ...newAccs[idx], bankName: e.target.value };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    >
                                        <option value="ABA Bank">ABA Bank</option>
                                        <option value="ACLEDA Bank">ACLEDA Bank</option>
                                        <option value="Wing Bank">Wing Bank</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <Input
                                        placeholder="ឈ្មោះគណនី"
                                        className="h-10 text-xs rounded-lg"
                                        value={acc.accountName}
                                        onChange={(e) => {
                                            const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                            newAccs[idx] = { ...newAccs[idx], accountName: e.target.value };
                                            updateTheme('bankAccounts', newAccs);
                                        }}
                                    />
                                </div>
                                <Input
                                    placeholder="លេខគណនី"
                                    className="h-10 text-xs rounded-lg mb-3"
                                    value={acc.accountNumber}
                                    onChange={(e) => {
                                        const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                        newAccs[idx] = { ...newAccs[idx], accountNumber: e.target.value };
                                        updateTheme('bankAccounts', newAccs);
                                    }}
                                />
                                <div>
                                    <Label className="text-[10px] text-muted-foreground font-bold uppercase mb-1 block">អាប់ឡូត QR កូដទីនេះ (QR Code Upload)</Label>
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
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] border-dashed"
                            onClick={() => {
                                const newAccs = [...(wedding.themeSettings?.bankAccounts || []), { bankName: "ABA Bank", accountName: "", accountNumber: "", qrUrl: "" }];
                                updateTheme('bankAccounts', newAccs);
                            }}
                        >
                            <Plus size={14} className="mr-1" /> បន្ថែមគណនី
                        </Button>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Type}
                    title="ចំណងជើងកម្មវិធី"
                    subtitle="កែប្រែអក្សរលើធៀប"
                    isOpen={activeAccordion === 'labels'}
                    onClick={() => setActiveAccordion(activeAccordion === 'labels' ? null : 'labels')}
                >
                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងធំ (Main Title)</Label>
                                <Input className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.customLabels?.invite_title || ""} onChange={(e) => updateLabel('invite_title', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-muted-foreground font-bold uppercase ml-1">ចំណងជើងវិចិត្រសាល (Gallery)</Label>
                                <Input className="h-11 rounded-xl bg-muted border-border" value={wedding.themeSettings?.customLabels?.gallery_title || ""} onChange={(e) => updateLabel('gallery_title', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem
                    icon={Clock}
                    title="ប្រវត្តិនៃការកែប្រែ (Version History)"
                    subtitle="រក្សាទុក ឬទាញយកម៉ូដចាស់ៗ"
                    isOpen={activeAccordion === 'history'}
                    onClick={() => {
                        const isOpen = activeAccordion === 'history';
                        setActiveAccordion(isOpen ? null : 'history');
                        if (!isOpen) fetchVersions();
                    }}
                >
                    <div className="space-y-4 pt-4">
                        <div className="bg-muted p-4 rounded-xl border border-border space-y-3">
                            <Label className="text-[10px] text-muted-foreground font-bold uppercase block">រក្សាទុក Version ថ្មី (Create Snapshot)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="ឈ្មោះ Version (ឧ. មុនដូរពណ៌...)"
                                    value={newVersionTitle}
                                    onChange={(e) => setNewVersionTitle(e.target.value)}
                                    className="h-10 text-xs rounded-lg"
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
                                    <span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">Loading Versions...</span>
                                </div>
                            ) : templateVersions.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase">មិនទាន់មាន Version នៅឡើយទេ</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-hide">
                                    {templateVersions.map((ver) => (
                                        <div key={ver.id} className="bg-card p-3 rounded-xl border border-border flex items-center justify-between group hover:border-primary/50 transition-all shadow-sm">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-foreground font-kantumruy truncate">{ver.versionName}</span>
                                                    <span className="text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-bold">SAVED</span>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(ver.createdAt).toLocaleString('km-KH')}</p>
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
            </div >
        </div >
    );
};

export default React.memo(Step5Extra);
