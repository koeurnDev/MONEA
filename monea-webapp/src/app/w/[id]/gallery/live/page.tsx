import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiUrl } from "@/lib/api-url";
import { Loader2, RefreshCw } from "lucide-react";

type GalleryItem = {
    id: string;
    url: string;
    type: string;
    caption: string | null;
};

export default function LiveSlideshowPage() {
    const { id } = useParams();
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const activeItemId = useRef<string | null>(null);
    activeItemId.current = items[currentIndex]?.id ?? null;

    const fetchItems = useCallback(async (signal?: AbortSignal) => {
        if (!id) {
            setIsLoading(false);
            setLoadError(true);
            return;
        }

        try {
            const res = await fetch(getApiUrl(`api/gallery/${encodeURIComponent(id)}`), { signal });
            if (!res.ok) throw new Error(`Gallery request failed with status ${res.status}`);
            const payload = await res.json() as { items?: GalleryItem[] };
            if (!Array.isArray(payload.items)) throw new Error("Gallery response was invalid");

            setCurrentIndex(() => {
                const nextIndex = activeItemId.current
                    ? payload.items!.findIndex((item) => item.id === activeItemId.current)
                    : -1;
                return nextIndex >= 0 ? nextIndex : 0;
            });
            setItems(payload.items);
            setLoadError(false);
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            console.error("[LiveGallery] Failed to load gallery items:", error);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        const controller = new AbortController();
        void fetchItems(controller.signal);
        const interval = setInterval(() => void fetchItems(), 30000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [fetchItems]);

    const currentItem = items[currentIndex];

    useEffect(() => {
        if (!currentItem || currentItem.type === "VIDEO" || items.length < 2) return;
        const timer = setTimeout(() => {
            setCurrentIndex((index) => (index + 1) % items.length);
        }, 5000);
        return () => clearTimeout(timer);
    }, [currentItem, items.length]);

    const advanceSlide = () => {
        if (items.length > 1) {
            setCurrentIndex((index) => (index + 1) % items.length);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 text-white font-siemreap">
                <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
                <p>កំពុងផ្ទុក Live Slide...</p>
            </div>
        );
    }

    if (loadError && items.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center text-white font-siemreap">
                <p className="text-xl font-bold">មិនអាចផ្ទុក Live Slide បានទេ</p>
                <p className="text-sm text-white/60">សូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។</p>
                <button
                    type="button"
                    onClick={() => {
                        setIsLoading(true);
                        void fetchItems();
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                    <RefreshCw className="h-4 w-4" />
                    ព្យាយាមម្តងទៀត
                </button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 px-6 text-center text-white font-siemreap">
                <div className="text-2xl font-bold">មិនទាន់មានរូបភាពនៅឡើយ</div>
                <p className="text-sm text-gray-400">បង្ហោះរូបភាព ឬវីដេអូ ដើម្បីចាប់ផ្តើម Live Slide។</p>
                <Link
                    to={`/w/${id}/gallery`}
                    className="mt-2 inline-flex h-11 items-center rounded-xl bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/20"
                >
                    ត្រឡប់ទៅកម្រងរូបភាព
                </Link>
            </div>
        );
    }

    if (!currentItem) return null;

    return (
        <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center">
            <div
                className="absolute inset-0 opacity-30 blur-3xl scale-110 transition-all duration-1000 bg-center bg-cover"
                style={{ backgroundImage: `url(${currentItem.url})` }}
            />
            <div className="relative z-10 w-full h-full max-w-5xl max-h-screen p-4 flex items-center justify-center">
                {currentItem.type === 'VIDEO' ? (
                    <video
                        key={currentItem.id}
                        src={currentItem.url}
                        autoPlay
                        muted
                        playsInline
                        onEnded={advanceSlide}
                        onError={advanceSlide}
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                    />
                ) : (
                    <img
                        src={currentItem.url}
                        alt={currentItem.caption || "រូបភាពក្នុង Live Slide"}
                        className="relative z-10 max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl transition-opacity duration-500"
                    />
                )}
            </div>
            {loadError && (
                <div role="status" className="absolute top-4 right-4 z-30 rounded-full bg-black/70 px-3 py-2 text-xs text-white/80">
                    កំពុងប្រើរូបភាពដែលបានផ្ទុករួច
                </div>
            )}
            {currentItem.caption && (
                <div className="absolute bottom-10 left-0 right-0 text-center z-20">
                    <div className="inline-block bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white font-siemreap text-xl">
                        {currentItem.caption}
                    </div>
                </div>
            )}
        </div>
    );
}