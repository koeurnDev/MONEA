"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Smartphone, LayoutTemplate, Settings2, X, Loader2, ArrowRight, ArrowLeft, StickyNote, Save } from "lucide-react";

import ImageUpload from "@/components/ui/image-upload-widget";
import AudioUploadWidget from "@/components/ui/audio-upload-widget";
import Image from "next/image";
import { CldUploadWidget } from 'next-cloudinary';
import clsx from "clsx";

import Step1Template from "./components/Step1Template";
import Step2Info from "./components/Step2Info";
import Step3Time from "./components/Step3Time";
import Step4Media from "./components/Step4Media";
import Step5Extra from "./components/Step5Extra";
import useSWR from "swr";
import { useCloudinary } from "@/hooks/use-cloudinary";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const PRESET_COLORS = ["#8E5A5A", "#1E40AF", "#047857", "#B91C1C", "#D97706", "#4B5563", "#000000", "#D4AF37"];

const TEMPLATE_LAYOUTS: Record<string, { slots: number, labels: string[] }> = {
    "vip-premium-khmer": {
        slots: 7,
        labels: ["ទឹកដមបេះដូង (1)", "ទឹកដមបេះដូង (2)", "ទឹកដមបេះដូង (3)", "ទឹកដមបេះដូង (4)", "ជោគវាសនា (1)", "ជោគវាសនា (2)", "ជោគវាសនា (3)"]
    },
    "modern-black-white": { slots: 1, labels: ["រូបថតគូស្នេហ៍"] },
    "elegant-pink": { slots: 3, labels: ["រូបថតទី១", "រូបថតទី២", "រូបថតទី៣"] },
    "modern-minimal": { slots: 1, labels: ["រូបថត Cover"] },
    "khmer-legacy": { slots: 2, labels: ["Groom Profile", "Bride Profile"] },

    // Anniversary Variants
    "anniversary-golden": { slots: 7, labels: ["រូបភាពអនុស្សាវរីយ៍ (1)", "រូបភាពអនុស្សាវរីយ៍ (2)", "រូបភាពអនុស្សាវរីយ៍ (3)", "រូបភាពអនុស្សាវរីយ៍ (4)", "ជោគវាសនា (1)", "ជោគវាសនា (2)", "ជោគវាសនា (3)"] },
    "anniversary-classic": { slots: 1, labels: ["រូបថតគូស្នេហ៍"] },
    "anniversary-floral": { slots: 3, labels: ["រូបភាពអនុស្សាវរីយ៍ (1)", "រូបភាពអនុស្សាវរីយ៍ (2)", "រូបភាពអនុស្សាវរីយ៍ (3)"] },
    "visionary-modern": { slots: 1, labels: ["រូបថតបេះដូង"] }
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
    templateId: "vip-premium-khmer",
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


const StepWizard = ({ children, currentStep, onNext, onPrev, isLast, onSave, loading, setStep }: any) => (
    <div className="flex flex-col h-full bg-card overflow-hidden z-20 border-r border-border shadow-2xl dark:shadow-none">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border shadow-sm z-10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg dark:shadow-none">
                        <Palette className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight leading-none font-kantumruy">រចនាធៀប</h2>
                        <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest font-black">Design Wizard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-muted p-2 px-4 rounded-full border border-border flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Editor</span>
                    </div>
                </div>
            </div>

            {/* Progress Pills */}
            <div className="flex gap-2">
                {STEPS.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => setStep && setStep(step.id)}
                        disabled={loading}
                        className={clsx(
                            "grow h-1.5 rounded-full transition-all duration-700 hover:opacity-80 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                            currentStep >= step.id ? "bg-red-600" : "bg-muted"
                        )}
                        title={step.title}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-3 px-1 font-khmer">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">ជំហានទី {currentStep} នៃ {STEPS.length}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{STEPS[currentStep - 1].title}</span>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="h-full w-full">
                {children}
            </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-muted/50 border-t border-border backdrop-blur-sm">
            <div className="flex gap-4 font-khmer">
                {currentStep > 1 && (
                    <Button
                        variant="ghost"
                        onClick={onPrev}
                        className="h-12 px-8 rounded-xl font-bold text-muted-foreground hover:bg-background hover:text-foreground transition-all flex items-center gap-2 border border-border"
                    >
                        <ArrowLeft className="w-4 h-4" /> ថយក្រោយ
                    </Button>
                )}
                <Button
                    onClick={isLast ? onSave : onNext}
                    disabled={loading}
                    className={clsx(
                        "h-12 flex-1 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95",
                        isLast ? "bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white shadow-none" : "bg-red-600 hover:bg-red-700 text-white shadow-red-100 dark:shadow-none"
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
    const [templateVersions, setTemplateVersions] = useState<any[]>([]);
    const [fetchingVersions, setFetchingVersions] = useState(false);
    const [newVersionTitle, setNewVersionTitle] = useState("");
    const [isSavingVersion, setIsSavingVersion] = useState(false);
    const [rollbackConfirm, setRollbackConfirm] = useState<{ open: boolean; versionId: string }>({ open: false, versionId: "" });
    const [rollbackLoading, setRollbackLoading] = useState(false);
    const [deleteVersionConfirm, setDeleteVersionConfirm] = useState<{ open: boolean; versionId: string }>({ open: false, versionId: "" });
    const [saveToast, setSaveToast] = useState<"success" | "error" | null>(null);
    const [versionToast, setVersionToast] = useState(false);
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
            legacy: { title: "កេរ្តិ៍តំណែលខ្មែរ (Khmer Legacy)", desc: "រចនាប័ទ្មបញ្ឈរ, ស្អាត, បែបអភិជន។" },
            visionary: { title: "ទស្សនវិជ្ជាទំនើប (Visionary Modern)", desc: "រចនាប័ទ្មអនាគត, ពណ៌ខៀវចាស់, ចលនាអស្ចារ្យ។" },
            celestial: { title: "សម្រស់ចក្រវាល (Celestial Elegance)", desc: "រចនាប័ទ្មអវកាស, ពណ៌ខ្មៅប្រណិត, ចលនាផ្កាយ។" }
        },
    };

    // --- DATA FETCHING (Optimized with SWR) ---
    const { data: swrWedding, error: swrError, mutate } = useSWR("/api/wedding?full=true", fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 10000,
    });

    useEffect(() => {
        if (swrWedding) {
            if (swrWedding.id) {
                let data = { ...swrWedding };
                // Double-guard: Ensure themeSettings is an object
                if (typeof data.themeSettings === 'string' && data.themeSettings !== "") {
                    try {
                        data.themeSettings = JSON.parse(data.themeSettings);
                    } catch (e) {
                        data.themeSettings = {};
                    }
                }

                // Sanitize heroImage if it's the preview URL
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
                setWedding(DEFAULT_WEDDING);
            }
            setLoading(false);
        } else if (swrError) {
            console.error("SWR Fetch Error:", swrError);
            setWedding(DEFAULT_WEDDING);
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [swrWedding, swrError]);


    const updateWedding = useCallback(<K extends keyof WeddingData>(key: K, value: WeddingData[K]) => {
        setWedding((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                [key]: value
            };
        });
    }, []);

    const updateTheme = useCallback((key: string, value: any) => {
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
                templateId: wedding.templateId || "vip-premium-khmer",
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
        if (res.ok) {
            setSaveToast("success");
            setTimeout(() => setSaveToast(null), 3000);
        }
        setLoading(false);
    };

    const updateEventType = useCallback((type: 'wedding' | 'anniversary') => {
        setWedding((prev) => {
            if (!prev) return null;
            // Auto-switch template if needed
            let newTemplateId = prev.templateId;
            if (type === 'anniversary' && !prev.templateId?.startsWith('anniversary')) {
                newTemplateId = 'anniversary-golden';
            } else if (type === 'wedding' && prev.templateId?.startsWith('anniversary')) {
                newTemplateId = 'vip-premium-khmer';
            }
            return {
                ...prev,
                eventType: type,
                templateId: newTemplateId
            };
        });
    }, []);

    const fetchVersions = useCallback(async () => {
        if (!wedding?.id) return;
        setFetchingVersions(true);
        try {
            const res = await fetch(`/api/templates/versions?weddingId=${wedding.id}`);
            if (res.ok) {
                const data = await res.json();
                setTemplateVersions(data);
            }
        } catch (error) {
            console.error("Failed to fetch versions:", error);
        } finally {
            setFetchingVersions(false);
        }
    }, [wedding?.id]);

    const handleSaveVersion = useCallback(async () => {
        if (!wedding?.id || !newVersionTitle) return;
        setIsSavingVersion(true);
        try {
            const res = await fetch("/api/templates/versions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weddingId: wedding.id,
                    versionName: newVersionTitle,
                    description: "Saved from editor"
                })
            });
            if (res.ok) {
                const newVer = await res.json();
                setTemplateVersions(prev => [newVer, ...prev]);
                setNewVersionTitle("");
                setVersionToast(true);
                setTimeout(() => setVersionToast(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save version:", error);
        } finally {
            setIsSavingVersion(false);
        }
    }, [wedding?.id, newVersionTitle]);

    const handleRollback = useCallback(async (versionId: string) => {
        setRollbackConfirm({ open: true, versionId });
    }, []);

    const confirmRollback = async () => {
        setRollbackLoading(true);
        try {
            const res = await fetch("/api/templates/versions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: rollbackConfirm.versionId })
            });
            if (res.ok) {
                const result = await res.json();
                setWedding(prev => {
                    if (!prev) return null;
                    let themeSettings = result.themeSettings;
                    if (typeof themeSettings === 'string') {
                        try { themeSettings = JSON.parse(themeSettings); } catch (e) { themeSettings = {}; }
                    }
                    return { ...prev, templateId: result.templateId, themeSettings };
                });
                setRollbackConfirm({ open: false, versionId: "" });
            }
        } catch (error) {
            console.error("Rollback failed:", error);
        } finally {
            setRollbackLoading(false);
        }
    };

    const handleDeleteVersion = useCallback(async (versionId: string) => {
        setDeleteVersionConfirm({ open: true, versionId });
    }, []);

    const confirmDeleteVersion = async () => {
        try {
            const res = await fetch(`/api/templates/versions?id=${deleteVersionConfirm.versionId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setTemplateVersions((prev: any[]) => prev.filter((v: any) => v.id !== deleteVersionConfirm.versionId));
                setDeleteVersionConfirm({ open: false, versionId: "" });
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };


    // Note: Quick Notes feature removed.

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    if (!wedding) return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest font-kantumruy">កំពុងទាញយកទិន្នន័យចំណងដៃ...</p>
        </div>
    );

    const isLocked = false; // Temporary bypass

    const renderStepContent = () => {
        if (!wedding) return null;
        switch (currentStep) {
            case 1:
                return <Step1Template wedding={wedding} updateEventType={updateEventType} updateTemplate={updateTemplate} />;
            case 2:
                return <Step2Info wedding={wedding} updateWedding={updateWedding} updateTheme={updateTheme} />;
            case 3:
                return <Step3Time wedding={wedding} updateWedding={updateWedding} updateTheme={updateTheme} setWedding={setWedding} />;
            case 4:
                return (
                    <Step4Media
                        wedding={wedding}
                        updateTheme={updateTheme}
                        addGalleryItem={addGalleryItem}
                        removeGalleryItem={removeGalleryItem}
                        handleGalleryDirectUpload={handleGalleryDirectUpload}
                        galleryUploading={galleryUploading}
                        galleryProgress={galleryProgress}
                        isDraggingGallery={isDraggingGallery}
                        setIsDraggingGallery={setIsDraggingGallery}
                        TEMPLATE_LAYOUTS={TEMPLATE_LAYOUTS}
                    />
                );
            case 5:
                return (
                    <Step5Extra
                        wedding={wedding}
                        updateTheme={updateTheme}
                        updateParent={updateParent}
                        updateLabel={updateLabel}
                        handleSaveVersion={handleSaveVersion}
                        handleRollback={handleRollback}
                        handleDeleteVersion={handleDeleteVersion}
                        fetchVersions={fetchVersions}
                        templateVersions={templateVersions}
                        fetchingVersions={fetchingVersions}
                        isSavingVersion={isSavingVersion}
                        newVersionTitle={newVersionTitle}
                        setNewVersionTitle={setNewVersionTitle}
                        activeAccordion={activeAccordion}
                        setActiveAccordion={setActiveAccordion}
                        PRESET_COLORS={PRESET_COLORS}
                    />
                );
            default:
                return null;
        }
    };

    const editorPanel = (
        <div className="flex-1 flex flex-col min-h-0 bg-card/60 backdrop-blur-md z-20">
            <StepWizard
                currentStep={currentStep}
                onNext={nextStep}
                onPrev={prevStep}
                isLast={currentStep === STEPS.length}
                onSave={saveChanges}
                loading={loading}
                setStep={setCurrentStep}
            >
                {renderStepContent()}
            </StepWizard>
        </div>
    );

    // Separate Desktop and Mobile Layouts

    // DESKTOP LAYOUT (In-flow, managed by DashboardLayout)
    const desktopLayout = (
        <div className="hidden md:flex flex-row overflow-hidden bg-background h-screen w-full w-full">
            {/* 1. EDITOR PANEL (Left Sidebar) */}
            <div className="flex-none w-[400px] flex flex-col z-20 bg-card border-r border-border shadow-sm h-full">
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Right Fluid) */}
            <div className="flex-1 bg-background flex items-center justify-center p-12 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 dark:bg-red-950/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-slate-100 dark:bg-slate-950/20 rounded-full blur-[100px]"></div>
                </div>

                {/* Desktop Preview Container */}
                <div
                    className={clsx(
                        "relative z-10 bg-background overflow-hidden transition-all duration-300 ease-in-out flex flex-col group origin-center shadow-2xl",
                        previewMode === 'mobile' ? "w-[390px] h-[844px] rounded-[2rem] border-2 border-border ring-4 ring-border/20" : "w-[95%] h-[85vh] rounded-2xl border-4 border-muted"
                    )}
                >
                    <iframe
                        ref={iframeRef}
                        src="/preview"
                        className="w-full h-full border-none bg-background"
                        title="Preview"
                    />
                </div>

                <PreviewSync wedding={wedding} iframeRef={iframeRef} currentStep={currentStep} enableScrollSync={false} />

                {/* View Toggle (Desktop Only) */}
                <div className="absolute top-4 right-4 z-30 bg-card/90 backdrop-blur-sm p-1 rounded-full shadow-lg gap-1 border border-border flex">
                    <button
                        onClick={() => setPreviewMode('mobile')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'mobile' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewMode('desktop')}
                        className={clsx(
                            "p-2 rounded-full transition-all duration-300",
                            previewMode === 'desktop' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
        <div className="md:hidden fixed inset-0 w-screen h-[100dvh] z-[99999] bg-background flex flex-col overflow-hidden pt-[115px]" role="dialog" aria-label="Mobile Design Editor">
            {/* MOBILE HEADER (Fixed Top) */}
            <div className="fixed top-0 left-0 right-0 h-[115px] bg-card border-b border-border z-[100000] shadow-md flex flex-col">
                {/* Row 1: Dashboard Nav & Tabs */}
                <div className="flex items-center px-4 pt-10 pb-2 gap-2">
                    <Link href="/dashboard" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1 bg-muted p-1 rounded-xl flex relative h-9 font-khmer">
                        <button
                            onClick={() => setMobileTab('editor')}
                            className={clsx(
                                "flex-1 text-[10px] font-bold rounded-lg transition-all z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'editor' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Settings2 size={13} /> រចនា
                        </button>
                        <button
                            onClick={() => setMobileTab('preview')}
                            className={clsx(
                                "flex-1 text-[10px] font-bold rounded-lg transition-all z-10 flex items-center justify-center gap-1.5",
                                mobileTab === 'preview' ? "bg-background text-red-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Smartphone size={13} /> មើលមុន
                        </button>
                    </div>
                </div>

                {/* Row 2: Step Navigation */}
                <div className="flex items-center justify-between px-4 pb-2 border-t border-border pt-1.5 bg-muted/50 font-khmer">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="text-muted-foreground hover:text-foreground h-7 px-2 text-[10px]"
                    >
                        <ArrowLeft size={14} className="mr-1" /> ថយក្រោយ
                    </Button>

                    <span className="text-[10px] font-medium text-muted-foreground">
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
                "flex-1 flex-col z-20 relative bg-background",
                mobileTab === 'editor' ? "flex h-full overflow-y-auto" : "hidden"
            )}>
                {/* Re-render editor panel directly. Since it's a variable, it works.
                     Note: The sticky footer inside editorPanel will appear. We should hide it on mobile via CSS
                     (which we did: 'hidden md:flex' on that footer div). */}
                {editorPanel}
            </div>

            {/* 2. PREVIEW AREA (Full Content when active) */}
            <div className={clsx(
                "flex-1 bg-muted items-center justify-center p-0 relative overflow-hidden",
                mobileTab === 'preview' ? "flex h-full" : "hidden"
            )}>
                {/* Mobile Preview Container */}
                <div className="w-full h-full bg-background relative">
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
        <div className="relative h-[calc(100vh)] w-full overflow-hidden flex flex-col">
            {desktopLayout}
            {mobileLayout}

        </div>
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
                className="w-full h-full border-none bg-background"
                title="Mobile Preview"
            />
            <PreviewSync wedding={wedding} iframeRef={mobileIframeRef} currentStep={currentStep} enableScrollSync={true} />
        </>
    );
}


// --- Custom Hook ---
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
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

    // 1.5. Throttled sync for specific fields (bypass debounce but throttle to 60ms)
    const lastEmit = useRef(0);
    useEffect(() => {
        const now = Date.now();
        if (now - lastEmit.current < 60) return; // Limit to ~16fps for slider movement

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
                lastEmit.current = now;
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
