import { WeddingData, getTemplateComponent } from "@/components/templates";
import { lazy, Suspense } from "react";
import useSWR from "swr";
import { useParams, useSearchParams } from "react-router-dom";
import { GuestViewTracker } from "@/components/analytics/GuestViewTracker";
import { SafeBoundary } from "@/components/ui/SafeBoundary";
import { Loader2 } from "lucide-react";

const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InvitationPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const guestNameParam = searchParams.get("to");
    const guestId = searchParams.get("g") || undefined;
    
    const guestName = guestNameParam ? decodeURIComponent(guestNameParam) : undefined;
    
    const { data: weddingData, error, isLoading } = useSWR(id ? `/api/wedding/${id}` : null, fetcher);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    
    // If the API returns an error message or the wedding data doesn't have an id, it's a 404
    if (error || !weddingData || weddingData.error || !weddingData.id) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-black">
                        404
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-3 font-kantumruy tracking-tight">រកមិនឃើញទំព័រនេះទេ</h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed font-kantumruy mb-8">
                        ទំព័រដែលអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានលុប ប្ដូរឈ្មោះ ឬមិនមានតាំងពីដំបូង។
                    </p>
                    <a href="/" className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl font-kantumruy shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                        ត្រឡប់ទៅទំព័រដើម
                    </a>
                </div>
            </div>
        );
    }

    if (!weddingData.templateId) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                        🎨
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-3 font-kantumruy tracking-tight">សំបុត្រមិនទាន់រួចរាល់ទេ</h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed font-kantumruy mb-8">
                        សូមបងធ្វើការរចនា (Design) Template សម្រាប់សំបុត្រអញ្ជើញជាមុនសិន។ សូមចុចប៊ូតុងខាងក្រោម៖
                    </p>
                    <a href="/dashboard/design" className="inline-flex items-center justify-center gap-2 w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 px-6 rounded-2xl font-kantumruy shadow-xl shadow-rose-600/20 transition-all active:scale-95">
                        ទៅកាន់ការរចនាឥឡូវនេះ
                    </a>
                </div>
            </div>
        );
    }

    let parsedThemeSettings = weddingData.themeSettings;
    if (typeof parsedThemeSettings === 'string') {
        try {
            parsedThemeSettings = JSON.parse(parsedThemeSettings);
        } catch (e) {
            console.error("Failed to parse themeSettings", e);
            parsedThemeSettings = {};
        }
    }

    let parsedActivities = weddingData.activities || [];
    if (typeof parsedActivities === 'string') {
        try {
            parsedActivities = JSON.parse(parsedActivities);
        } catch (e) {
            parsedActivities = [];
        }
    }

    let parsedGalleryItems = weddingData.galleryItems || [];
    if (typeof parsedGalleryItems === 'string') {
        try {
            parsedGalleryItems = JSON.parse(parsedGalleryItems);
        } catch (e) {
            parsedGalleryItems = [];
        }
    }

    const weddingForTemplate = {
        ...weddingData,
        themeSettings: parsedThemeSettings,
        activities: parsedActivities,
        galleryItems: parsedGalleryItems,
        eventType: weddingData.eventType as "wedding" | "anniversary",
    };

    return (
        <>
            <GuestViewTracker weddingId={weddingForTemplate.id} guestId={guestId} guestName={guestName} />
            <SafeBoundary name={`Wedding Template (${weddingForTemplate.templateId})`} isSilent={false}>
                <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>}>
                    {(() => {
                        const SelectedTemplate = getTemplateComponent(weddingForTemplate.templateId);
                        return <SelectedTemplate wedding={weddingForTemplate as any} guestName={guestName} />;
                    })()}
                </Suspense>
            </SafeBoundary>
        </>
    );
}
