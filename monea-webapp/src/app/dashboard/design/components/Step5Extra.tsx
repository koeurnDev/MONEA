import * as React from 'react';
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { DebouncedTextarea } from "@/components/ui/debounced-textarea";
import { Switch } from "@/components/ui/switch";
import {
    Palette, Heart, CreditCard, Type, Clock, BookOpen,
    MessageSquare, Eye, Facebook, Send, Phone, ImageIcon, Share2, Upload, Trash2, Loader2,
    Settings, Sparkles, Lock
} from "lucide-react";
import clsx from "clsx";
import { m, AnimatePresence } from 'framer-motion';
import type { TemplateSection, VisibilityKey, WeddingData } from '@/components/templates/types';
import { useTranslation } from "@/i18n/LanguageProvider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { AccordionItem } from "./sections/AccordionItem";
import { PaymentSection } from "./sections/PaymentSection";
import { LabelsSection } from "./sections/LabelsSection";
import { HistorySection } from "./sections/HistorySection";
import { NEA_M05_COLOR_PRESETS } from "@/lib/nea-m05-colors";
import { NEA_M05_FONT_OPTIONS } from "@/lib/nea-m05-fonts";
import { getTemplateConfig } from "@/components/templates/template-config";

interface Step5ExtraProps {
    wedding: WeddingData;
    updateTheme: (key: string | Record<string, unknown>, value?: any) => void;
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
    removeThemeAsset: (urlKey: string, publicIdKey: string, assetIndex?: number) => Promise<void>;
}

