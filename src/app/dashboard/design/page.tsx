"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Music, MapPin, Video, LayoutDashboard, Palette, Image as ImageIcon, Smartphone, LayoutTemplate, Settings2, X, ChevronDown, Check, Type, Plus, Clock, Trash2, Loader2, Heart, ArrowRight, ArrowLeft, CreditCard, Facebook, Send, Wallet, Sparkles } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload-widget";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';
import clsx from "clsx";
import dynamic from 'next/dynamic';
import { isEditingLocked } from "@/lib/permissions";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { useCloudinary } from "@/hooks/use-cloudinary";

const PRESET_COLORS = ["#8E5A5A", "#1E40AF", "#047857", "#B91C1C", "#D97706", "#4B5563", "#000000", "#D4AF37"];

const TEMPLATE_LAYOUTS: Record<string, { slots: number, labels: string[] }> = {
    "modern-full": {
        slots: 7,
        labels: ["ទឹកដមបេះដូង (1)", "ទឹកដមបេះដូង (2)", "ទឹកដមបេះដូង (3)", "ទឹកដមបេះដូង (4)", "ជោគវាសនា (1)", "ជោគវាសនា (2)", "ជោគវាសនា (3)"]
    },
    "classic-khmer": { slots: 1, labels: ["រូបថតគូស្នេហ៍"] },
    "elegant-pink": { slots: 3, labels: ["រូបថតទី១", "រូបថតទី២", "រូបថតទី៣"] },
    "modern-minimal": { slots: 1, labels: ["រូបថត Cover"] },
    "khmer-legacy": { slots: 2, labels: ["Groom Profile", "Bride Profile"] },

    // Anniversary Variants
    "anniversary-golden": { slots: 7, labels: ["រូបភាពអនុស្សាវរីយ៍ (1)", "រូបភាពអនុស្សាវរីយ៍ (2)", "រូបភាពអនុស្សាវរីយ៍ (3)", "រូបភាពអនុស្សាវរីយ៍ (4)", "ជោគវាសនា (1)", "ជោគវាសនា (2)", "ជោគវាសនា (3)"] },
    "anniversary-classic": { slots: 1, labels: ["រូបថតគូស្នេហ៍"] },
    "anniversary-floral": { slots: 3, labels: ["រូបភាពអនុស្សាវរីយ៍ (1)", "រូបភាពអនុស្សាវរីយ៍ (2)", "រូបភាពអនុស្សាវរីយ៍ (3)"] }
};

import type { WeddingData } from "@/components/templates/types";

// Helper for Date Handling
const toLocalISO = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const offsetMs = d.getTimezoneOffset() * 60 * 1000;
        const localTime = new Date(d.getTime() - offsetMs);
        return localTime.toISOString().slice(0, 16);
    } catch (e) {
        return "";
    }
};

const DEFAULT_WEDDING: WeddingData = {
    id: "",
    groomName: "Long",
    brideName: "Nit",
    date: "2025-12-07T17:00:00.000Z", // Dec 7, 2025
    location: "Sokha Hotel, Phnom Penh",
    templateId: "modern-full",
    themeSettings: {
        primaryColor: "#4A5D4A",
        musicUrl: "",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        mapLink: "https://goo.gl/maps/example",
        heroImage: "/images/couple.jpg",
        groomVow: "ក្នុងរយៈពេល៤ឆ្នាំនេះ ស្នេហារបស់យើងប្រៀបដូចជាការធ្វើដំណើរដ៏អស្ចារ្យមួយ។ ថ្ងៃនេះ ខ្ញុំសូមសន្យាថានឹងដើរក្បែរគ្នាជានិច្ច មិនថាមានរឿងអ្វីកើតឡើង...",
        brideVow: "បួនឆ្នាំមកនេះ ខ្ញុំស្រឡាញ់អ្នកកាន់តែខ្លាំងពីមួយថ្ងៃទៅមួយថ្ងៃ។ ទោះបីជាពេលវេលាកន្លងផុតទៅយូរប៉ុណ្ណា ក៏ចិត្តមួយនេះនៅដដែល...",
        mainQuote: "I didn't just find love. I found a soulmate, a best friend, and my forever home in you.",
        customLabels: {
            invite_title: "សិរីសួស្តីអាពាហ៍ពិពាហ៍",
            hero_title: "Save the Date",
            timeline_title: "4-Year Journey of Love",
            gallery_title: "Our Soulmate Gallery"
        },
        parents: {
            groomFather: "Mr. Groom Father",
            groomMother: "Mrs. Groom Mother",
            groomPhone: "+855 12 345 678",
            brideFather: "Mr. Bride Father",
            brideMother: "Mrs. Bride Mother",
            bridePhone: "+855 98 765 432"
        },
        bankAccounts: [
            { bankName: "ABA Bank", accountName: "Groom Name", accountNumber: "000 000 000", qrUrl: "" },
            { bankName: "ACLEDA Bank", accountName: "Bride Name", accountNumber: "000 000 000", qrUrl: "" }
        ]
    },
    galleryItems: [
        { url: "/images/couple.jpg", type: "IMAGE" },
        { url: "/images/gallery1.jpg", type: "IMAGE" },
        { url: "/images/gallery2.jpg", type: "IMAGE" },
        { url: "/images/cover.jpg", type: "IMAGE" },
        { url: "/images/bg_enchanted.jpg", type: "IMAGE" },
        { url: "/images/bg_staircase.jpg", type: "IMAGE" },
        { url: "/images/gallery1.jpg", type: "IMAGE" }
    ],
    activities: [
        { time: "07:00", title: "ហែរជំនូន", description: "Hae Kuan Khan (Groom's Procession)" },
        { time: "08:00", title: "កាត់សក់", description: "Gaat Sah (Hair Cutting Ceremony)" },
        { time: "11:00", title: "ពិសារភោជនីយអាហារ", description: "Lunch Buffet" },
        { time: "17:00", title: "ទទួលភ្ញៀវ", description: "Evening Reception & Dinner" }
    ]
};

const STEPS = [
    { id: 1, title: "Template" },
    { id: 2, title: "ព័ត៌មាន (Info)" },
    { id: 3, title: "ពេលវេលា (Time)" },
    { id: 4, title: "រូបភាព (Media)" },
    { id: 5, title: "បន្ថែម (Extra)" }
];

