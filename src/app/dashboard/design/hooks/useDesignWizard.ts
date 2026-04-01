import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useCloudinary } from "@/hooks/use-cloudinary";
import type { WeddingData } from "@/components/templates/types";

// --- API Fetcher ---
const fetcher = (url: string) => fetch(url).then(res => res.json());

// --- Constants ---
export const PRESET_COLORS = ["#8E5A5A", "#1E40AF", "#047857", "#B91C1C", "#D97706", "#4B5563", "#000000", "#D4AF37"];

export const TEMPLATE_LAYOUTS: Record<string, { slots: number, labels: string[] }> = {
    "khmer-legacy": { 
        slots: 11, 
        labels: [
            "wizard.steps.4.slots.hero", 
            "wizard.steps.4.slots.editorial1",
            "wizard.steps.4.slots.editorial2",
            "wizard.steps.4.slots.editorial3",
            "wizard.steps.4.slots.editorial4",
            "wizard.steps.4.slots.map",
            "wizard.steps.4.slots.sig1",
            "wizard.steps.4.slots.sig2",
            "wizard.steps.4.slots.sig3",
            "wizard.steps.4.slots.groom",
            "wizard.steps.4.slots.bride"
        ] 
    },
};

export const DEFAULT_WEDDING: WeddingData = {
    id: "",
    groomName: "ka",
    brideName: "mey",
    date: "2025-12-07T17:00:00.000Z",
    location: "នៅ គេហដ្ឋានខាងស្រី បុរីឌីផ្លរ៉ា (6A) ផ្ទះលេខ21 ផ្លូវV01 សង្កាត់បាក់ខែង ខណ្ឌជ្រោយចង្វារ រាជធានីភ្នំពេញ",
    templateId: "khmer-legacy",
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
            timeline_title: "Save the Date (4-Year Journey)",
            gallery_title: "Our Soulmate Gallery",
            editorial_1: "MOMENTS MATTER",
            moments_title: "អនុស្សាវរីយ៍ចងចាំ",
            invitationHonorTitle: "សូមគោរពអញ្ជើញ"
        },
        parents: {
            groomFather: "គង់ សាវង",
            groomMother: "មាស ចាន់រស្មី",
            groomPhone: "+855 12 345 678",
            brideFather: "មាស សំណាង",
            brideMother: "ចាន់រ ក្សា",
            bridePhone: "+855 98 765 432"
        },
        invitationText: `ឯកឧត្តម  លោកឧកញ៉ា  លោកជំទាវ  លោក  លោកស្រី
អ្នកនាងកញ្ញា និង ប្រិយមិត្តទាំងអស់អព្ជើាញចូលរួមជាអធិបតី
 និង  ជាភ្ញៀវកិត្តិយស  ដើម្បីប្រសិទ្ធិពរជ័យ  សិរីសួស្តី ជ័យមង្គល
ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍  កូនប្រុស-កូនស្រី  របស់យើងខ្ញុំ ។`,
        bankAccounts: [
            { side: "groom", bankName: "ABA Bank", accountName: "Groom Name", accountNumber: "000 000 000", qrUrl: "" },
            { side: "bride", bankName: "ACLEDA Bank", accountName: "Bride Name", accountNumber: "000 000 000", qrUrl: "" }
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
        { time: "", title: "កម្មវិធីទី១ ថ្ងៃ សុក្រ ទី ១១ ខែ មីនា ឆ្នាំ ២០២២", description: "", icon: "header", order: 0 },
        { time: "វេលាម៉ោង ០៣:០០ រសៀល", title: "ពិធីក្រុងពាលី", description: "", icon: null, order: 1 },
        { time: "វេលាម៉ោង ០៤:០០ រសៀល", title: "ពិធីសូត្រមន្តចំរើនព្រះបរិត្ត", description: "", icon: null, order: 2 },
        { time: "វេលាម៉ោង ០៥:៣០ ល្ងាច", title: "អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារពេលល្ងាច", description: "", icon: null, order: 3 },
        { time: "", title: "កម្មវិធីទី២ ថ្ងៃ សៅរ៍ ទី ១២ ខែ មីនា ឆ្នាំ ២០២២", description: "", icon: "header", order: 4 },
        { time: "វេលាម៉ោង ០៦:៣០ ព្រឹក", title: "ជួបជុំភ្ញៀវកិត្តិយស ដើម្បីរៀបចំហែជំនូន", description: "", icon: null, order: 5 },
        { time: "វេលាម៉ោង ០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន(កំណត់) និងអញ្ជើញភ្ញៀវកិត្តិយស ពិសាអាហារពេលព្រឹក", description: "", icon: null, order: 6 },
        { time: "វេលាម៉ោង ០៧:៣០ ព្រឹក", title: "ពិធីចៅមហាទិយាយជើងការរាប់ផ្លែឈើ", description: "", icon: null, order: 7 },
        { time: "វេលាម៉ោង ០៨:០០ ព្រឹក", title: "សែនកុងម៉ា", description: "", icon: null, order: 8 },
        { time: "វេលាម៉ោង ០៩:០០ ព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", description: "", icon: null, order: 9 },
        { time: "វេលាម៉ោង ១០:០០ ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", description: "", icon: null, order: 10 },
        { time: "វេលាម៉ោង ១១:០០ ថ្ងៃត្រង់", title: "ពិធីបង្វិលពពិល សំពះផ្ទឹមសែនចងដៃ", description: "", icon: null, order: 11 },
        { time: "វេលាម៉ោង ១២:០០ ថ្ងៃត្រង់", title: "អញ្ជើញភ្ញៀវពិសាអាហារថ្ងៃត្រង់", description: "", icon: null, order: 12 },
        { time: "វេលាម៉ោង ០៥:០០ ល្ងាច", title: "ពិសាភោជនាហារ", description: `ដែលនឹងប្រព្រឹត្តទៅនៅថ្ងៃ ពុធ ទី០៧ ខែ មេសា ឆ្នាំ២០២៦ ត្រូវនឹងថ្ងៃ ១២កើត ខែមាខ ឆ្នាំជូត សំរឹទ្ធិស័ក ព. ស ២៥៥២ វេលាម៉ោង ៤:០០ រសៀល នៅគេហដ្ឋានខាងស្រី ភូមិក្រាំងអាត់ ឃុំកំពង់សីលា ស្រុកកំពង់សីលា ខេត្តព្រះសីហនុ ដោយមេត្រីភាព ។ សូមអរគុណ!`, icon: "utensils", order: 13 }
    ]
};