const visibilityOptions: { key: VisibilityKey; section: TemplateSection; label: string; icon: typeof Heart }[] = [
    { key: 'showStory', section: "story", label: "រឿងរ៉ាវស្នេហា (Love Story)", icon: Heart },
    { key: 'showGallery', section: "gallery", label: "វិចិត្រសាលរូបថត (Photo Gallery)", icon: ImageIcon },
    { key: 'showTimeline', section: "timeline", label: "កាលវិភាគកម្មវិធី (Schedule Timeline)", icon: Clock },
    { key: 'showGuestbook', section: "guestbook", label: "សៀវភៅជូនពរ (Guestbook Wishes)", icon: MessageSquare }
] as const;

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
    removeGalleryItem,
    removeThemeAsset
}) => {
    const { t } = useTranslation();
    const [mounted, setMounted] = React.useState(false);
    const isAnniv = wedding.eventType === 'anniversary';
    React.useEffect(() => { setMounted(true); }, []);

    const isPremium = packageType === "PREMIUM";
    const isNeaM05 = wedding.templateId === "nea-m05";
    const selectedM05Color = wedding.themeSettings?.m05ColorPreset || "olive-gold";
    const selectedM05Palette = NEA_M05_COLOR_PRESETS.find((preset) => preset.id === selectedM05Color) || NEA_M05_COLOR_PRESETS[0];
    const templateDefaultColor = getTemplateConfig(wedding.templateId)?.primaryColor || "#f43f5e";
    const supportedVisibilityControls: readonly TemplateSection[] =
        getTemplateConfig(wedding.templateId)?.visibilityControls || [];
    const [socialPreviewUrl, setSocialPreviewUrl] = React.useState<string | null>(wedding.themeSettings?.socialPreviewImage || null);
    const socialInputRef = React.useRef<HTMLInputElement>(null);
    const storyImageInputRef = React.useRef<HTMLInputElement>(null);
    const storyImages = wedding.themeSettings?.storyImages;
    const storyImageSkipped = Array.isArray(storyImages) && storyImages.length === 0;
    const storyMediaRef = React.useRef({
        images: wedding.themeSettings?.storyImages || [],
        captions: wedding.themeSettings?.storyImageCaptions || [],
        publicIds: wedding.themeSettings?.storyImagePublicIds
            || (wedding.themeSettings?.storyImagePublicId ? [wedding.themeSettings.storyImagePublicId] : []),
    });
    React.useEffect(() => {
        storyMediaRef.current = {
            images: wedding.themeSettings?.storyImages || [],
            captions: wedding.themeSettings?.storyImageCaptions || [],
            publicIds: wedding.themeSettings?.storyImagePublicIds
                || (wedding.themeSettings?.storyImagePublicId ? [wedding.themeSettings.storyImagePublicId] : []),
        };
    }, [wedding.themeSettings?.storyImages, wedding.themeSettings?.storyImageCaptions, wedding.themeSettings?.storyImagePublicIds, wedding.themeSettings?.storyImagePublicId]);
    const { uploading: storyImageUploading, progress: storyImageProgress, error: storyImageError, uploadFile: uploadStoryImage } = useCloudinaryUpload({
        folder: wedding.id,
        onSuccess: (url, publicId) => {
            const currentImages = storyMediaRef.current.images;
            const currentPublicIds = storyMediaRef.current.publicIds;
            const nextImages = [...currentImages, url];
            const nextPublicIds = [...currentPublicIds, publicId || ""];
            storyMediaRef.current = {
                ...storyMediaRef.current,
                images: nextImages,
                publicIds: nextPublicIds,
            };
            updateTheme({
                storyImages: nextImages,
                storyImagePublicIds: nextPublicIds,
                storyImagePublicId: "",
            });
        },
    });

    React.useEffect(() => {
        setSocialPreviewUrl(wedding.themeSettings?.socialPreviewImage || null);
    }, [wedding.themeSettings?.socialPreviewImage]);

    const onSocialFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const url = reader.result as string;
            setSocialPreviewUrl(url);
            updateTheme('socialPreviewImage', url);
        };
        reader.readAsDataURL(file);
    };
    const sectionShortcuts = [
        { id: 'theme', label: 'ពណ៌', icon: Palette },
        { id: 'payment', label: 'KHQR', icon: CreditCard },
        { id: 'story', label: 'រឿងរ៉ាវ', icon: BookOpen },
        { id: 'social', label: 'Social', icon: MessageSquare },
        { id: 'social-preview', label: 'រូប Link', icon: Share2 },
        { id: 'display', label: 'បង្ហាញ', icon: Eye },
        { id: 'typography', label: 'ពុម្ពអក្សរ', icon: Type },
        { id: 'labels', label: 'ពាក្យលើធៀប', icon: Type },
    ];
    const selectedSectionId = activeAccordion || 'theme';
    const openSection = (sectionId: string) => {
        setActiveAccordion(sectionId);
        window.requestAnimationFrame(() => {
            document.getElementById(`step5-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    return (
        <div className="space-y-4 sm:space-y-6 font-kantumruy">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 sm:p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-foreground">រចនាប័ទ្ម និងព័ត៌មានបន្ថែម</h3>
                    <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">ភាគច្រើនអាចរំលងបាន</span>
                </div>
                <p className="mt-1 hidden text-xs leading-relaxed text-muted-foreground sm:block">
                    កែពណ៌ និងរូបរាងតាមចិត្ត។ KHQR បណ្តាញសង្គម និងសារផ្សេងៗជាជម្រើសបន្ថែម។
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 sm:p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-black text-foreground">ជ្រើសរើសផ្នែកដែលចង់កែ</p>
                        <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">ជ្រើសរើសមួយផ្នែក ដើម្បីបើកការកំណត់របស់វា</p>
                    </div>
                    <Settings className="h-4 w-4 shrink-0 text-teal-500" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2">
                    {sectionShortcuts.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => openSection(id)}
                            aria-pressed={selectedSectionId === id}
                            title={label}
                            className={clsx(
                                "flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors sm:min-h-11 sm:gap-1.5 sm:px-2 sm:text-[11px]",
                                selectedSectionId === id
                                    ? "border-teal-200 bg-teal-50 text-teal-600 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400"
                                    : "border-slate-200/80 bg-slate-50/70 text-slate-600 hover:border-teal-200 hover:text-teal-600 dark:border-white/10 dark:bg-black/20 dark:text-slate-300"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="min-w-0 truncate">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Show only the selected settings section so navigation labels are not repeated. */}
            <div className="space-y-3">
                {/* 1. Theme Color */}
                <AccordionItem
                    id="step5-theme"
                    hideWhenClosed
                    hideHeader
                    icon={Palette}
                    title="ពណ៌ធៀប"
                    isOpen={selectedSectionId === 'theme'}
                    onClick={() => setActiveAccordion('theme')}
                >
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-foreground">
                                {isNeaM05 ? "ពណ៌ស្រាប់ · Colour presets" : "ក្ដារពណ៌ (Preset Colors)"}
                            </Label>
                            {!isPremium && (
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/20">
                                    PRO / PREMIUM
                                </span>
                            )}
                        </div>
                        {isNeaM05 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: "primaryColor", label: "ពណ៌លម្អ", value: wedding.themeSettings?.primaryColor || selectedM05Palette.foil },
                                    { key: "m05FoilShadeColor", label: "ពណ៌ស្រមោល", value: wedding.themeSettings?.m05FoilShadeColor || selectedM05Palette.foilShade },
                                    { key: "m05HighlightColor", label: "ពណ៌បន្លិច", value: wedding.themeSettings?.m05HighlightColor || selectedM05Palette.foilHighlight },
                                    { key: "m05EnvelopeColor", label: "ពណ៌ស្រោម", value: wedding.themeSettings?.m05EnvelopeColor || selectedM05Palette.envelope },
                                    { key: "m05SealColor", label: "ពណ៌ត្រាស្រោម", value: wedding.themeSettings?.m05SealColor || selectedM05Palette.foil },
                                    { key: "m05SurfaceColor", label: "ពណ៌ផ្ទៃ", value: wedding.themeSettings?.m05SurfaceColor || selectedM05Palette.darkSurface },
                                ].map(({ key, label, value }) => (
                                    <label key={key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 dark:border-white/10 dark:bg-black/20">
                                        <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                                        <input
                                            type="color"
                                            value={value}
                                            onChange={(event) => {
                                                updateTheme({
                                                    [key]: event.target.value,
                                                    colorPalettePreset: "",
                                                    m05ColorPreset: "custom",
                                                });
                                            }}
                                            className="h-8 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                                            aria-label={`ជ្រើសរើស${label}`}
                                        />
                                    </label>
                                ))}
                                <label className="col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 dark:border-white/10 dark:bg-black/20">
                                    <span className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                                        <span>ពណ៌លើរូបថត</span>
                                        <span>{wedding.themeSettings?.m05PhotoTint ?? 22}%</span>
                                    </span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={45}
                                        step={1}
                                        value={wedding.themeSettings?.m05PhotoTint ?? 22}
                                        onChange={(event) => updateTheme("m05PhotoTint", Number(event.target.value))}
                                        className="mt-2 w-full accent-teal-600"
                                        aria-label="កម្រិត tint លើរូបថត"
                                    />
                                </label>
                                <p className="col-span-2 text-[10px] leading-5 text-muted-foreground">
                                    ពណ៌អក្សរតុបតែងត្រូវបានកែសម្រួលសម្រាប់ភាពងាយអាន។ ពណ៌ស្រោម និងផ្ទៃខ្លះអាចងងឹតជាងពណ៌ដែលបានជ្រើស ដើម្បីរក្សាស្ទីល; Preview បង្ហាញលទ្ធផលចុងក្រោយ។
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 dark:border-white/10 dark:bg-black/20">
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground">ពណ៌ផ្ទាល់ខ្លួន</p>
                                        <button
                                            type="button"
                                            onClick={() => updateTheme({
                                                primaryColor: "",
                                                colorPalettePreset: "",
                                            })}
                                            className="mt-1 text-[10px] font-semibold text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
                                        >
                                            ប្រើពណ៌ដើមរបស់ template
                                        </button>
                                    </div>
                                    <input
                                        type="color"
                                        value={wedding.themeSettings?.primaryColor || templateDefaultColor}
                                        onChange={(event) => updateTheme({
                                            primaryColor: event.target.value,
                                            colorPalettePreset: "",
                                        })}
                                        className="h-8 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                                        aria-label="ជ្រើសរើសពណ៌ផ្ទាល់ខ្លួន"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {NEA_M05_COLOR_PRESETS.map((preset) => {
                                        const selected = wedding.themeSettings?.colorPalettePreset === preset.id;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() => updateTheme({
                                                    colorPalettePreset: preset.id,
                                                    primaryColor: preset.accent,
                                                })}
                                                className={clsx(
                                                    "flex min-h-12 min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors",
                                                    selected
                                                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-500/10"
                                                        : "border-slate-200/80 bg-slate-50/70 hover:border-teal-300 dark:border-white/10 dark:bg-black/20",
                                                )}
                                            >
                                                <span className="flex shrink-0 overflow-hidden rounded-full border border-black/10">
                                                    {preset.colors.map((color) => (
                                                        <span key={color} className="h-6 w-6" style={{ backgroundColor: color }} />
                                                    ))}
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-[10px] font-bold text-foreground">{preset.name}</span>
                                                    <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">{preset.khmerName}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {isNeaM05 ? (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {NEA_M05_COLOR_PRESETS.map((preset) => {
                                    const selected = selectedM05Color === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => {
                                                updateTheme({
                                                    colorPalettePreset: preset.id,
                                                    m05ColorPreset: preset.id,
                                                    primaryColor: preset.foil,
                                                    m05FoilShadeColor: preset.foilShade,
                                                    m05HighlightColor: preset.foilHighlight,
                                                    m05EnvelopeColor: preset.envelope,
                                                    m05SealColor: preset.foil,
                                                    m05SurfaceColor: preset.darkSurface,
                                                    m05PhotoTint: 22,
                                                });
                                            }}
                                            className={clsx(
                                                "flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                                                selected
                                                    ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-500/10"
                                                    : "border-slate-200/80 bg-slate-50/70 hover:border-teal-300 dark:border-white/10 dark:bg-black/20"
                                            )}
                                        >
                                            <span className="flex shrink-0 overflow-hidden rounded-full border border-black/10">
                                                {preset.colors.map((color) => (
                                                    <span key={color} className="h-7 w-7" style={{ backgroundColor: color }} />
                                                ))}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-[11px] font-bold text-foreground">{preset.name}</span>
                                                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{preset.khmerName}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                            {PRESET_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => updateTheme('primaryColor', color)}
                                    className={clsx(
                                        "aspect-square min-h-12 rounded-2xl border-2 transition-all hover:scale-105 shadow-sm",
                                        wedding.themeSettings?.primaryColor === color 
                                            ? "border-teal-600 scale-110 ring-2 ring-teal-500/20 shadow-md"
                                            : "border-slate-200/80 dark:border-white/10"
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                        )}
                    </div>
                </AccordionItem>

                {/* 2. Payment & Registry */}
                <AccordionItem 
                    id="step5-payment"
                    hideWhenClosed
                    hideHeader
                    icon={CreditCard} 
                    title="KHQR"
                    subtitle="ស្រេចចិត្ត · បញ្ចូលរូប KHQR និងឈ្មោះអ្នកទទួលប្រាក់"
                    isOpen={selectedSectionId === 'payment'}
                    onClick={() => setActiveAccordion('payment')}
                >
                    <PaymentSection wedding={wedding} updateTheme={updateTheme} t={t} />
                </AccordionItem>

                {/* 3. Love Story */}
                <AccordionItem 
                    id="step5-story"
                    hideWhenClosed
                    hideHeader
                    icon={BookOpen} 
                    title="សារថ្លែងអំណរគុណ & រឿងរ៉ាវស្នេហា" 
                    subtitle="ស្រេចចិត្ត · សារស្វាគមន៍ និងពាក្យពេចន៍ជូនភ្ញៀវ"
                    isOpen={selectedSectionId === 'story'}
                    onClick={() => setActiveAccordion('story')}
                >
                    <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <Label className="text-xs font-bold text-foreground">រូបភាពរឿងរ៉ាវ (អាចរំលងបាន)</Label>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                                {storyImages?.filter(Boolean).length || 0} រូប
                            </span>
                        </div>
                        <input
                            ref={storyImageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={async (event) => {
                                const input = event.currentTarget;
                                const files = Array.from(input.files || []);
                                for (const file of files) {
                                    await uploadStoryImage(file);
                                }
                                input.value = "";
                            }}
                        />
                        {storyImages?.some(Boolean) ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {storyImages.map((image, index) => ({ image, index })).filter(({ image }) => Boolean(image)).map(({ image, index }) => (
                                    <div key={`${image}-${index}`} className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-white/10 dark:bg-black/20">
                                        <img src={image} alt={`រូបរឿងរ៉ាវទី ${index + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <span className="text-[10px] font-semibold text-muted-foreground">{index + 1}. រូបភាព</span>
                                            <button
                                                type="button"
                                                onClick={() => void removeThemeAsset("storyImages", "storyImagePublicId", index)}
                                                disabled={storyImageUploading}
                                                aria-label={`លុបរូបភាពរឿងរ៉ាវទី ${index + 1}`}
                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                            >
                                                <Trash2 className="h-3 w-3" /> លុប
                                            </button>
                                        </div>
                                        <textarea
                                            value={wedding.themeSettings?.storyImageCaptions?.[index] || ""}
                                            onChange={(event) => {
                                                const captions = [...storyMediaRef.current.captions];
                                                captions[index] = event.target.value;
                                                storyMediaRef.current = { ...storyMediaRef.current, captions };
                                                updateTheme({ storyImageCaptions: captions });
                                            }}
                                            rows={2}
                                            maxLength={200}
                                            aria-label={`Caption រូបភាពរឿងរ៉ាវទី ${index + 1}`}
                                            placeholder={`សរសេរ caption សម្រាប់រូបទី ${index + 1}...`}
                                            className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-white/80 p-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-white/10 dark:bg-black/20"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : storyImageSkipped ? (
                            <p className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-[11px] font-medium text-muted-foreground dark:border-white/10 dark:bg-black/20">
                                បានជ្រើសរើសមិនដាក់រូបក្នុងផ្នែក Story។
                            </p>
                        ) : (
                            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-center text-xs text-muted-foreground dark:border-white/20 dark:bg-black/20">
                                បន្ថែមរូបច្រើនសន្លឹក ដើម្បីចែករំលែកដំណើររឿងរបស់អ្នក។
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => storyImageInputRef.current?.click()}
                            disabled={storyImageUploading}
                            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-xs font-bold text-slate-600 transition-colors hover:border-teal-400 hover:text-teal-700 disabled:cursor-wait disabled:opacity-60 dark:border-white/20 dark:bg-black/20 dark:text-slate-300"
                        >
                            {storyImageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {storyImageUploading ? `កំពុងបញ្ចូល ${storyImageProgress}%` : storyImages?.length ? "បន្ថែមរូបភាព" : "បញ្ចូលរូបភាព"}
                        </button>
                        {!storyImages?.length && !storyImageSkipped && (
                            <button
                                type="button"
                                onClick={() => {
                                    storyMediaRef.current = { images: [], captions: [], publicIds: [] };
                                    updateTheme({ storyImages: [], storyImageCaptions: [], storyImagePublicIds: [], storyImagePublicId: "" });
                                }}
                                disabled={storyImageUploading}
                                className="w-full rounded-lg px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground disabled:opacity-50 dark:hover:bg-white/5"
                            >
                                មិនចង់ដាក់រូប
                            </button>
                        )}
                        {storyImages?.some(Boolean) && (
                            <button
                                type="button"
                                onClick={() => {
                                    storyMediaRef.current = { images: [], captions: [], publicIds: [] };
                                    updateTheme({ storyImages: [], storyImageCaptions: [], storyImagePublicIds: [], storyImagePublicId: "" });
                                }}
                                disabled={storyImageUploading}
                                className="w-full rounded-lg px-3 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground disabled:opacity-50 dark:hover:bg-white/5"
                            >
                                លុបរូបទាំងអស់
                            </button>
                        )}
                        {storyImageError && (
                            <p role="alert" className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{storyImageError}</p>
                        )}
                        {!storyImageSkipped && (
                            <p className="text-[10px] leading-relaxed text-muted-foreground">
                                អាចជ្រើសរើសរូបច្រើនក្នុងពេលតែមួយ ឬបន្ថែមពេលក្រោយបាន។ រូបនឹងបង្ហាញជាមួយផ្នែករឿងរ៉ាវ ហើយអ្នកអាចលុបរូបនីមួយៗបាន។
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">ដំណើររឿងផ្តើមស្នេហ៍ (Our Love Story)</Label>
                            <DebouncedTextarea 
                                className="min-h-[85px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm"
                                value={wedding.themeSettings?.loveStory || ""} 
                                onDebouncedChange={(val) => updateTheme('loveStory', val)} 
                                placeholder="ឧ. ដំណើររឿងសេចក្តីស្រឡាញ់របស់យើងខ្ញុំ បានចាប់ផ្តើមឡើងពីថ្ងៃដែល..." 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">សារស្វាគមន៍ (Welcome Message)</Label>
                            <DebouncedTextarea 
                                className="min-h-[85px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm"
                                value={wedding.themeSettings?.welcomeMessage || ""} 
                                onDebouncedChange={(val) => updateTheme('welcomeMessage', val)} 
                                placeholder="ឧ. សូមស្វាគមន៍មកកាន់ទំព័រមង្គលការរបស់យើងខ្ញុំ..." 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">សារថ្លែងអំណរគុណ (Thank You Message)</Label>
                            <DebouncedTextarea 
                                className="min-h-[85px] rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-teal-500/20 shadow-sm"
                                value={wedding.themeSettings?.acknowledgment || ""} 
                                onDebouncedChange={(val) => updateTheme('acknowledgment', val)} 
                                placeholder="ឧ. សូមអរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តម..." 
                            />
                        </div>
                    </div>
                </AccordionItem>

                {/* 4. Social Media Links */}
                <AccordionItem 
                    id="step5-social"
                    hideWhenClosed
                    hideHeader
                    icon={MessageSquare} 
                    title="តំណភ្ជាប់បណ្តាញសង្គម"
                    subtitle="ស្រេចចិត្ត · Telegram និង Facebook សម្រាប់ភ្ញៀវទាក់ទង"
                    isOpen={selectedSectionId === 'social'}
                    onClick={() => setActiveAccordion('social')}
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
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-white"><Phone size={12} /></div>
                                <span>លេខទូរស័ព្ទ</span>
                            </Label>
                            <DebouncedInput
                                placeholder="ឧ. 012 345 678"
                                value={wedding.themeSettings?.phoneNumber || ""}
                                onDebouncedChange={(val) => updateTheme('phoneNumber', val as string)}
                                className="h-11 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 text-xs font-bold text-foreground shadow-sm dark:border-white/10 dark:bg-black/20"
                            />
                        </div>
                    </div>
                </AccordionItem>

                {/* 5. Social Link Image */}
                <AccordionItem
                    id="step5-social-preview"
                    hideWhenClosed
                    hideHeader
                    icon={Share2}
                    title="រូបភ្ជាប់មួយ Link"
                    subtitle="ស្រេចចិត្ត · រូប និងព័ត៌មានពេលផ្ញើ Link"
                    isOpen={selectedSectionId === 'social-preview'}
                    onClick={() => setActiveAccordion('social-preview')}
                >
                    <div className="space-y-3 pt-2">
                        <button
                            type="button"
                            onClick={() => socialInputRef.current?.click()}
                            className="flex min-h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white text-xs font-bold text-muted-foreground transition-colors hover:border-teal-300 hover:text-teal-600 dark:border-white/15 dark:bg-black/20"
                        >
                            {socialPreviewUrl ? (
                                <img src={socialPreviewUrl} alt="Social preview" className="h-full max-h-36 w-full object-cover" />
                            ) : (
                                <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> ជ្រើសរើសរូបភ្ជាប់ Link</span>
                            )}
                        </button>
                        <input type="file" accept="image/*" className="hidden" ref={socialInputRef} onChange={onSocialFileChange} />
                        <DebouncedInput
                            placeholder="ចំណងជើងពេលផ្ញើ Link"
                            value={wedding.themeSettings?.customLabels?.invite_title || ""}
                            onDebouncedChange={(val) => updateLabel('invite_title', val as string)}
                            className="h-11 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-bold text-foreground shadow-sm dark:border-white/10 dark:bg-black/20"
                        />
                    </div>
                </AccordionItem>

                {/* 6. Display */}
                <AccordionItem 
                    id="step5-display"
                    hideWhenClosed
                    hideHeader
                    icon={Eye} 
                    title="ការបង្ហាញ"
                    subtitle="ស្រេចចិត្ត · បើក ឬបិទផ្នែកដែលចង់បង្ហាញលើធៀប"
                    isOpen={selectedSectionId === 'display'}
                    onClick={() => setActiveAccordion('display')}
                >
                    <div className="space-y-5 pt-2">
                        {/* Visibility Toggles */}
                        <div className="space-y-2.5">
                            <Label className="text-xs font-bold text-foreground block">បើក/បិទផ្នែកលើធៀប (Section Visibility)</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {visibilityOptions
                                    .filter(({ section }) => supportedVisibilityControls.includes(section))
                                    .map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-black/20 rounded-xl border border-slate-200/80 dark:border-white/10">
                                        <div className="flex items-center gap-2.5">
                                            <Icon size={15} className="text-teal-500" />
                                            <span className="text-xs font-bold text-foreground">{label}</span>
                                        </div>
                                        <Switch 
                                            id={key} 
                                            className="data-[state=checked]:bg-teal-600"
                                            checked={wedding.themeSettings?.visibility?.[key] !== false}
                                            onCheckedChange={(checked) => { 
                                                const newVisibility = { ...(wedding.themeSettings?.visibility || {}), [key]: checked }; 
                                                updateTheme('visibility', newVisibility); 
                                            }} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </AccordionItem>

                {/* 7. Typography */}
                <AccordionItem
                    id="step5-typography"
                    hideWhenClosed
                    hideHeader
                    icon={Type}
                    title="ពុម្ពអក្សរ"
                    subtitle="រចនាប័ទ្ម · ជ្រើសរើសពុម្ពអក្សរដែលប្រើលើធៀប"
                    isOpen={selectedSectionId === 'typography'}
                    onClick={() => setActiveAccordion('typography')}
                >
                    <div className="space-y-3 pt-2">
                        {!isNeaM05 && (
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
                        )}

                            {isNeaM05 && (
                                <div className="space-y-5 border-t border-slate-200/80 pt-4 dark:border-white/10">
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-[11px] leading-relaxed dark:border-white/10 dark:bg-black/20">
                                        <p className="mb-2 font-bold text-foreground">ពុម្ពអក្សរឥតគិតថ្លៃពី Google Fonts · ផ្ទុកស្វ័យប្រវត្តិ</p>
                                        <div className="grid gap-1.5 text-muted-foreground sm:grid-cols-2">
                                            <p><span className="font-semibold text-foreground">ចំណងជើង · Headings:</span> Moul</p>
                                            <p><span className="font-semibold text-foreground">ឡូហ្គោឈ្មោះ · Name logo:</span> Moulpali</p>
                                            <p><span className="font-semibold text-foreground">អត្ថបទ · Body:</span> Kantumruy Pro</p>
                                            <p><span className="font-semibold text-foreground">អក្សរអង់គ្លេស · English script:</span> Pinyon Script + Cormorant Garamond</p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Moul" target="_blank" rel="noreferrer">Moul</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Moulpali" target="_blank" rel="noreferrer">Moulpali</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Kantumruy+Pro" target="_blank" rel="noreferrer">Kantumruy Pro</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Pinyon+Script" target="_blank" rel="noreferrer">Pinyon Script</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Cormorant+Garamond" target="_blank" rel="noreferrer">Cormorant Garamond</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Chenla" target="_blank" rel="noreferrer">Chenla</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Content" target="_blank" rel="noreferrer">Content</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Noto+Sans+Khmer" target="_blank" rel="noreferrer">Noto Sans Khmer</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Odor+Mean+Chey" target="_blank" rel="noreferrer">Odor Mean Chey</a>
                                            <a className="text-teal-700 underline underline-offset-2 dark:text-teal-300" href="https://fonts.google.com/specimen/Siemreap" target="_blank" rel="noreferrer">Siemreap</a>
                                        </div>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        ជ្រើសរើសពុម្ពអក្សរសម្រាប់ឡូហ្គោឈ្មោះ និងចំណងជើង។ អាចប្រើជម្រើសខាងក្រោម ហើយចុចលើគំរូ ដើម្បីមើលលទ្ធផល។
                                    </p>
                                    <style>{NEA_M05_FONT_OPTIONS.map(({ id, stack }) =>
                                        `.m05-font-preview-${id}{font-family:${stack}!important;}`
                                    ).join("\n")}</style>
                                    {([
                                        { key: "m05NameFont", label: "ឡូហ្គោឈ្មោះ (Name logo)", value: wedding.themeSettings?.m05NameFont || "moulpali" },
                                        { key: "m05TitleFont", label: "ចំណងជើង (Headings)", value: wedding.themeSettings?.m05TitleFont || "moul" },
                                    ] as const).map(({ key, label, value }) => (
                                        <fieldset key={key} className="space-y-2">
                                            <legend className="text-xs font-bold text-foreground">{label}</legend>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                {NEA_M05_FONT_OPTIONS.map((font) => {
                                                    const selected = value === font.id;
                                                    return (
                                                        <button
                                                            key={font.id}
                                                            type="button"
                                                            aria-pressed={selected}
                                                            onClick={() => updateTheme(key, font.id)}
                                                            className={clsx(
                                                                "min-h-[76px] rounded-xl border p-2 text-left transition-colors",
                                                                selected
                                                                    ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-500/10"
                                                                    : "border-slate-200/80 bg-slate-50/70 hover:border-teal-300 dark:border-white/10 dark:bg-black/20"
                                                            )}
                                                        >
                                                            <span className="block truncate text-[10px] font-bold text-muted-foreground">{font.name}</span>
                                                            <span className={`m05-font-preview-${font.id} mt-1 block truncate text-base text-foreground`} lang="km">
                                                                {wedding.groomName || "រ៉ា"} &amp; {wedding.brideName || "មុន្នី"}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </fieldset>
                                    ))}
                                </div>
                            )}

                        </div>
                </AccordionItem>

                {/* 6. Custom Labels */}
                <AccordionItem 
                    id="step5-labels"
                    hideWhenClosed
                    hideHeader
                    icon={Type} 
                    title="អត្ថបទលើធៀប"
                    subtitle="រចនាប័ទ្ម · ប្តូរចំណងជើង និងពាក្យដែលបង្ហាញលើធៀប"
                    isOpen={selectedSectionId === 'labels'}
                    onClick={() => setActiveAccordion('labels')}
                >
                    <LabelsSection wedding={wedding} updateTheme={updateTheme} updateLabel={updateLabel} t={t} />
                </AccordionItem>
            </div>

        </div>
    );
};

export default React.memo(Step5Extra);
