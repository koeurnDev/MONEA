import React, { Suspense, startTransition, useEffect, useState } from "react";
import { WeddingData } from "@/components/templates";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { SafeBoundary } from "@/components/ui/SafeBoundary";
import { moneaClient } from "@/lib/api-client";
import { DEFAULT_WEDDING } from "@/data/wedding";
import { NEA_M05_DEFAULT_ACTIVITIES } from "@/lib/nea-m05-defaults";

const DEFAULT_PREVIEW_WEDDING: WeddingData = {
    id: "preview-default",
    groomName: "សុវណ្ណរាជ មាន",
    brideName: "មាស ចាន់មានណា",
    date: "2027-03-12T00:00:00.000Z",
    location: "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (អគារ A)",
    templateId: "modern-minimal",
    eventType: "wedding",
    themeSettings: {
        primaryColor: "#8E5A5A",
        fontStyle: "default",
        nameFont: "suwannaphum",
        nameSeparator: "and",
        musicUrl: "",
        lunarDate: "ថ្ងៃ ១៥ កើត ខែពិសាខ ឆ្នាំរោង ឆស័ក ព.ស. ២៥៦៩",
        mapLink: "https://maps.google.com",
        welcomeMessage: "យើងខ្ញុំមានកិត្តិយស និងក្តីសោមនស្សរីករាយឥតឧបមា សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយសក្នុងពិធីសិរីសួស្តី អាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ...",
        acknowledgment: "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅបំផុត ចំពោះវត្តមាន និងពរជ័យដ៏ឧត្តុង្គឧត្តមរបស់ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា លោក លោកស្រី អ្នកនាងកញ្ញា និងប្រិយមិត្តទាំងអស់...",
        parents: {
            groomFather: "សុខ វិបុល",
            groomMother: "ម៉ៅ ចិន្តា",
            groomPhone: "012 345 678",
            brideFather: "គង់ សម្បត្តិ",
            brideMother: "អ៊ុ ស្រីនាង",
            bridePhone: "098 765 432"
        },
        customLabels: {
            invite_title: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
            hero_subtitle: "យើងខ្ញុំសូមគោរពអញ្ជើញ",
            hero_button: "បើកសំបុត្រអញ្ជើញ",
            locationTitle: "ទីតាំងនៃកម្មវិធី",
            locationSubtitle: "សូមចុចលើផែនទីដើម្បីស្វែងរកផ្លូវ",
            giftTitle: "ចូលរួមជូនពរ & ចំណងដៃ",
            giftBadge: "ស្កេន KHQR ដើម្បីចងដៃ"
        },
        bankAccounts: [
            {
                bankName: "KHQR",
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
        { url: "/assets/khmer-legacy/622374686_905392995379165_1001573724208229331_n.jpg", type: "IMAGE" }
    ],
    activities: NEA_M05_DEFAULT_ACTIVITIES
};

const ANNIVERSARY_PREVIEW_WEDDING: WeddingData = {
    ...DEFAULT_PREVIEW_WEDDING,
    eventType: "anniversary",
    themeSettings: {
        ...DEFAULT_PREVIEW_WEDDING.themeSettings,
        welcomeMessage: "យើងខ្ញុំសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី និងភ្ញៀវកិត្តិយស ចូលរួមជាសាក្សីក្នុងពិធីភ្ជាប់ពាក្យរបស់យើងខ្ញុំ។",
        acknowledgment: "យើងខ្ញុំសូមថ្លែងអំណរគុណចំពោះវត្តមាន និងពរជ័យដ៏ប្រពៃក្នុងពិធីភ្ជាប់ពាក្យរបស់យើងខ្ញុំ។",
        invitationText: "មានកិត្តិយសសូមគោរពអញ្ជើញចូលរួមជាសាក្សីក្នុងពិធីភ្ជាប់ពាក្យ",
        customLabels: {
            ...DEFAULT_PREVIEW_WEDDING.themeSettings?.customLabels,
            invite_title: "សិរីសួស្តី ពិធីភ្ជាប់ពាក្យ",
            invitationTitle: "សិរីសួស្តី ពិធីភ្ជាប់ពាក្យ",
            hero_subtitle: "សិរីមង្គលពិធីភ្ជាប់ពាក្យ",
            heroSubtitle: "សិរីមង្គលពិធីភ្ជាប់ពាក្យ",
            timeline_title: "កម្មវិធីពិធីភ្ជាប់ពាក្យ",
            scheduleTitle: "កម្មវិធីពិធីភ្ជាប់ពាក្យ",
        },
    },
    activities: [
        { time: "០៧:០០ ព្រឹក", title: "ជួបជុំសាច់ញាតិ", description: "ស្វាគមន៍គ្រួសារ និងភ្ញៀវកិត្តិយស", icon: null, order: 0 },
        { time: "០៨:០០ ព្រឹក", title: "ពិធីសែនព្រេន", description: "គោរពតាមប្រពៃណីក្នុងពិធីភ្ជាប់ពាក្យ", icon: null, order: 1 },
        { time: "០៩:០០ ព្រឹក", title: "ពិធីបំពាក់ចិញ្ចៀន", description: "ពិធីភ្ជាប់ពាក្យ និងជូនពរគូអនាគត", icon: null, order: 2 },
        { time: "១១:០០ ព្រឹក", title: "ពិសាអាហារថ្ងៃត្រង់", description: "ជួបជុំទទួលទានអាហារជាមួយគ្រួសារ និងភ្ញៀវកិត្តិយស", icon: null, order: 3 },
    ],
};

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

export default function PreviewPage() {
    const [wedding, setWedding] = useState<WeddingData | null>(null);
    const [mounted, setMounted] = useState(false);
    const isApprovalPreview =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("mode") === "approval";

    useEffect(() => {
        setMounted(true);

        // Check URL params first (for template gallery preview)
        const urlParams = new URLSearchParams(window.location.search);
        const templateIdParam = urlParams.get('templateId');
        const isApprovalMode = urlParams.get('mode') === 'approval';
        const isEditorMode = urlParams.get('mode') === 'editor';

        if (templateIdParam) {
            console.log("[Preview] Template preview mode:", templateIdParam);
            const approvalWedding = isApprovalMode
                ? templateIdParam === "nea-m05"
                    ? {
                        ...DEFAULT_WEDDING,
                        id: "approval-preview",
                        templateId: templateIdParam,
                        date: "2026-11-15T00:00:00+07:00",
                        locationName: "ភូមិព្រែកហូរ (ខាងលិច)",
                        location: "សង្កាត់ព្រែកហូរ ក្រុងតាខ្មៅ ខេត្តកណ្តាល",
                        themeSettings: {
                            ...(DEFAULT_WEDDING.themeSettings ?? {}),
                            primaryColor: "#b18d55",
                            lunarDate: "ថ្ងៃអាទិត្យ ៦កើត ខែកត្ដិក ឆ្នាំមមី អដ្ឋស័ក ព.ស.២៥៧០",
                            mapLink: "https://maps.google.com/?q=ភូមិព្រែកហូរ+(ខាងលិច),+សង្កាត់ព្រែកហូរ,+ក្រុងតាខ្មៅ,+ខេត្តកណ្តាល",
                        },
                        activities: NEA_M05_DEFAULT_ACTIVITIES,
                    }
                    : {
                        ...DEFAULT_PREVIEW_WEDDING,
                        id: "approval-preview",
                        groomName: "",
                        brideName: "",
                        date: "",
                        location: null,
                        galleryItems: [],
                        activities: [],
                        themeSettings: { primaryColor: "#b18d55" },
                    }
                : templateIdParam === "anniversary-elegant"
                    ? ANNIVERSARY_PREVIEW_WEDDING
                    : DEFAULT_PREVIEW_WEDDING;
            setWedding({
                ...approvalWedding,
                templateId: templateIdParam,
                eventType: templateIdParam === "anniversary-elegant"
                    ? "anniversary"
                    : approvalWedding.eventType,
            });
        } else if (!isEditorMode) {
            // Dashboard preview mode - fetch user's wedding data
            moneaClient.get<any>('/api/wedding?full=true')
                .then(res => {
                    if (res.data && res.data.id) {
                        let data = deepDecodeEntities({ ...res.data });
                        if (typeof data.themeSettings === 'string' && data.themeSettings !== "") {
                            try { data.themeSettings = deepDecodeEntities(JSON.parse(data.themeSettings)); } catch (e) { data.themeSettings = {}; }
                        }
                        // Ensure required fields exist
                        if (!data.groomName) data.groomName = DEFAULT_PREVIEW_WEDDING.groomName;
                        if (!data.brideName) data.brideName = DEFAULT_PREVIEW_WEDDING.brideName;
                        if (!data.date) data.date = DEFAULT_PREVIEW_WEDDING.date;
                        setWedding(data);
                    }
                })
                .catch(err => {
                    console.warn("[Preview] initial fetch error:", err);
                    // Fallback to default if fetch fails
                    setWedding(DEFAULT_PREVIEW_WEDDING);
                });
        } else {
            // Editor mode receives the current draft from the parent via postMessage.
            // Avoid a second full wedding query that can race the dashboard request.
            setWedding(DEFAULT_PREVIEW_WEDDING);
        }

        let readyPings = 0;
        const readyInterval = setInterval(() => {
            readyPings++;
            window.parent.postMessage({ type: "PREVIEW_READY" }, "*");
            if (readyPings >= 3) {
                clearInterval(readyInterval);
            }
        }, 300);

        // Listen to parent postMessages
        const handleMessage = (event: MessageEvent) => {
            const expectedOrigin = window.location.origin;
            const isTrustedParent = event.source === window.parent && event.origin === expectedOrigin;

            if (!isTrustedParent) return;

            if (event.data?.type === "UPDATE_PREVIEW" && event.data.payload) {
                clearInterval(readyInterval);
                const cleanPayload = { ...event.data.payload };

                if (cleanPayload.themeSettings?.heroImage?.startsWith("/images/preview/")) {
                    cleanPayload.themeSettings.heroImage = "";
                }

                if (cleanPayload.galleryItems && Array.isArray(cleanPayload.galleryItems)) {
                    cleanPayload.galleryItems = cleanPayload.galleryItems.map((item: any) => {
                        if (item.url?.startsWith("/images/preview/")) {
                            return { ...item, url: "" };
                        }
                        return item;
                    });
                }

                if (!cleanPayload.groomName || cleanPayload.groomName.trim() === "") {
                    cleanPayload.groomName = DEFAULT_PREVIEW_WEDDING.groomName;
                }
                if (!cleanPayload.brideName || cleanPayload.brideName.trim() === "") {
                    cleanPayload.brideName = DEFAULT_PREVIEW_WEDDING.brideName;
                }
                if (!cleanPayload.templateId) {
                    cleanPayload.templateId = "modern-minimal";
                }

                setWedding(cleanPayload);
            }

            if (event.data?.type === "UPDATE_PREVIEW_PARTIAL" && event.data.payload) {
                startTransition(() => {
                    setWedding(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            themeSettings: {
                                ...(prev.themeSettings || {}),
                                ...event.data.payload
                            }
                        };
                    });
                });
            }

            if (event.data?.type === "SCROLL_TO_SECTION" && event.data.payload) {
                const sectionId = event.data.payload;

                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        };

        window.addEventListener("message", handleMessage);

        // Initial ping
        window.parent.postMessage({ type: "PREVIEW_READY" }, "*");

        // Fallback timer: if no wedding received after 1.2s, use default data so preview never stays blank
        const fallbackTimer = setTimeout(() => {
            setWedding(prev => prev ? prev : DEFAULT_PREVIEW_WEDDING);
        }, 800);

        return () => {
            window.removeEventListener("message", handleMessage);
            clearInterval(readyInterval);
            clearTimeout(fallbackTimer);
        };
    }, []);

    const activeWedding = wedding || DEFAULT_PREVIEW_WEDDING;
    const previewFontClass = `preview-font-${activeWedding.themeSettings?.fontStyle || 'default'}`;
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;
    const usePhoneFrame = isStandalone && !isApprovalPreview;

    return (
        <SafeBoundary name="Preview Template" isSilent={false}>
            <style>{`
                /* Hide scrollbar for mobile preview to prevent off-center layout */
                ::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
                .preview-font-suwannaphum, .preview-font-suwannaphum * {
                    font-family: 'Suwannaphum', 'Kantumruy Pro', sans-serif !important;
                }
                .preview-font-battambang, .preview-font-battambang * {
                    font-family: 'Battambang', 'Kantumruy Pro', sans-serif !important;
                }
                .preview-font-preahvihear, .preview-font-preahvihear * {
                    font-family: 'Preahvihear', 'Kantumruy Pro', sans-serif !important;
                }
                #root .preview-font-suwannaphum .modern-minimal-invitation,
                #root .preview-font-suwannaphum .modern-minimal-invitation * {
                    font-family: 'Suwannaphum', 'Kantumruy Pro', sans-serif !important;
                }
                #root .preview-font-battambang .modern-minimal-invitation,
                #root .preview-font-battambang .modern-minimal-invitation * {
                    font-family: 'Battambang', 'Kantumruy Pro', sans-serif !important;
                }
                #root .preview-font-preahvihear .modern-minimal-invitation,
                #root .preview-font-preahvihear .modern-minimal-invitation * {
                    font-family: 'Preahvihear', 'Kantumruy Pro', sans-serif !important;
                }
            `}</style>
            <div className={usePhoneFrame ? "min-h-screen bg-background md:flex md:justify-center md:bg-[#f4f1e9] md:px-6 md:py-6" : "relative w-full min-h-screen bg-background"}>
                <div className={usePhoneFrame ? "mx-auto w-full min-h-screen md:relative md:my-auto md:max-w-[448px] md:rounded-[3.25rem] md:border-[7px] md:border-[#252528] md:bg-[#252528] md:p-[3px] md:shadow-[0_30px_90px_rgba(25,25,25,.22)] lg:p-2" : "w-full min-h-screen"}>
                    <div className={`relative w-full min-h-screen bg-background ${usePhoneFrame ? "md:h-[min(956px,calc(100svh-3rem))] md:min-h-[700px] md:overflow-y-auto md:overscroll-contain md:rounded-[2.8rem] md:[scrollbar-width:none]" : ""} ${previewFontClass}`}>
                        <Suspense fallback={
                            <div className="flex items-center justify-center min-h-[500px] animate-pulse font-kantumruy text-sm text-slate-400">
                                កំពុងផ្ទុកគំរូ...
                            </div>
                        }>
                            {wedding ? (() => {
                                return <TemplateRenderer
                                    wedding={activeWedding}
                                    templateId={activeWedding.templateId || "modern-minimal"}
                                    guestName={new URLSearchParams(window.location.search).get("guestName") || undefined}
                                />;
                            })() : (
                                <div className="flex min-h-[500px] items-center justify-center animate-pulse font-kantumruy text-sm text-slate-400">
                                    កំពុងផ្ទុកគំរូ...
                                </div>
                            )}
                        </Suspense>
                    </div>
                    {usePhoneFrame && (
                        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[15px] z-[100] hidden h-[30px] w-[116px] -translate-x-1/2 rounded-full bg-black md:block" />
                    )}
                </div>
            </div>
        </SafeBoundary>
    );
}