const AccordionItem = ({ icon: Icon, title, subtitle, children, isOpen, onClick }: any) => (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={clsx(
                    "p-2 rounded-xl transition-colors",
                    isOpen ? "bg-red-600 text-white" : "bg-slate-50 text-slate-400"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-xs font-black text-slate-900 font-kantumruy">{title}</h3>
                    <p className="text-[10px] text-slate-400 font-medium font-kantumruy truncate max-w-[180px]">{subtitle}</p>
                </div>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pt-0 border-t border-slate-50">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const StepWizard = ({ children, currentStep, onNext, onPrev, isLast, onSave, loading }: any) => (
    <div className="flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-50">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                        <Palette className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none font-kantumruy">រចនាធៀប</h2>
                        <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-widest font-black">Design Wizard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-slate-50 p-2 px-4 rounded-full border border-slate-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Editor</span>
                    </div>
                </div>
            </div>

            {/* Progress Pills */}
            <div className="flex gap-2">
                {STEPS.map((step) => (
                    <div
                        key={step.id}
                        className={clsx(
                            "grow h-1.5 rounded-full transition-all duration-700",
                            currentStep >= step.id ? "bg-red-600" : "bg-slate-100"
                        )}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-3 px-1 font-khmer">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">ជំហានទី {currentStep} នៃ {STEPS.length}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{STEPS[currentStep - 1].title}</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 backdrop-blur-sm">
            <div className="flex gap-4 font-khmer">
                {currentStep > 1 && (
                    <Button
                        variant="ghost"
                        onClick={onPrev}
                        className="h-12 px-8 rounded-xl font-bold text-slate-500 hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2 border border-slate-200"
                    >
                        <ArrowLeft className="w-4 h-4" /> ថយក្រោយ
                    </Button>
                )}
                <Button
                    onClick={isLast ? onSave : onNext}
                    disabled={loading}
                    className={clsx(
                        "h-12 flex-1 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95",
                        isLast ? "bg-slate-900 hover:bg-black text-white shadow-slate-200" : "bg-red-600 hover:bg-red-700 text-white shadow-red-100"
                    )}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                        <>
                            {isLast ? "រក្សាទុកការកែប្រែ" : "បន្ទាប់"}
                            {!isLast && <ArrowRight className="w-5 h-5" />}
                        </>
                    )}
                </Button>
            </div>
        </div>
    </div>
);

export default function DesignPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [wedding, setWedding] = useState<WeddingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [isDraggingGallery, setIsDraggingGallery] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState<string | null>('theme');
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    // Custom Hook for Cloudinary Uploads
    const { uploadFiles, uploading: galleryUploading, progress: galleryProgress } = useCloudinary();

    const t = {
        title: "រចនាធៀប (Design Wizard)",
        publish: "ដាក់ឱ្យប្រើប្រាស់",
        saving: "កំពុងរក្សាទុក...",
        templates: {
            modern: { title: "សិរីមង្គលភាពយន្ត (Eternal Cinematic)", desc: "ពេញអេក្រង់, តន្ត្រី, វីដេអូ, ចលនា។" },
            khmer: { title: "រចនាប័ទ្មទស្សនាវដ្តីថ្នាក់ខ្ពស់ (Royal Editorial)", desc: "រចនាប័ទ្មប្រពៃណី, ពណ៌លឿង & ក្រហម។" },
            minimal: { title: "ភាពថ្លៃថ្នូរដ៏ស្រស់ស្អាត (Glass Sophistication)", desc: "ស្អាត, សាមញ្ញ, ផ្តោតលើអត្ថបទ។" },
            floral: { title: "ផ្កាក្រអូបនៃក្តីស្រឡាញ់ (Velvet Blossom)", desc: "ផ្កាស្រស់ស្អាត, ទន់ភ្លន់, រ៉ូមែនទិក។" },
            luxury: { title: "ប្រណិត (Luxury)", desc: "ពណ៌មាស, ខ្មៅ, គុណភាពខ្ពស់។" },
            pastel: { title: "Pastel Floral", desc: "ទន់ភ្លន់, ផ្កាស្រស់, ពណ៌ឡាវែនឌ័រ។" },
            legacy: { title: "កេរ្តិ៍តំណែលខ្មែរ (Khmer Legacy)", desc: "រចនាប័ទ្មបញ្ឈរ, ស្អាត, បែបអភិជន។" }
        },
    };

    useEffect(() => {
        setLoading(true);
        fetch("/api/wedding").then(async res => {
            if (res.status === 401) {
                // Clear cookie to prevent infinite redirect loop from middleware
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/login";
                return;
            }
            if (res.ok) {
                const data = await res.json();
                // Double-guard: Ensure themeSettings is an object
                if (typeof data.themeSettings === 'string' && data.themeSettings !== "") {
                    try {
                        data.themeSettings = JSON.parse(data.themeSettings);
                    } catch (e) {
                        data.themeSettings = {};
                    }
                }

                // Sanitize heroImage if it's the preview URL (common bug)
                if (data.themeSettings?.heroImage?.includes("/preview")) {
                    data.themeSettings.heroImage = "";
                }

                // Sanitize galleryItems to remove invalid preview URLs
                if (data.galleryItems && Array.isArray(data.galleryItems)) {
                    data.galleryItems = data.galleryItems.map((item: any) => {
                        if (item.url?.includes("/preview")) return { ...item, url: "" };
                        return item;
                    });
                }
                setWedding({ ...DEFAULT_WEDDING, ...data });
            } else {
                // If 404 or other error, fallback to default for now (or could redirect to create)
                console.error("Failed to fetch wedding:", res.statusText);
                setWedding(DEFAULT_WEDDING);
            }
        }).catch(err => {
            console.error("Error fetching wedding:", err);
            setWedding(DEFAULT_WEDDING);
        }).finally(() => {
            setLoading(false);
        });
    }, []);


    const updateWedding = useCallback(<K extends keyof WeddingData>(key: K, value: WeddingData[K]) => {
        setWedding((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                [key]: value
            };
        });
    }, []);

    const updateTheme = useCallback(<K extends keyof NonNullable<WeddingData['themeSettings']>>(key: K, value: NonNullable<WeddingData['themeSettings']>[K]) => {
        setWedding((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                themeSettings: {
                    ...(prev.themeSettings || {}),
                    [key]: value
                }
            };
        });
    }, []);

    const updateLabel = useCallback((key: string, value: string) => {
        setWedding((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                themeSettings: {
                    ...(prev.themeSettings || {}),
                    customLabels: {
                        ...(prev.themeSettings?.customLabels || {}),
                        [key]: value
                    }
                }
            };
        });
    }, []);

    const updateParent = useCallback((key: string, value: string) => {
        setWedding((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                themeSettings: {
                    ...(prev.themeSettings || {}),
                    parents: {
                        ...(prev.themeSettings?.parents || {}),
                        [key]: value
                    }
                }
            };
        });
    }, []);

    const updateTemplate = useCallback((templateId: string) => {
        setWedding((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                templateId: templateId
            };
        });
    }, []);

    // Bi-directional sync: Listen for image panning/adjustments from the Preview Iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "SYNC_IMAGE_POSITION" && event.data.payload) {
                const { field, value } = event.data.payload;
                updateTheme(field as any, value);
            } else if (event.data?.type === "SYNC_IMAGE_POSITION_2D" && event.data.payload) {
                const { fieldX, valueX, fieldY, valueY } = event.data.payload;
                setWedding((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        themeSettings: {
                            ...(prev.themeSettings || {}),
                            [fieldX]: valueX,
                            [fieldY]: valueY
                        }
                    };
                });
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [updateTheme]);

    const addGalleryItem = useCallback((url: string, index?: number) => {
        setWedding((prev) => {
            if (!prev) return null;
            const newItems = [...(prev.galleryItems || [])];
            if (typeof index === 'number') {
                while (newItems.length <= index) newItems.push({ url: "", type: "IMAGE" });
                newItems[index] = { url, type: "IMAGE" };
            } else {
                newItems.push({ url, type: "IMAGE" });
            }
            return {
                ...prev,
                galleryItems: newItems
            };
        });
    }, []);

    const removeGalleryItem = useCallback((index: number) => {
        setWedding((prev) => {
            if (!prev) return null;
            if (!prev.templateId) return prev;

            const layout = TEMPLATE_LAYOUTS[prev.templateId];
            if (layout && index < layout.slots) {
                // For required slots, just clear the URL but keep the slot
                const newItems = [...(prev.galleryItems || [])];
                if (newItems[index]) newItems[index] = { ...newItems[index], url: "" };
                return { ...prev, galleryItems: newItems };
            }
            // For extra gallery items, actually remove them
            return {
                ...prev,
                galleryItems: prev.galleryItems.filter((_, i) => i !== index)
            };
        });
    }, []);

    const handleGalleryDirectUpload = async (files: FileList) => {
        const fileArray = Array.from(files);
        const uploadedUrls = await uploadFiles(fileArray);

        if (uploadedUrls.length > 0) {
            setWedding((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    galleryItems: [
                        ...(prev.galleryItems || []),
                        ...uploadedUrls.map(url => ({ url, type: 'IMAGE' }))
                    ]
                };
            });
        }
    };

    const saveChanges = async () => {
        if (!wedding) return;
        setLoading(true);
        const res = await fetch("/api/wedding", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                templateId: wedding.templateId || "modern-full",
                groomName: wedding.groomName,
                brideName: wedding.brideName,
                date: wedding.date,
                location: wedding.location,
                themeSettings: wedding.themeSettings,
                galleryItems: wedding.galleryItems,
                activities: wedding.activities,
                eventType: wedding.eventType
            })
        });
        if (res.ok) alert("បានរក្សាទុកជោគជ័យ!");
        setLoading(false);
    };

    const updateEventType = (type: 'wedding' | 'anniversary') => {
        setWedding((prev) => {
            if (!prev) return null;
            // Auto-switch template if needed
            let newTemplateId = prev.templateId;
            if (type === 'anniversary' && !prev.templateId?.startsWith('anniversary')) {
                newTemplateId = 'anniversary-golden';
            } else if (type === 'wedding' && prev.templateId?.startsWith('anniversary')) {
                newTemplateId = 'modern-full';
            }
            return {
                ...prev,
                eventType: type,
                templateId: newTemplateId
            };
        });
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    if (!wedding) return <div className="flex h-[calc(100vh-4rem)] items-center justify-center">Loading...</div>;

    const isLocked = isEditingLocked(wedding);

    const renderStepContent = () => {
        if (!wedding) return null;
        switch (currentStep) {
            case 1: // Template
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <button
                                onClick={() => updateEventType('wedding')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg transition-all",
                                    wedding.eventType === 'wedding' ? "bg-white text-pink-600 shadow-sm border border-pink-100" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                ពិធីមង្គលការ (Wedding)
                            </button>
                            <button
                                onClick={() => updateEventType('anniversary')}
                                className={clsx(
                                    "px-4 py-2 rounded-lg transition-all",
                                    wedding.eventType === 'anniversary' ? "bg-white text-pink-600 shadow-sm border border-pink-100" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                ពិធីខួប (Anniversary)
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "modern-full", title: "Eternal", categories: ['wedding'], bgClass: "bg-slate-50", textClass: "text-slate-600", image: "/images/bg_tunnel.jpg" },
                                { id: "classic-khmer", title: "Royal", categories: ['wedding', 'anniversary'], bgClass: "bg-orange-50", textClass: "text-orange-600", image: "/images/couple.jpg" },
                                { id: "floral-elegant", title: "Velvet", categories: ['wedding'], bgClass: "bg-pink-50", textClass: "text-pink-600", image: "/images/bg_enchanted.jpg" },
                                { id: "modern-minimal", title: "Glass", categories: ['wedding'], bgClass: "bg-gray-50", textClass: "text-gray-600", image: "/images/couple.jpg" },
                                { id: "luxury-gold", title: "Golden", categories: ['wedding', 'anniversary'], bgClass: "bg-yellow-50", textClass: "text-yellow-700", image: "/images/bg_tunnel.jpg" },
                                { id: "pastel-floral", title: "Sweet", categories: ['wedding', 'anniversary'], bgClass: "bg-pink-50/50", textClass: "text-pink-600", image: "/images/bg_enchanted.jpg" },
                                { id: "enchanted-garden", title: "Garden", categories: ['wedding'], bgClass: "bg-emerald-50", textClass: "text-emerald-600", image: "/images/bg_enchanted.jpg" },
                                { id: "canva-style", title: "Scroll", categories: ['wedding'], bgClass: "bg-orange-50/50", textClass: "text-orange-600", image: "/images/couple.jpg" },
                                { id: "khmer-legacy", title: "Legacy", categories: ['wedding', 'anniversary'], bgClass: "bg-stone-50", textClass: "text-stone-600", image: "/images/bg_staircase.jpg" },
                            ]
                                .filter(t => t.categories.includes(wedding.eventType || 'wedding'))
                                .map((tmpl, idx) => (
                                    <motion.div
                                        key={tmpl.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => updateTemplate(tmpl.id)}
                                        className={clsx(
                                            "cursor-pointer rounded-xl p-1.5 transition-all duration-300 relative overflow-hidden group border shadow-sm hover:shadow-md",
                                            (wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'modern-full'))
                                                ? "border-pink-500 bg-pink-50/30 ring-2 ring-pink-500/10"
                                                : "border-transparent bg-gray-50 hover:bg-white hover:border-pink-200"
                                        )}
                                    >
                                        <div className={`aspect-[2/3] ${tmpl.bgClass} rounded-lg mb-2 overflow-hidden shadow-inner flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105 relative`}>
                                            {/* Image Preview */}
                                            <div className="absolute inset-0">
                                                <Image
                                                    src={tmpl.image}
                                                    alt={tmpl.title}
                                                    fill
                                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    sizes="(max-width: 768px) 33vw, 15vw"
                                                    priority
                                                />
                                            </div>
                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                            {/* Text centered or at bottom */}
                                            <div className={`relative z-10 text-center p-1 mt-auto w-full`}>
                                                <p className="text-white font-bold text-[9px] drop-shadow-md truncate w-full px-1">{tmpl.title}</p>
                                            </div>
                                        </div>
                                        {(wedding.templateId === tmpl.id || (!wedding.templateId && tmpl.id === 'modern-full')) && (
                                            <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-0.5 shadow-sm">
                                                <Check size={8} strokeWidth={3} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                );
            case 2: // Info
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2 block text-xs">កូនប្រុស (Groom)</Label>
                                <Input
                                    value={wedding.groomName}
                                    onChange={(e) => updateWedding("groomName", e.target.value)}
                                    className="mb-3"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block text-xs">កូនស្រី (Bride)</Label>
                                <Input
                                    value={wedding.brideName}
                                    onChange={(e) => updateWedding("brideName", e.target.value)}
                                    className="mb-3"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="flex items-center gap-2 mb-3"><ImageIcon className="w-4 h-4" /> រូបថតធំ (Hero Photo)</Label>
                            <ImageUpload
                                value={wedding.themeSettings?.heroImage || ""}
                                onChange={(url) => updateTheme('heroImage', url)}
                                onRemove={() => updateTheme('heroImage', '')}
                            />
                            <p className="text-xs text-gray-500 mt-2">ណែនាំ: រូបភាពការ៉េ ឬបញ្ឈរ។</p>
                        </div>
                        <div className="border-t pt-6 space-y-4">
                            <Label className="flex items-center gap-2 mb-1"><Heart size={16} className="text-pink-500" /> ពាក្យសន្យា (Vows)</Label>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1 block">សុភាសិតស្នេហា (Main Quote)</Label>
                                <textarea
                                    className="w-full p-3 text-sm border rounded-lg bg-gray-50/50 min-h-[60px] focus:ring-1 focus:ring-pink-500 outline-none"
                                    value={wedding.themeSettings?.mainQuote || ""}
                                    onChange={(e) => updateTheme('mainQuote', e.target.value)}
                                    placeholder="បញ្ចូលសុភាសិតស្នេហា..."
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1 block">ពាក្យសន្យាកូនប្រុស (Groom&apos;s Vow)</Label>
                                <textarea
                                    className="w-full p-3 text-sm border rounded-lg bg-gray-50/50 min-h-[80px] focus:ring-1 focus:ring-pink-500 outline-none"
                                    value={wedding.themeSettings?.groomVow || ""}
                                    onChange={(e) => updateTheme('groomVow', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-[10px] text-gray-500 mb-1 block">ពាក្យសន្យាកូនស្រី (Bride&apos;s Vow)</Label>
                                <textarea
                                    className="w-full p-3 text-sm border rounded-lg bg-gray-50/50 min-h-[80px] focus:ring-1 focus:ring-pink-500 outline-none"
                                    value={wedding.themeSettings?.brideVow || ""}
                                    onChange={(e) => updateTheme('brideVow', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3: // Date & Location
                return (
                    <div className="space-y-6">
                        <div>
                            <Label className="mb-2 block text-xs">កាលបរិច្ឆេទ (Date)</Label>
                            <Input
                                type="datetime-local"
                                value={toLocalISO(wedding.date)}
                                onChange={(e) => updateWedding("date", new Date(e.target.value).toISOString())}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs">ទីកន្លែង (Location)</Label>
                            <Input
                                value={wedding.location || ""}
                                onChange={(e) => updateWedding("location", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4" /> ទីតាំងលើផែនទី (Google Maps Link)</Label>
                            <DebouncedInput
                                placeholder="បញ្ចូលតំណភ្ជាប់ Google Maps..."
                                value={wedding.themeSettings?.mapLink || ""}
                                onDebouncedChange={(val) => updateTheme('mapLink', val as string)}
                            />
                        </div>
                        <div className="border-t pt-6">
                            <Label className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4" /> កម្មវិធី (Timeline)</Label>
                            <div className="space-y-3">
                                {wedding.activities?.map((activity: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <Input
                                            className="w-24"
                                            value={activity.time}
                                            onChange={(e) => {
                                                const newActs = [...(wedding.activities || [])];
                                                newActs[idx] = { ...newActs[idx], time: e.target.value };
                                                updateWedding("activities", newActs);
                                            }}
                                            placeholder="Time"
                                        />
                                        <Input
                                            className="flex-1"
                                            value={activity.description}
                                            onChange={(e) => {
                                                const newActs = [...(wedding.activities || [])];
                                                newActs[idx] = { ...newActs[idx], description: e.target.value };
                                                updateWedding("activities", newActs);
                                            }}
                                            placeholder="Description"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                const newActs = wedding.activities.filter((_: any, i: number) => i !== idx);
                                                updateWedding("activities", newActs);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setWedding((prev: any) => ({
                                            ...prev,
                                            activities: [...(prev.activities || []), { time: "00:00", description: "កម្មវិធីថ្មី", title: "Event" }]
                                        }));
                                    }}
                                    className="w-full text-xs dashed border-gray-300 text-gray-500 hover:text-pink-600 hover:border-pink-300"
                                >
                                    <Plus size={14} className="mr-1" /> Add Event
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            case 4: // Media
                return (
                    <div className="space-y-6">
                        {/* 1. SPECIAL SLOTS (If template has them) */}
                        {TEMPLATE_LAYOUTS[wedding.templateId || "modern-full"] && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 p-1 px-2 rounded inline-block">រូបភាពតាមពុម្ព (Template Required)</p>
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                                    {TEMPLATE_LAYOUTS[wedding.templateId || "modern-full"].labels.map((label, idx) => {
                                        const item = wedding.galleryItems?.[idx];
                                        const hasUrl = item && item.url;

                                        return (
                                            <div key={idx} className="space-y-1">
                                                <p className="text-[10px] font-bold text-gray-500 truncate">{label}</p>
                                                <div className="relative aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 overflow-hidden bg-white flex flex-col items-center justify-center group">
                                                    {hasUrl ? (
                                                        <>
                                                            <Image src={item.url} alt={label} className="object-cover" fill sizes="(max-width: 768px) 50vw, 33vw" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    onClick={() => removeGalleryItem(idx)}
                                                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <CldUploadWidget
                                                            onSuccess={(result: any) => addGalleryItem(result.info.secure_url, idx)}
                                                            signatureEndpoint="/api/cloudinary/sign"
                                                            uploadPreset="wedding_upload"
                                                            options={{
                                                                maxFiles: 1,
                                                                sources: ['local'],
                                                                cropping: true,
                                                                croppingAspectRatio: idx < 2 ? 4 / 5 : undefined,
                                                                croppingShowBackButton: true
                                                            }}
                                                        >
                                                            {({ open }) => (
                                                                <button onClick={() => open()} className="w-full h-full flex flex-col items-center justify-center gap-2 group-hover:bg-pink-50 transition-colors">
                                                                    <Plus size={16} className="text-gray-400 group-hover:text-pink-500" />
                                                                    <span className="text-[9px] text-gray-400 font-bold group-hover:text-pink-600">បន្ថែម</span>
                                                                </button>
                                                            )}
                                                        </CldUploadWidget>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. GENERAL GALLERY (Flexible) */}
                        <div className="space-y-3 pt-4 border-t border-dashed">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 p-1 px-2 rounded inline-block">រូបភាពរួម (Gallery)</p>
                            <div className="grid grid-cols-3 gap-2">
                                {wedding.galleryItems?.map((item: any, idx: number) => {
                                    // Skip special slots if they exist
                                    const isSpecial = TEMPLATE_LAYOUTS[wedding.templateId || "modern-full"] && idx < TEMPLATE_LAYOUTS[wedding.templateId || "modern-full"].slots;
                                    if (isSpecial || !item.url) return null;

                                    return (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden group border">
                                            <Image src={item.url} alt="Extra Gallery" className="object-cover" fill sizes="(max-width: 768px) 33vw, 20vw" />
                                            <button
                                                onClick={() => removeGalleryItem(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* ADD BUTTON ALWAYS AVAILABLE */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                                    onDragLeave={() => setIsDraggingGallery(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDraggingGallery(false); handleGalleryDirectUpload(e.dataTransfer.files); }}
                                    className={clsx(
                                        "aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group relative",
                                        isDraggingGallery ? "border-pink-500 bg-pink-50 scale-105" : "border-gray-200 bg-gray-50 hover:bg-white hover:border-pink-300"
                                    )}
                                >
                                    {galleryUploading ? (
                                        <div className="flex flex-col items-center gap-2 p-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                                            <span className="text-[8px] font-bold text-pink-600">{galleryProgress}%</span>
                                        </div>
                                    ) : (
                                        <CldUploadWidget
                                            onSuccess={(result: any) => addGalleryItem(result.info.secure_url)}
                                            signatureEndpoint="/api/cloudinary/sign"
                                            uploadPreset="wedding_upload"
                                            options={{
                                                multiple: true,
                                                maxFiles: 50,
                                                sources: ['local'],
                                                cropping: true
                                            }}
                                        >
                                            {({ open }) => (
                                                <button onClick={() => open()} className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                    <Plus size={20} className="text-gray-400 group-hover:text-pink-500" />
                                                    <span className="text-[9px] text-gray-500 font-bold">បញ្ចូល (Add)</span>
                                                </button>
                                            )}
                                        </CldUploadWidget>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Style Selector */}
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Label className="text-[10px] text-gray-400 font-bold uppercase mb-3 block">រចនាបថរូបភាព (Gallery Style)</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['masonry', 'slider', 'polaroid'].map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => updateTheme('galleryStyle', style as any)}
                                            className={clsx(
                                                "py-2 rounded-lg text-[10px] font-bold uppercase transition-all border",
                                                (wedding.themeSettings as any)?.galleryStyle === style || (style === 'masonry' && !(wedding.themeSettings as any)?.galleryStyle)
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                            )}
                                        >
                                            {style === 'masonry' ? 'ក្រឡា (Grid)' : style === 'slider' ? 'រំកិល (Slide)' : 'ប៉ុឡារ៉ូអ៊ីត (Polaroid)'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Music className="w-4 h-4" />
                                    <Label className="block text-xs">តន្ត្រី (Background Music)</Label>
                                </div>
                            </div>
                            <AudioUploadWidget
                                value={wedding.themeSettings?.musicUrl || ""}
                                onChange={(url) => updateTheme('musicUrl', url)}
                                onRemove={() => updateTheme('musicUrl', "")}
                            />
                        </div>

                        {/* DETAILED HERO ADJUSTMENTS */}
                        <div className="space-y-4 pt-4 border-t border-dashed">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                <Label className="text-xs font-bold font-kantumruy">រៀបចំប្លង់រូបភាព Hero (Hero Adjustments)</Label>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {/* Vertical / Horizontal Pan */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase">Vertical Pos</Label>
                                        <span className="text-[10px] font-bold text-gray-400">{(wedding.themeSettings as any)?.heroImagePosition || '50%'}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" step="1"
                                        value={parseInt((wedding.themeSettings as any)?.heroImagePosition?.replace('%', '') || '50')}
                                        onChange={(e) => updateTheme('heroImagePosition', `${e.target.value}%`)}
                                        className="w-full accent-pink-500 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                    />

                                    <div className="flex justify-between items-center px-1 mt-2">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase">Horizontal Pos</Label>
                                        <span className="text-[10px] font-bold text-gray-400">{(wedding.themeSettings as any)?.heroImageX || '50%'}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" step="1"
                                        value={parseInt((wedding.themeSettings as any)?.heroImageX?.replace('%', '') || '50')}
                                        onChange={(e) => updateTheme('heroImageX', `${e.target.value}%`)}
                                        className="w-full accent-pink-500 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Scale (Zoom) */}
                                <div className="space-y-2 pt-2 border-t border-slate-200">
                                    <div className="flex justify-between items-center px-1">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase">Zoom / Scale</Label>
                                        <span className="text-[10px] font-bold text-gray-400">{((wedding.themeSettings as any)?.heroImageScale || 1).toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="3" step="0.1"
                                        value={(wedding.themeSettings as any)?.heroImageScale || 1}
                                        onChange={(e) => updateTheme('heroImageScale', parseFloat(e.target.value))}
                                        className="w-full accent-emerald-500 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Filters (Brightness / Contrast) */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase block">Brightness</Label>
                                        <input
                                            type="range" min="50" max="150" step="1"
                                            value={(wedding.themeSettings as any)?.heroImageBrightness || 100}
                                            onChange={(e) => updateTheme('heroImageBrightness', parseInt(e.target.value))}
                                            className="w-full accent-amber-500 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase block">Contrast</Label>
                                        <input
                                            type="range" min="50" max="150" step="1"
                                            value={(wedding.themeSettings as any)?.heroImageContrast || 100}
                                            onChange={(e) => updateTheme('heroImageContrast', parseInt(e.target.value))}
                                            className="w-full accent-indigo-500 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[9px] text-gray-400 italic">សារ៉េទីតាំង និងពណ៌រូបភាព Hero ឱ្យស្អាតបំផុតតាមប្លង់ធៀបការងារ។</p>
                        </div>

                        <div className="mt-6">
                            <Label className="flex items-center gap-2 mb-3"><Video className="w-4 h-4" /> វីដេអូ (YouTube Video)</Label>
                            <DebouncedInput
                                placeholder="បញ្ចូលតំណភ្ជាប់ YouTube..."
                                value={wedding.themeSettings?.videoUrl || ""}
                                onDebouncedChange={(val) => updateTheme('videoUrl', val as string)}
                                className="mb-2"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 mb-3"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</Label>
                                    <DebouncedInput
                                        placeholder="បញ្ចូលតំណភ្ជាប់ Facebook..."
                                        value={wedding.themeSettings?.facebookUrl || ""}
                                        onDebouncedChange={(val) => updateTheme('facebookUrl', val as string)}
                                    />
                                    <p className="text-[10px] text-gray-400">ឧទាហរណ៍: facebook.com/your-profile</p>
                                </div>
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 mb-3"><Send className="w-4 h-4 text-sky-500" /> Telegram</Label>
                                    <DebouncedInput
                                        placeholder="បញ្ចូលតំណភ្ជាប់ Telegram..."
                                        value={wedding.themeSettings?.telegramUrl || ""}
                                        onDebouncedChange={(val) => updateTheme('telegramUrl', val as string)}
                                    />
                                    <p className="text-[10px] text-gray-400">ឧទាហរណ៍: t.me/username</p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <Label className="flex items-center gap-2 mb-3"><Wallet className="w-4 h-4 text-emerald-600" /> គណនីធនាគារ (Payment / QR URL)</Label>
                                <ImageUpload
                                    value={wedding.themeSettings?.paymentQrUrl || ""}
                                    onChange={(url) => updateTheme('paymentQrUrl', url)}
                                    onRemove={() => updateTheme('paymentQrUrl', "")}
                                />
                                <p className="text-[10px] text-gray-400 mt-2">ណែនាំ: រូបភាព QR Code នឹងត្រូវបានទាញយកដោយស្វ័យប្រវត្តិ។</p>
                            </div>
                        </div>
                    </div>
                );
            case 5: // Theme & Extra
                return (
                    <div className="space-y-4 pb-10 font-khmer">
                        <p className="text-xs text-gray-500 mb-4 bg-pink-50/50 p-3 rounded-xl border border-pink-100 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                            បំពេញព័ត៌មានបន្ថែមដើម្បីឱ្យធៀបរបស់អ្នកកាន់តែប្លែក និងទាក់ទាញ។
                        </p>

                        <div className="space-y-3">
                            {/* SECTION 1: THEME & MUSIC */}
                            <AccordionItem
                                icon={Palette}
                                title="រចនា & តន្ត្រី"
                                subtitle="ជ្រើសរើសពណ៌ និងតន្ត្រី"
                                isOpen={activeAccordion === 'theme'}
                                onClick={() => setActiveAccordion(activeAccordion === 'theme' ? null : 'theme')}
                            >
                                <div className="space-y-6 pt-2">
                                    <div>
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">ពណ៌ចម្បង (Primary Color)</Label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {PRESET_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => updateTheme('primaryColor', color)}
                                                    className={clsx(
                                                        "w-10 h-10 rounded-full border-4 shadow-sm transition-transform hover:scale-110",
                                                        wedding.themeSettings?.primaryColor === color ? "border-gray-900 scale-110" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                                                <DebouncedInput
                                                    type="color"
                                                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                                    value={wedding.themeSettings?.primaryColor || "#8E5A5A"}
                                                    onDebouncedChange={(val) => updateTheme('primaryColor', val as string)}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2">ណែនាំ: ពណ៌នេះនឹងប្រើសម្រាប់អក្សរ និងប៊ូតុងសំខាន់ៗ។</p>
                                    </div>

                                    <div>
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">តន្ត្រី (Background Music URL)</Label>
                                        <DebouncedInput
                                            placeholder="បញ្ចូលតំណភ្ជាប់ MP3..."
                                            value={wedding.themeSettings?.musicUrl || ""}
                                            className="h-11 rounded-xl bg-gray-50 border-gray-100 font-sans"
                                            onDebouncedChange={(val) => updateTheme('musicUrl', val as string)}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2">បញ្ចូលតំណភ្ជាប់ MP3 ដែលអាចលេងបានផ្ទាល់។</p>
                                    </div>
                                </div>
                            </AccordionItem>

                            {/* SECTION 2: FAMILY INFO */}
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
                                            <h4 className="text-[11px] font-bold text-gray-800 uppercase">ខាងកូនប្រុស</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input placeholder="ឈ្មោះឪពុក" className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.parents?.groomFather || ""} onChange={(e) => updateParent('groomFather', e.target.value)} />
                                            <Input placeholder="ឈ្មោះម្តាយ" className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.parents?.groomMother || ""} onChange={(e) => updateParent('groomMother', e.target.value)} />
                                        </div>
                                        <Input placeholder="លេខទូរស័ព្ទ (សម្រាប់ភ្ញៀវទាក់ទង)" className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.parents?.groomPhone || ""} onChange={(e) => updateParent('groomPhone', e.target.value)} />
                                    </div>
                                    <div className="space-y-4 pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                            <h4 className="text-[11px] font-bold text-gray-800 uppercase">ខាងកូនស្រី</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input placeholder="ឈ្មោះឪពុក" className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.parents?.brideFather || ""} onChange={(e) => updateParent('brideFather', e.target.value)} />
                                            <Input placeholder="ឈ្មោះម្តាយ" className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.parents?.brideMother || ""} onChange={(e) => updateParent('brideMother', e.target.value)} />
                                        </div>
                                        <Input placeholder="លេខទូរស័ព្ទ (សម្រាប់ភ្ញៀវទាក់ទង)" className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.parents?.bridePhone || ""} onChange={(e) => updateParent('bridePhone', e.target.value)} />
                                    </div>
                                </div>
                            </AccordionItem>

                            {/* SECTION 3: PAYMENTS */}
                            <AccordionItem
                                icon={CreditCard}
                                title="គណនីធនាគារ"
                                subtitle="សម្រាប់ភ្ញៀវផ្ញើចំណងដៃ"
                                isOpen={activeAccordion === 'payment'}
                                onClick={() => setActiveAccordion(activeAccordion === 'payment' ? null : 'payment')}
                            >
                                <div className="space-y-4 pt-2">
                                    {wedding.themeSettings?.bankAccounts?.map((acc: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 relative group">
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
                                                    className="w-full h-10 border border-gray-200 rounded-lg px-2 bg-white text-xs"
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
                                                className="h-10 text-xs rounded-lg"
                                                value={acc.accountNumber}
                                                onChange={(e) => {
                                                    const newAccs = [...(wedding.themeSettings?.bankAccounts || [])];
                                                    newAccs[idx] = { ...newAccs[idx], accountNumber: e.target.value };
                                                    updateTheme('bankAccounts', newAccs);
                                                }}
                                            />
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
                                    <p className="text-[10px] text-gray-400">ណែនាំ: អ្នកអាចបញ្ចូលបានច្រើនគណនីតាមតម្រូវការ។</p>
                                </div>
                            </AccordionItem>

                            {/* SECTION 4: LABELS */}
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
                                            <Label className="text-[10px] text-gray-400 font-bold uppercase ml-1">ចំណងជើងធំ (Main Title)</Label>
                                            <Input className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.customLabels?.invite_title || ""} onChange={(e) => updateLabel('invite_title', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-gray-400 font-bold uppercase ml-1">ចំណងជើងវិចិត្រសាល (Gallery)</Label>
                                            <Input className="h-11 rounded-xl bg-gray-50 border-gray-100" value={wedding.themeSettings?.customLabels?.gallery_title || ""} onChange={(e) => updateLabel('gallery_title', e.target.value)} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400">ណែនាំ: កែប្រែអត្ថបទទាំងនេះដើម្បីឱ្យសមស្របតាមចំណូលចិត្តរបស់អ្នក។</p>
                                </div>
                            </AccordionItem>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const editorPanel = (
        <div className="flex-1 min-h-0 bg-white/60 backdrop-blur-2xl border-r border-gray-100 shadow-2xl z-20">
            <StepWizard
                currentStep={currentStep}
                onNext={nextStep}
                onPrev={prevStep}
                isLast={currentStep === STEPS.length}
                onSave={saveChanges}
                loading={loading}
            >
                {renderStepContent()}
            </StepWizard>
        </div>
    );

    // Separate Desktop and Mobile Layouts

    // DESKTOP LAYOUT (In-flow, managed by DashboardLayout)
    const desktopLayout = (
        <div className="hidden md:flex h-full w-full flex-row overflow-hidden bg-gray-50 relative">
            {/* 1. EDITOR PANEL (Left Sidebar) */}
            <div className="flex-none w-[400px] flex flex-col z-20 relative bg-white border-r border-gray-200 shadow-sm h-full">
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Right Fluid) */}
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-12 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-slate-100 rounded-full blur-[100px]"></div>
                </div>

                {/* Desktop Preview Container */}
                <motion.div
                    layout
                    className="relative z-10 bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-in-out flex flex-col group origin-top w-[95%] h-[85vh] rounded-xl border-[4px] border-gray-900/10 ring-1 ring-gray-900/5"
                >
                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        className="w-full h-full border-none bg-white"
                        title="Preview"
                    />
                </motion.div>

                <PreviewSync wedding={wedding} iframeRef={iframeRef} currentStep={currentStep} enableScrollSync={false} />

                {/* View Toggle (Desktop Only) */}
                <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg gap-1 border border-gray-100 flex">
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'mobile' ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        )}
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'desktop' ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        )}
                        title="Desktop View"
                    >
                        <LayoutTemplate size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    // MOBILE LAYOUT (Portal to Body, Full Screen Overlay)
    // Only render if mounted and on mobile (we use CSS md:hidden on the wrapper to handle resizing)
    const mobileLayout = mounted ? createPortal(
        <div className="md:hidden fixed inset-0 w-screen h-[100dvh] z-[99999] bg-white flex flex-col overflow-hidden pt-[115px]" role="dialog" aria-label="Mobile Design Editor">
            {/* MOBILE HEADER (Fixed Top) */}
            <div className="fixed top-0 left-0 right-0 h-[115px] bg-white border-b border-gray-200 z-[100000] shadow-md flex flex-col">
                {/* Row 1: Dashboard Nav & Tabs */}
                <div className="flex items-center px-4 pt-10 pb-2 gap-2">
                    <Link href="/dashboard" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1 bg-slate-100 p-1 rounded-xl flex relative h-9 font-khmer">
                        <button
                            onClick={() => setMobileTab('editor')}
                            className={clsx(
                                "flex-1 text-[10px] font-bold rounded-lg transition-all z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'editor' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Settings2 size={13} /> រចនា
                        </button>
                        <button
                            onClick={() => setMobileTab('preview')}
                            className={clsx(
                                "flex-1 text-[10px] font-bold rounded-lg transition-all z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'preview' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Smartphone size={13} /> មើលមុន
                        </button>
                    </div>
                </div>

                {/* Row 2: Step Navigation */}
                <div className="flex items-center justify-between px-4 pb-2 border-t border-gray-100 pt-1.5 bg-gray-50/50 font-khmer">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="text-gray-500 hover:text-gray-900 h-7 px-2 text-[10px]"
                    >
                        <ArrowLeft size={14} className="mr-1" /> ថយក្រោយ
                    </Button>

                    <span className="text-[10px] font-medium text-gray-500">
                        ជំហានទី {currentStep} / {STEPS.length}
                    </span>

                    {currentStep < STEPS.length ? (
                        <Button
                            size="sm"
                            onClick={nextStep}
                            className="bg-slate-900 text-white hover:bg-black h-7 px-3 rounded-full text-[10px]"
                        >
                            បន្ទាប់ <ArrowRight size={14} className="ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={saveChanges}
                            disabled={loading}
                            className="bg-red-600 text-white hover:bg-red-700 h-7 px-3 rounded-full text-[10px]"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "បោះពុម្ពផ្សាយ"}
                        </Button>
                    )}
                </div>
            </div>

            {/* 1. EDITOR PANEL (Full Content when active) */}
            <div className={clsx(
                "flex-1 flex-col z-20 relative bg-white",
                mobileTab === 'editor' ? "flex h-full overflow-y-auto" : "hidden"
            )}>
                {/* Re-render editor panel directly. Since it's a variable, it works.
                     Note: The sticky footer inside editorPanel will appear. We should hide it on mobile via CSS
                     (which we did: 'hidden md:flex' on that footer div). */}
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Full Content when active) */}
            <div className={clsx(
                "flex-1 bg-gray-100 items-center justify-center p-0 relative overflow-hidden",
                mobileTab === 'preview' ? "flex h-full" : "hidden"
            )}>
                {/* Mobile Preview Container */}
                <div className="w-full h-full bg-white relative">
                    {/* We need a second iframe reference or just render iframe.
                          Providing a new ref 'mobileIframeRef' would be better to avoid conflict if both mount.
                          But keeping it simple: render iframe. Sync will handle it if we duplicate the Sync component?
                          PreviewSync uses 'iframeRef'. We should duplicate the Sync with a NEW ref for mobile.
                       */}
                    <MobilePreviewWrapper wedding={wedding} currentStep={currentStep} />
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            {desktopLayout}
            {mobileLayout}
        </>
    );
}

// Helper for Mobile Preview to have its own ref
function MobilePreviewWrapper({ wedding, currentStep }: { wedding: WeddingData | null, currentStep: number }) {
    const mobileIframeRef = useRef<HTMLIFrameElement>(null);
    return (
        <>
            <iframe
                ref={mobileIframeRef}
                src="/preview"
                className="w-full h-full border-none bg-white"
                title="Mobile Preview"
            />
            <PreviewSync wedding={wedding} iframeRef={mobileIframeRef} currentStep={currentStep} enableScrollSync={true} />
        </>
    );
}


function PreviewSync({ wedding, iframeRef, currentStep, enableScrollSync = true }: { wedding: WeddingData | null, iframeRef: React.RefObject<HTMLIFrameElement>, currentStep: number, enableScrollSync?: boolean }) {
    // Debounce to prevent frequent updates while typing
    const debouncedWedding = useDebounce(wedding, 300);

    // 1. Send data when debounced wedding changes
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow && debouncedWedding) {
            iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: debouncedWedding }, "*");
        }
    }, [debouncedWedding, iframeRef]);

    // 1.5. Real-time sync for specific fields (bypass debounce for better UX)
    useEffect(() => {
        if (iframeRef.current && iframeRef.current.contentWindow && wedding) {
            const settings = wedding.themeSettings as any;
            if (settings) {
                iframeRef.current.contentWindow.postMessage({
                    type: "UPDATE_PREVIEW_PARTIAL",
                    payload: {
                        heroImagePosition: settings.heroImagePosition,
                        heroImageX: settings.heroImageX,
                        heroImageScale: settings.heroImageScale,
                        heroImageBrightness: settings.heroImageBrightness,
                        heroImageContrast: settings.heroImageContrast,
                        groomImagePosition: settings.groomImagePosition,
                        groomImageX: settings.groomImageX,
                        groomImageScale: settings.groomImageScale,
                        brideImagePosition: settings.brideImagePosition,
                        brideImageX: settings.brideImageX,
                        brideImageScale: settings.brideImageScale
                    }
                }, "*");
            }
        }
    }, [
        wedding?.themeSettings?.heroImagePosition,
        (wedding?.themeSettings as any)?.heroImageX,
        (wedding?.themeSettings as any)?.heroImageScale,
        (wedding?.themeSettings as any)?.heroImageBrightness,
        (wedding?.themeSettings as any)?.heroImageContrast,
        wedding?.themeSettings?.groomImagePosition,
        (wedding?.themeSettings as any)?.groomImageX,
        (wedding?.themeSettings as any)?.groomImageScale,
        wedding?.themeSettings?.brideImagePosition,
        (wedding?.themeSettings as any)?.brideImageX,
        (wedding?.themeSettings as any)?.brideImageScale,
        iframeRef
    ]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "PREVIEW_READY") {
                if (iframeRef.current && iframeRef.current.contentWindow && wedding) {
                    iframeRef.current.contentWindow.postMessage({ type: "UPDATE_PREVIEW", payload: wedding }, "*");
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [wedding, iframeRef]);

    // 3. Scroll Sync
    useEffect(() => {
        if (!iframeRef.current?.contentWindow || !enableScrollSync) return;

        const sectionMap: Record<number, string> = {
            1: 'hero',
            2: 'hero',
            3: 'event-info',
            4: 'gallery',
            5: 'guestbook'
        };

        const sectionId = sectionMap[currentStep];
        if (sectionId) {
            iframeRef.current.contentWindow.postMessage({ type: "SCROLL_TO_SECTION", payload: sectionId }, "*");
        }
    }, [currentStep, iframeRef, enableScrollSync]);

    return null;
}