export const STEPS = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 }
];

export function useDesignWizard() {
    // --- State Initialization ---
    const [mounted, setMounted] = useState(false);
    const [wedding, setWedding] = useState<WeddingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // UI states
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const [isDraggingGallery, setIsDraggingGallery] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState<string | null>('theme');

    // Versioning states
    const [templateVersions, setTemplateVersions] = useState<any[]>([]);
    const [fetchingVersions, setFetchingVersions] = useState(false);
    const [newVersionTitle, setNewVersionTitle] = useState("");
    const [isSavingVersion, setIsSavingVersion] = useState(false);
    const [rollbackConfirm, setRollbackConfirm] = useState<{ open: boolean; versionId: string }>({ open: false, versionId: "" });
    const [rollbackLoading, setRollbackLoading] = useState(false);
    const [deleteVersionConfirm, setDeleteVersionConfirm] = useState<{ open: boolean; versionId: string }>({ open: false, versionId: "" });

    // Notifications
    const [saveToast, setSaveToast] = useState<"success" | "error" | null>(null);
    const [versionToast, setVersionToast] = useState(false);

    const searchParams = useSearchParams();
    const idFromUrl = searchParams.get('id');

    // Refs & Hooks
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { uploadFiles, uploading: galleryUploading, progress: galleryProgress } = useCloudinary({
        folder: wedding?.id || idFromUrl || ""
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // --- Data Fetching (SWR) ---
    const apiUrl = idFromUrl ? `/api/wedding?id=${idFromUrl}&full=true` : "/api/wedding?full=true";
    const { data: swrWedding, error: swrError, mutate } = useSWR(apiUrl, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 10000,
    });

    useEffect(() => {
        if (swrWedding) {
            if (swrWedding.id) {
                let data = { ...swrWedding };
                if (typeof data.themeSettings === 'string' && data.themeSettings !== "") {
                    try {
                        data.themeSettings = JSON.parse(data.themeSettings);
                    } catch (e) {
                        data.themeSettings = {};
                    }
                }
                if (data.themeSettings?.heroImage?.includes("/preview")) {
                    data.themeSettings.heroImage = "";
                }
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

    // --- Save Logic ---
    const saveChanges = useCallback(async (manualData?: WeddingData, options: { silent?: boolean } = {}) => {
        const { silent = false } = options;
        const data = manualData || wedding;
        if (!data) return;

        // Validation (only skip if silent/auto-save)
        if (!silent && (!data.groomName?.trim() || !data.brideName?.trim() || !data.date)) {
            setSaveToast("error");
            setTimeout(() => setSaveToast(null), 3000);
            return;
        }

        if (!silent) setLoading(true);
        try {
            const res = await fetch("/api/wedding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weddingId: data.id,
                    templateId: data.templateId || "khmer-legacy",
                    groomName: data.groomName,
                    brideName: data.brideName,
                    date: data.date,
                    location: data.location,
                    themeSettings: data.themeSettings,
                    galleryItems: data.galleryItems,
                    activities: data.activities,
                    eventType: data.eventType
                })
            });
            if (res.ok && !silent) {
                setSaveToast("success");
                setTimeout(() => setSaveToast(null), 3000);
            }
        } catch (error) {
            console.error("Save error:", error);
            if (!silent) setSaveToast("error");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [wedding]);

    // --- Core Update Functions ---
    const deleteCloudinaryAsset = useCallback(async (publicId: string) => {
        try {
            await fetch('/api/cloudinary/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id: publicId })
            });
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    }, []);

    const updateWedding = useCallback(<K extends keyof WeddingData>(key: K, value: WeddingData[K]) => {
        setWedding((prev) => prev ? { ...prev, [key]: value } : null);
    }, []);

    const updateTheme = useCallback((key: string, value: any, autoSave = false) => {
        setWedding((prev) => {
            if (!prev) return null;
            if (key === 'musicUrl' && prev.themeSettings?.musicUrlPublicId) {
                if (value && value !== prev.themeSettings.musicUrl) {
                    deleteCloudinaryAsset(prev.themeSettings.musicUrlPublicId);
                }
            }
            const updated = {
                ...prev,
                themeSettings: { ...(prev.themeSettings || {}), [key]: value }
            };
            if (autoSave) saveChanges(updated, { silent: true });
            return updated;
        });
    }, [deleteCloudinaryAsset, saveChanges]);

    const removeThemeAsset = useCallback(async (urlKey: string, publicIdKey: string) => {
        setWedding(prev => {
            if (!prev) return null;
            const publicId = (prev.themeSettings as any)?.[publicIdKey];
            if (publicId) deleteCloudinaryAsset(publicId);
            const updated = {
                ...prev,
                themeSettings: { ...(prev.themeSettings || {}), [urlKey]: "", [publicIdKey]: "" }
            };
            mutate(updated, false);
            saveChanges(updated, { silent: true });
            return updated;
        });
    }, [mutate, deleteCloudinaryAsset, saveChanges]);

    const updateLabel = useCallback((key: string, value: string) => {
        setWedding((prev) => !prev ? null : {
            ...prev,
            themeSettings: {
                ...(prev.themeSettings || {}),
                customLabels: { ...(prev.themeSettings?.customLabels || {}), [key]: value }
            }
        });
    }, []);

    const updateParent = useCallback((key: string, value: string) => {
        setWedding((prev) => !prev ? null : {
            ...prev,
            themeSettings: {
                ...(prev.themeSettings || {}),
                parents: { ...(prev.themeSettings?.parents || {}), [key]: value }
            }
        });
    }, []);

    const updateTemplate = useCallback((templateId: string) => {
        setWedding((prev) => prev ? { ...prev, templateId: 'khmer-legacy' } : null);
    }, []);

    const updateEventType = useCallback((type: 'wedding' | 'anniversary') => {
        setWedding((prev) => prev ? { ...prev, eventType: type, templateId: 'khmer-legacy' } : null);
    }, []);

    // --- Iframe Sync ---
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
                        themeSettings: { ...(prev.themeSettings || {}), [fieldX]: valueX, [fieldY]: valueY }
                    };
                });
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [updateTheme]);

    // --- Gallery Handlers ---
    const addGalleryItem = useCallback((url: string, publicId?: string, index?: number, type: string = "IMAGE") => {
        setWedding((prev) => {
            if (!prev) return null;
            const newItems = [...(prev.galleryItems || [])];
            const newTheme = { ...(prev.themeSettings || {}) };

            if (typeof index === 'number') {
                while (newItems.length <= index) newItems.push({ url: "", type: "IMAGE" });
                const oldItem = newItems[index];
                if (oldItem?.publicId && oldItem.publicId !== publicId) deleteCloudinaryAsset(oldItem.publicId);
                newItems[index] = { url, publicId, type };
                if (index === 0) {
                    newTheme.heroImage = url;
                    if (publicId) newTheme.heroImagePublicId = publicId;
                }
            } else {
                newItems.push({ url, publicId, type });
                if (newItems.length === 1) {
                    newTheme.heroImage = url;
                    if (publicId) newTheme.heroImagePublicId = publicId;
                }
            }

            const updated = { ...prev, galleryItems: newItems, themeSettings: newTheme };
            mutate(updated, false);
            saveChanges(updated, { silent: true });
            return updated;
        });
    }, [mutate, deleteCloudinaryAsset, saveChanges]);

    const removeGalleryItem = useCallback((index: number) => {
        setWedding((prev) => {
            if (!prev || !prev.templateId) return prev;
            const layout = TEMPLATE_LAYOUTS[prev.templateId];
            const itemToDelete = prev.galleryItems[index];
            const newTheme = { ...(prev.themeSettings || {}) };
            if (itemToDelete?.publicId) deleteCloudinaryAsset(itemToDelete.publicId);
            if (index === 0) {
                newTheme.heroImage = "";
                newTheme.heroImagePublicId = "";
            }
            const updated = {
                ...prev,
                galleryItems: index < layout.slots 
                    ? prev.galleryItems.map((item, i) => i === index ? { ...item, url: "", publicId: undefined } : item) 
                    : prev.galleryItems.filter((_, i) => i !== index),
                themeSettings: newTheme
            };
            mutate(updated, false);
            saveChanges(updated, { silent: true });
            return updated;
        });
    }, [mutate, deleteCloudinaryAsset, saveChanges]);

    const handleGalleryDirectUpload = async (files: FileList) => {
        const fileArray = Array.from(files);
        const uploadedItems = await uploadFiles(fileArray);
        if (uploadedItems.length > 0) {
            setWedding((prev) => {
                if (!prev) return null;
                const updated = {
                    ...prev,
                    galleryItems: [
                        ...(prev.galleryItems || []),
                        ...uploadedItems.map(item => ({ url: item.url, publicId: item.publicId, type: 'IMAGE' }))
                    ]
                };
                mutate(updated, false);
                saveChanges(updated, { silent: true });
                return updated;
            });
        }
    };

    // --- Versional Handlers ---
    const fetchVersions = useCallback(async () => {
        if (!wedding?.id) return;
        setFetchingVersions(true);
        try {
            const res = await fetch(`/api/templates/versions?weddingId=${wedding.id}`);
            if (res.ok) setTemplateVersions(await res.json());
        } catch (error) {
            console.error("Fetch versions error:", error);
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
                body: JSON.stringify({ weddingId: wedding.id, versionName: newVersionTitle, description: "Saved from editor" })
            });
            if (res.ok) {
                const newVer = await res.json();
                setTemplateVersions(prev => [newVer, ...prev]);
                setNewVersionTitle("");
                setVersionToast(true);
                setTimeout(() => setVersionToast(false), 3000);
            }
        } catch (error) {
            console.error("Save version error:", error);
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
            console.error("Rollback error:", error);
        } finally {
            setRollbackLoading(false);
        }
    };

    const handleDeleteVersion = useCallback(async (versionId: string) => {
        setDeleteVersionConfirm({ open: true, versionId });
    }, []);

    const confirmDeleteVersion = async () => {
        try {
            const res = await fetch(`/api/templates/versions?id=${deleteVersionConfirm.versionId}`, { method: "DELETE" });
            if (res.ok) {
                setTemplateVersions((prev: any[]) => prev.filter((v: any) => v.id !== deleteVersionConfirm.versionId));
                setDeleteVersionConfirm({ open: false, versionId: "" });
            }
        } catch (error) {
            console.error("Delete version error:", error);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return {
        mounted, wedding, setWedding, loading, currentStep, setCurrentStep,
        mobileTab, setMobileTab, previewMode, setPreviewMode,
        isDraggingGallery, setIsDraggingGallery, activeAccordion, setActiveAccordion,
        templateVersions, fetchingVersions, newVersionTitle, setNewVersionTitle,
        isSavingVersion, rollbackConfirm, setRollbackConfirm, rollbackLoading,
        deleteVersionConfirm, setDeleteVersionConfirm, saveToast, versionToast,
        iframeRef, galleryUploading, galleryProgress,
        updateWedding, updateTheme, removeThemeAsset, updateLabel, updateParent,
        updateTemplate, updateEventType, addGalleryItem, removeGalleryItem,
        handleGalleryDirectUpload, saveChanges, fetchVersions, handleSaveVersion,
        handleRollback, confirmRollback, handleDeleteVersion, confirmDeleteVersion,
        nextStep, prevStep
    };
}
