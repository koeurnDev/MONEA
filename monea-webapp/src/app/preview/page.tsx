import React, { Suspense, useEffect, useState } from "react";
import { WeddingData, getTemplateComponent } from "@/components/templates";
import { SafeBoundary } from "@/components/ui/SafeBoundary";
import { moneaClient } from "@/lib/api-client";

const DEFAULT_PREVIEW_WEDDING: WeddingData = {
    id: "preview-default",
    groomName: "សុវណ្ណរាជ មាន",
    brideName: "មាស ចាន់មានណា",
    date: "2027-03-12T00:00:00.000Z",
    location: "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍កោះពេជ្រ (អគារ A)",
    templateId: "khmer-legacy",
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
        { url: "/assets/khmer-legacy/622374686_905392995379165_1001573724208229331_n.jpg", type: "IMAGE" }
    ],
    activities: [
        { time: "០៧:០០ ព្រឹក", title: "ពិធីហែជំនូន", description: "ជួបជុំសាច់ញាតិ និងភ្ញៀវកិត្តិយស ហែជំនូនចូលរោងជ័យ", icon: null, order: 0 },
        { time: "០៨:៣០ ព្រឹក", title: "ពិធីសំពះផ្ទឹម និងចងដៃ", description: "ពិធីសិរីសួស្តីកាត់សក់ និងចងដៃជូនពរជ័យដល់គូស្វាមីភរិយាថ្មី", icon: null, order: 1 },
        { time: "១១:០០ ថ្ងៃត្រង់", title: "ពិសាភោជនាហារថ្ងៃត្រង់", description: "ទទួលទានអាហារថ្ងៃត្រង់ជួបជុំបងប្អូន និងភ្ញៀវកិត្តិយស", icon: null, order: 2 },
        { time: "០៥:០០ ល្ងាច", title: "ពិធីជប់លៀង និងពិសាភោជនាហារពេលល្ងាច", description: "ទទួលស្វាគមន៍ភ្ញៀវកិត្តិយស និងពិសាភោជនាហារពេលល្ងាច", icon: null, order: 3 }
    ]
};

export default function PreviewPage() {
    const [wedding, setWedding] = useState<WeddingData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Fetch initial data via moneaClient (includes auth headers)
        moneaClient.get<any>('/api/wedding?full=true')
            .then(res => {
                if (res.data && res.data.id) {
                    let data = { ...res.data };
                    if (typeof data.themeSettings === 'string' && data.themeSettings !== "") {
                        try { data.themeSettings = JSON.parse(data.themeSettings); } catch (e) { data.themeSettings = {}; }
                    }
                    // Ensure required fields exist
                    if (!data.groomName) data.groomName = DEFAULT_PREVIEW_WEDDING.groomName;
                    if (!data.brideName) data.brideName = DEFAULT_PREVIEW_WEDDING.brideName;
                    if (!data.date) data.date = DEFAULT_PREVIEW_WEDDING.date;
                    setWedding(prev => prev ? prev : data);
                }
            })
            .catch(err => {
                console.warn("[Preview] initial fetch error:", err);
            });

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

                setWedding(cleanPayload);
            }

            if (event.data?.type === "UPDATE_PREVIEW_PARTIAL" && event.data.payload) {
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
            }

            if (event.data?.type === "SCROLL_TO_SECTION" && event.data.payload) {
                const sectionId = event.data.payload;
                window.dispatchEvent(new CustomEvent('FORCE_REVEAL'));
                
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

    // Check if viewed directly in browser (not inside an iframe)
    const isStandalone = typeof window !== 'undefined' && window.self === window.top;

    return (
        <SafeBoundary name="Preview Template" isSilent={false}>
            <style>{`
                /* Hide scrollbar for mobile preview to prevent off-center layout */
                ::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
            `}</style>
            <div className={isStandalone ? "min-h-screen bg-slate-900 flex justify-center py-6 px-3" : "relative w-full min-h-screen bg-background"}>
                <div className={isStandalone ? "w-full max-w-[430px] bg-background rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 min-h-screen" : "w-full min-h-screen"}>
                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[500px] animate-pulse font-kantumruy text-sm text-slate-400">
                            កំពុងផ្ទុកគំរូ (Loading Preview)...
                        </div>
                    }>
                        {(() => {
                            const SelectedTemplate = getTemplateComponent(activeWedding.templateId || "khmer-legacy");
                            return <SelectedTemplate wedding={activeWedding} />;
                        })()}
                    </Suspense>
                </div>
            </div>
        </SafeBoundary>
    );
}
