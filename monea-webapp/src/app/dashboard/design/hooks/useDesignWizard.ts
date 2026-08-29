import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from 'react-router-dom';
import useSWR from "swr";
import { useCloudinary } from "@/hooks/use-cloudinary";
import type { WeddingData } from "@/components/templates/types";
import { moneaClient } from "@/lib/api-client";

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
    "modern-minimal": { 
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
    "anniversary-elegant": { 
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
            "wizard.steps.4.slots.husband",
            "wizard.steps.4.slots.wife"
        ] 
    },
};

export const DEFAULT_WEDDING: WeddingData = {
    id: "",
    groomName: "កាប់ ស៊ីន",
    brideName: "មាស ចាន់មានណា",
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    location: "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (អគារ A)",
    templateId: "khmer-legacy",
    eventType: "wedding",
    themeSettings: {
        primaryColor: "#E8AC00",
        musicUrl: "",
        videoUrl: "",
        mapLink: "https://maps.google.com/?q=Koh+Pich+Convention+and+Exhibition+Centre",
        heroImage: "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg",
        coverImageUrl: "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg",
        lunarDate: "ថ្ងៃ ១៥ កើត ខែពិសាខ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៩",
        groomVow: "អរគុណដែលបានចូលមកក្នុងជីវិតបង និងតែងតែជាកម្លាំងចិត្តដ៏រឹងមាំសម្រាប់បងគ្រប់ពេលវេលា។",
        brideVow: "អរគុណសម្រាប់ការស្រលាញ់ ការមើលថែ និងភាពកក់ក្តៅដែលបងតែងតែផ្តល់ឱ្យអូនជារៀងរាល់ថ្ងៃ។",
        mainQuote: "សេចក្តីស្រឡាញ់ គឺជាការចាប់ផ្តើមនៃដំណើរជីវិតដ៏ស្រស់បំព្រងជាមួយគ្នា។",
        welcomeMessage: "យើងខ្ញុំមានកិត្តិយស និងក្តីសោមនស្សរីករាយឥតឧបមា សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយសក្នុងពិធីសិរីសួស្តី អាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ...",
        customLabels: {
            invite_title: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
            hero_title: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
            timeline_title: "កម្មវិធីពិធីមង្គលការ",
            gallery_title: "វិចិត្រសាលរូបថត",
            editorial_1: "",
            moments_title: "អនុស្សាវរីយ៍ផ្អែមល្ហែម",
            invitationHonorTitle: "សូមគោរពអញ្ជើញ"
        },
        parents: {
            groomFather: "កាប់ សុខា",
            groomMother: "ឃិន ស្រីពៅ",
            groomPhone: "012 345 678",
            brideFather: "មាស សម្បត្តិ",
            brideMother: "អ៊ុ ស្រីនាង",
            bridePhone: "098 765 432"
        },
        invitationText: "មានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា និងប្រិយមិត្តជិតឆ្ងាយទាំងអស់ ចូលរួមជាអធិបតី និងជាសាក្សីក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍",
        bankAccounts: [
            {
                bankName: "ABA Bank (KHQR)",
                accountName: "KAB SIN & MEAS CHANMEANA",
                accountNumber: "001 234 567",
                qrUrl: "/images/qr.webp",
                side: "both"
            }
        ]
    },
    galleryItems: [
        { url: "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/621811002_905396558712142_5126771807004187076_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/621811942_905392918712506_8600818650624857202_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/621813168_905393265379138_2356104923368506186_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/622279784_905392782045853_1189842078802821714_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/622374686_905392995379165_1001573724208229331_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/622582548_905399002045231_4147705888928073222_n.jpg", type: "IMAGE" },
        { url: "/assets/khmer-legacy/622629866_905398512045280_817022291532741601_n.jpg", type: "IMAGE" }
    ],
    activities: [
        { time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន", description: "ជួបជុំសាច់ញាតិ និងភ្ញៀវកិត្តិយស ហែជំនូនចូលរោងជ័យ", icon: null, order: 0 },
        { time: "០៨:៣០ ព្រឹក", title: "ពិធីសំពះផ្ទឹម និងចងដៃ", description: "ពិធីសិរីសួស្តីកាត់សក់ និងចងដៃជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី", icon: null, order: 1 },
        { time: "១១:០០ ថ្ងៃត្រង់", title: "ពិសាភោជនាហារថ្ងៃត្រង់", description: "ទទួលទានអាហារថ្ងៃត្រង់ជួបជុំបងប្អូន និងភ្ញៀវកិត្តិយស", icon: null, order: 2 },
        { time: "០៥:០០ ល្ងាច", title: "ពិធីជប់លៀង និងពិសាភោជនាហារពេលល្ងាច", description: "ទទួលស្វាគមន៍ភ្ញៀវកិត្តិយស និងពិសាភោជនាហារពេលល្ងាច", icon: null, order: 3 }
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
    const [progress, setProgress] = useState(0);

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
    const [saveToast, setSaveToast] = useState<"success" | "error" | string | null>(null);
    const [versionToast, setVersionToast] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Navigation & URL
    const [searchParams] = useSearchParams();
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

    // Track initial load from SWR
    const isLoadedRef = useRef(false);

    useEffect(() => {
        if (isLoadedRef.current) return;

function decodeHtmlEntities(str: any): any {
    if (typeof str !== 'string') return str;
    let decoded = str;
    for (let i = 0; i < 5; i++) {
        const next = decoded
            .replace(/&amp;/g, '&')
            .replace(/&#x2F;/g, '/')
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        if (next === decoded) break;
        decoded = next;
    }
    return decoded;
}

function deepDecodeEntities(obj: any): any {
    if (!obj || typeof obj !== 'object') {
        return typeof obj === 'string' ? decodeHtmlEntities(obj) : obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(deepDecodeEntities);
    }
    const res: any = {};
    for (const k of Object.keys(obj)) {
        res[k] = deepDecodeEntities(obj[k]);
    }
    return res;
}

        if (swrWedding) {
            if (swrWedding.id) {
                let data = deepDecodeEntities({ ...swrWedding });
                if (typeof data.themeSettings === 'string' && data.themeSettings !== "") {
                    try {
                        data.themeSettings = deepDecodeEntities(JSON.parse(data.themeSettings));
                    } catch (e) {
                        data.themeSettings = {};
                    }
                }
                if (data.themeSettings?.heroImage?.includes("/preview")) {
                    data.themeSettings.heroImage = "";
                }

                // If galleryItems was saved in themeSettings, use it!
                if (data.themeSettings?.galleryItems && Array.isArray(data.themeSettings.galleryItems)) {
                    data.galleryItems = data.themeSettings.galleryItems;
                } else if (data.galleryItems && Array.isArray(data.galleryItems)) {
                    const reconstructed: any[] = [];
                    data.galleryItems.forEach((item: any, idx: number) => {
                        if (item?.url?.includes("/preview")) return;
                        if (item?.caption?.startsWith("slot:")) {
                            const slotIdx = parseInt(item.caption.replace("slot:", ""), 10);
                            if (!isNaN(slotIdx)) {
                                reconstructed[slotIdx] = item;
                                return;
                            }
                        }
                        reconstructed[idx] = item;
                    });
                    data.galleryItems = reconstructed;
                }

                setWedding({
                    ...DEFAULT_WEDDING,
                    ...data,
                    groomName: data.groomName !== undefined ? data.groomName : "",
                    brideName: data.brideName !== undefined ? data.brideName : "",
                    location: data.location !== undefined ? data.location : "",
                    themeSettings: {
                        ...(DEFAULT_WEDDING.themeSettings || {}),
                        ...(data.themeSettings || {})
                    },
                    galleryItems: data.galleryItems || [],
                    activities: data.activities || []
                });
                isLoadedRef.current = true;
            } else {
                setWedding(DEFAULT_WEDDING);
                isLoadedRef.current = true;
            }
            setLoading(false);
        } else if (swrError) {
            console.error("SWR Fetch Error:", swrError);
            setWedding(DEFAULT_WEDDING);
            isLoadedRef.current = true;
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [swrWedding, swrError]);

    // --- Progress Calculation ---
    useEffect(() => {
        if (!wedding) return;
        let p = 0;
        if (wedding.groomName?.trim() && wedding.brideName?.trim()) p += 20;
        if (wedding.date) p += 20;
        if (wedding.location?.trim()) p += 20;
        if (wedding.themeSettings?.heroImage) p += 20;
        const galleryCount = wedding.galleryItems?.filter(i => i.url && !i.url.includes('cover')).length || 0;
        if (galleryCount > 0) p += 20;
        setProgress(p);
    }, [wedding]);

    // Track latest wedding state in a ref
    const weddingRef = useRef(wedding);
    weddingRef.current = wedding;

    // --- Save Logic ---
    const saveChanges = useCallback(async (manualData?: WeddingData, options: { silent?: boolean } = {}) => {
        const { silent = false } = options;
        const data = manualData || weddingRef.current;
        if (!data) return;

        // Validation (only skip if silent/auto-save)
        if (!silent && (!data.groomName?.trim() || !data.brideName?.trim() || !data.date)) {
            setSaveToast("error");
            setTimeout(() => setSaveToast(null), 3000);
            return;
        }

        if (!silent) setLoading(true);
        try {
            const res = await moneaClient.put<any>("/api/wedding", {
                weddingId: data.id || undefined,
                templateId: data.templateId || "khmer-legacy",
                groomName: data.groomName,
                brideName: data.brideName,
                date: data.date,
                location: data.location,
                themeSettings: data.themeSettings,
                galleryItems: data.galleryItems?.filter((item: any) => item && (item.url || item.publicId)),
                activities: data.activities?.map((item: any) => ({
                    title: item.title || "Activity",
                    time: item.time || "",
                    description: item.description || "",
                    icon: item.icon || null,
                    publicId: item.publicId || null,
                    order: item.order || 0
                })),
                eventType: data.eventType
            });

            if (res.status === 200 && res.data) {
                // If the wedding was created or updated with a new ID, update it
                if (res.data.id) {
                    setWedding(prev => prev ? { ...prev, id: res.data.id } : res.data);
                }
                mutate(res.data, false);

                if (!silent) {
                    setSaveToast("success");
                    setTimeout(() => setSaveToast(null), 3000);
                }
            } else if (res.status !== 200) {
                console.error("Save failed with status:", res.status, res.error, "Details:", res.details);
                
                // Extract useful error message
                let errorMsg = res.error || "error";
                
                setSaveToast(errorMsg);
                setTimeout(() => setSaveToast(null), 4000);
            }
        } catch (error: any) {
            console.error("Save error:", error);
            if (!silent) {
                setSaveToast(error?.message || "error");
                setTimeout(() => setSaveToast(null), 4000);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [mutate]);

    // Auto-save: Every time wedding state changes, automatically save to database after 1000ms debounce
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (!mounted || !wedding) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timer = setTimeout(() => {
            saveChanges(wedding, { silent: true });
        }, 1000);

        return () => clearTimeout(timer);
    }, [wedding, mounted, saveChanges]);

    // --- Core Update Functions ---
    const deleteCloudinaryAsset = useCallback(async (publicId: string) => {
        try {
            await moneaClient.post('/api/cloudinary/delete', { public_id: publicId });
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
        setWedding((prev) => prev ? { ...prev, templateId } : null);
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

    const updateGalleryOrder = useCallback((newItems: any[]) => {
        setWedding((prev) => {
            if (!prev) return null;
            const updated = { ...prev, galleryItems: newItems };
            saveChanges(updated, { silent: true });
            return updated;
        });
    }, [saveChanges]);

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
            const res = await moneaClient.delete(`/api/templates/versions?id=${deleteVersionConfirm.versionId}`);
            if (!res.error) {
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
        mounted, wedding, setWedding, loading, currentStep, setCurrentStep, progress,
        mobileTab, setMobileTab, previewMode, setPreviewMode,
        isDraggingGallery, setIsDraggingGallery, activeAccordion, setActiveAccordion,
        templateVersions, fetchingVersions, newVersionTitle, setNewVersionTitle,
        isSavingVersion, rollbackConfirm, setRollbackConfirm, rollbackLoading,
        deleteVersionConfirm, setDeleteVersionConfirm, saveToast, versionToast,
        iframeRef, galleryUploading, galleryProgress,
        updateWedding, updateTheme, removeThemeAsset, updateLabel, updateParent,
        updateTemplate, updateEventType, addGalleryItem, removeGalleryItem,
        handleGalleryDirectUpload, updateGalleryOrder, saveChanges, fetchVersions, handleSaveVersion,
        handleRollback, confirmRollback, handleDeleteVersion, confirmDeleteVersion,
        nextStep, prevStep
    };
}
