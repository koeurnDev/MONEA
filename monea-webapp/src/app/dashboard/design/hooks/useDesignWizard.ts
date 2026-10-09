import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from 'react-router-dom';
import useSWR from "swr";
import { useCloudinary } from "@/hooks/use-cloudinary";
import { useAuth } from "@/hooks/useAuth";
import type { WeddingData } from "@/components/templates/types";
import { moneaClient } from "@/lib/api-client";
import { getTemplateConfig, getTemplatesForEventType } from "@/components/templates/template-config";
import { DEFAULT_WEDDING } from "@/data/wedding";

export { DEFAULT_WEDDING } from "@/data/wedding";

// --- API Fetcher ---
const fetcher = async (url: string) => {
    const response = await fetch(url, { credentials: "include" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(
            typeof data?.error === "string"
                ? data.error
                : `Failed to load wedding data (${response.status})`
        );
    }
    if (!data || typeof data !== "object") {
        throw new Error("Wedding data response was invalid");
    }
    return data;
};

const isNetworkSaveFailure = (status: number, error: string | null) =>
    status === 503 && /failed to fetch|networkerror|load failed/i.test(error || "");

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
    "blossom-romance": {
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
    "nea-m05": {
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

const getEditorDefaults = (isPlatformAdmin: boolean): WeddingData => {
    if (isPlatformAdmin) return DEFAULT_WEDDING;

    return {
        ...DEFAULT_WEDDING,
        groomName: "",
        brideName: "",
        date: "",
        location: "",
        themeSettings: {
            primaryColor: "",
            heroImage: "",
            coverImageUrl: "",
            customLabels: {},
            parents: {},
        },
        galleryItems: [],
        activities: DEFAULT_WEDDING.activities.map((activity) => ({ ...activity })),
    };
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
    const { user, isLoading: authLoading } = useAuth();
    const isPlatformAdmin = user?.role === 'SUPERADMIN' || user?.role === 'PLATFORM_OWNER';

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

    const [searchParams] = useSearchParams();
    const idFromUrl = searchParams.get('id');
    const templateIdFromUrl = searchParams.get('templateId');

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
        shouldRetryOnError: false,
    });

    // Track initial load from SWR
    const isLoadedRef = useRef(false);

    useEffect(() => {
        if (authLoading) return;
        const editorDefaults = getEditorDefaults(isPlatformAdmin);
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

                const loadedWedding = {
                    ...editorDefaults,
                    ...data,
                    // If user came from templates gallery, override templateId
                    templateId: templateIdFromUrl || data.templateId || editorDefaults.templateId,
                    groomName: data.groomName !== undefined ? data.groomName : "",
                    brideName: data.brideName !== undefined ? data.brideName : "",
                    location: data.location !== undefined ? data.location : "",
                    themeSettings: {
                        ...(editorDefaults.themeSettings || {}),
                        ...(data.themeSettings || {})
                    },
                    galleryItems: data.galleryItems || [],
                    activities: data.activities || []
                };
                setWedding(loadedWedding);
                lastSavedSnapshotRef.current = getPayloadSnapshot(loadedWedding);
                isLoadedRef.current = true;
            } else {
                // No wedding yet — use default, apply templateId from URL if provided
                const defaultWithTemplate = templateIdFromUrl
                    ? { ...editorDefaults, templateId: templateIdFromUrl }
                    : editorDefaults;
                setWedding(defaultWithTemplate);
                lastSavedSnapshotRef.current = getPayloadSnapshot(defaultWithTemplate);
                isLoadedRef.current = true;
            }
            setLoading(false);
        } else if (swrError) {
            console.error("SWR Fetch Error:", swrError);
            setWedding(null);
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [swrWedding, swrError, authLoading, isPlatformAdmin]);

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

    // Track latest wedding state in a ref & dirty state
    const weddingRef = useRef(wedding);
    const lastSavedSnapshotRef = useRef<string | null>(null);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    weddingRef.current = wedding;

    const getPayloadSnapshot = useCallback((data: WeddingData | null) => {
        if (!data) return null;
        return JSON.stringify({
            id: data.id,
            templateId: data.templateId,
            groomName: data.groomName,
            brideName: data.brideName,
            date: data.date,
            location: data.location,
            themeSettings: data.themeSettings,
            galleryItems: data.galleryItems,
            activities: data.activities,
            eventType: data.eventType
        });
    }, []);

    // Dirty state: true when active wedding state differs from the last saved snapshot
    const isDirty = Boolean(
        wedding &&
        lastSavedSnapshotRef.current !== null &&
        getPayloadSnapshot(wedding) !== lastSavedSnapshotRef.current
    );

    // Guard against accidental tab close/refresh with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty || loading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, loading]);

    // --- Save Logic ---
    const saveChanges = useCallback(async (manualData?: WeddingData, options: { silent?: boolean } = {}): Promise<boolean> => {
        const { silent = false } = options;
        const data = manualData || weddingRef.current;
        if (!data) return false;

        if (!silent && !data.themeSettings?.mapLink?.trim() && !data.mapUrl?.trim()) {
            setSaveToast("map-link-required");
            setTimeout(() => setSaveToast(null), 3000);
            return false;
        }

        const payloadSnapshot = getPayloadSnapshot(data);
        if (lastSavedSnapshotRef.current === payloadSnapshot) return true;

        // Validation (only skip if silent/auto-save)
        if (!silent && (
            !data.eventType ||
            !data.groomName?.trim() ||
            !data.brideName?.trim() ||
            !data.date ||
            !data.location?.trim()
        )) {
            setSaveToast("error");
            setTimeout(() => setSaveToast(null), 3000);
            return false;
        }

        if (!silent) setLoading(true);
        try {
            const payload = {
                weddingId: data.id || undefined,
                templateId: data.templateId || "modern-minimal",
                groomName: data.groomName,
                brideName: data.brideName,
                date: data.date,
                location: data.location,
                themeSettings: data.themeSettings,
                galleryItems: data.galleryItems,
                activities: data.activities?.filter((item: any) => item.title?.trim()).map((item: any) => ({
                    title: item.title.trim(),
                    time: item.time || "",
                    description: item.description || "",
                    icon: item.icon || null,
                    publicId: item.publicId || null,
                    order: item.order || 0
                })),
                eventType: data.eventType
            };

            let res = await moneaClient.put<any>("/api/wedding", payload);
            for (let retry = 0; retry < 2 && isNetworkSaveFailure(res.status, res.error); retry++) {
                console.warn(`[Wedding Save] Network request failed; retrying (${retry + 1}/2).`);
                await new Promise(resolve => setTimeout(resolve, 500 * 2 ** retry));
                res = await moneaClient.put<any>("/api/wedding", payload);
            }

            if (res.status === 200 && res.data) {
                lastSavedSnapshotRef.current = payloadSnapshot;
                setLastSavedAt(new Date());

                // If the wedding was created or updated with a new ID, update it
                if (res.data.id) {
                    setWedding(prev => prev ? { ...prev, id: res.data.id } : res.data);
                }
                mutate(res.data, false);

                if (!silent) {
                    setSaveToast("success");
                    setTimeout(() => setSaveToast(null), 3000);
                }
                return true;
            } else {
                console.error("Save failed with status:", res.status, res.error, "Details:", res.details);
                
                // Extract useful error message
                let errorMsg = res.error || "error";
                
                setSaveToast(errorMsg);
                setTimeout(() => setSaveToast(null), 4000);
                return false;
            }
        } catch (error: any) {
            console.error("Save error:", error);
            setSaveToast(error?.message || "error");
            setTimeout(() => setSaveToast(null), 4000);
            return false;
        } finally {
            if (!silent) setLoading(false);
        }
    }, [mutate, getPayloadSnapshot]);

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

    const updateTheme = useCallback((keyOrValues: string | Record<string, unknown>, value?: any, autoSave = false) => {
        setWedding((prev) => {
            if (!prev) return null;
            const changes = typeof keyOrValues === "string" ? { [keyOrValues]: value } : keyOrValues;
            if (typeof keyOrValues === "string" && keyOrValues === 'musicUrl' && prev.themeSettings?.musicUrlPublicId) {
                if (value && value !== prev.themeSettings.musicUrl) {
                    deleteCloudinaryAsset(prev.themeSettings.musicUrlPublicId);
                }
            }
            const updated = {
                ...prev,
                themeSettings: { ...(prev.themeSettings || {}), ...changes }
            };
            if (autoSave) saveChanges(updated, { silent: true });
            return updated;
        });
    }, [deleteCloudinaryAsset, saveChanges]);

    const removeThemeAsset = useCallback(async (urlKey: string, publicIdKey: string, assetIndex?: number) => {
        setWedding(prev => {
            if (!prev) return null;
            const storyPublicIds = prev.themeSettings?.storyImagePublicIds || [];
            const publicIdsToDelete = urlKey === "storyImages"
                ? assetIndex !== undefined
                    ? [storyPublicIds[assetIndex] || (assetIndex === 0 ? prev.themeSettings?.storyImagePublicId : undefined)]
                    : [...storyPublicIds, prev.themeSettings?.storyImagePublicId]
                : [(prev.themeSettings as any)?.[publicIdKey]];
            for (const publicId of new Set(publicIdsToDelete.filter((id): id is string => Boolean(id)))) {
                deleteCloudinaryAsset(publicId);
            }
            const storyImages = prev.themeSettings?.storyImages || [];
            const updated = {
                ...prev,
                themeSettings: {
                    ...(prev.themeSettings || {}),
                    [urlKey]: assetIndex !== undefined && urlKey === "storyImages"
                        ? storyImages.filter((_, index) => index !== assetIndex)
                        : urlKey === "storyImages" ? [] : "",
                    ...(urlKey === "storyImages" && assetIndex !== undefined
                        ? {
                            storyImageCaptions: (prev.themeSettings?.storyImageCaptions || [])
                                .filter((_, index) => index !== assetIndex),
                            storyImagePublicIds: storyPublicIds.length
                                ? storyPublicIds.filter((_, index) => index !== assetIndex)
                                : [],
                            ...(assetIndex === 0 ? { [publicIdKey]: "" } : {}),
                        }
                        : {
                            [publicIdKey]: "",
                            ...(urlKey === "storyImages" ? { storyImageCaptions: [] } : {}),
                        }),
                }
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
        setWedding((prev) => {
            if (!prev) return null;
            const config = getTemplateConfig(templateId);
            return {
                ...prev,
                templateId,
                themeSettings: {
                    ...(prev.themeSettings || {}),
                    ...(config?.primaryColor ? { primaryColor: config.primaryColor } : {}),
                },
            };
        });
    }, []);

    const updateEventType = useCallback((type: 'wedding' | 'anniversary', allowedTemplateIds?: readonly string[]) => {
        setWedding((prev) => {
            if (!prev) return null;

            const normalizedType = type === 'anniversary' ? 'anniversary' : 'wedding';
            const allowedTemplates = allowedTemplateIds
                ? [...allowedTemplateIds]
                : getTemplatesForEventType(normalizedType).map((template) => template.id);

            const currentTemplate = prev.templateId;
            const isCurrentTemplateAllowed = !!currentTemplate && allowedTemplates.includes(currentTemplate);
            const nextTemplate = isCurrentTemplateAllowed ? currentTemplate : (allowedTemplates[0] || currentTemplate);
            if (!nextTemplate) {
                return { ...prev, eventType: normalizedType };
            }

            const config = getTemplateConfig(nextTemplate);
            return {
                ...prev,
                eventType: normalizedType,
                templateId: nextTemplate,
                themeSettings: {
                    ...(prev.themeSettings || {}),
                    ...(config?.primaryColor ? { primaryColor: config.primaryColor } : {}),
                },
            };
        });
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
                newTheme.hiddenPhotoSlots = (newTheme.hiddenPhotoSlots || []).filter((slot) => slot !== index);
                if (index === 0) {
                    newTheme.heroImage = url;
                    newTheme.coverImageUrl = url;
                    if (publicId) newTheme.heroImagePublicId = publicId;
                }
            } else {
                newItems.push({ url, publicId, type });
                if (newItems.length === 1) {
                    newTheme.heroImage = url;
                    newTheme.coverImageUrl = url;
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
            if (index < layout.slots) {
                newTheme.hiddenPhotoSlots = (newTheme.hiddenPhotoSlots || []).filter((slot) => slot !== index);
            } else {
                const photoKey = itemToDelete?.publicId || itemToDelete?.url;
                if (photoKey) {
                    newTheme.hiddenGalleryPhotoKeys = (newTheme.hiddenGalleryPhotoKeys || []).filter((key) => key !== photoKey);
                }
            }
            if (index === 0) {
                newTheme.heroImage = "";
                newTheme.coverImageUrl = "";
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
        loadError: swrError,
        retryLoad: () => mutate(),
        updateWedding, updateTheme, removeThemeAsset, updateLabel, updateParent,
        updateTemplate, updateEventType, addGalleryItem, removeGalleryItem,
        handleGalleryDirectUpload, updateGalleryOrder, saveChanges, fetchVersions, handleSaveVersion,
        handleRollback, confirmRollback, handleDeleteVersion, confirmDeleteVersion,
        nextStep, prevStep, isDirty, lastSavedAt
    };
}
