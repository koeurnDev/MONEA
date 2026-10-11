import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Play, Loader2, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, RefreshCw } from "lucide-react";
import useSWR from "swr";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Gallery request failed with status ${response.status}`);
    }

    const result = await response.json();
    if (!result || !Array.isArray(result.data)) {
        throw new Error("Gallery response was invalid");
    }

    return result as { data: any[] };
};

export default function GalleryPage() {
    const { id } = useParams();
    const [selectedVideo, setSelectedVideo] = useState<{ url: string; caption: string | null } | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const { data: items, error, isLoading, mutate } = useSWR(id ? `/api/gallery?weddingId=${encodeURIComponent(id)}` : null, fetcher);
    const galleryItems = Array.isArray(items?.data) ? items.data : [];
    const photos = galleryItems.filter((item: any) => item && typeof item === "object" && item.type !== "VIDEO" && typeof item.url === "string" && item.url.trim() !== "");
    const selectedPhoto = selectedPhotoIndex === null ? null : photos[selectedPhotoIndex] ?? null;
    const changePhoto = useCallback((direction: -1 | 1) => {
        if (selectedPhotoIndex === null || photos.length < 2) return;
        setSelectedPhotoIndex((prev) => prev === null ? null : (prev + direction + photos.length) % photos.length);
    }, [selectedPhotoIndex, photos.length]);

    useEffect(() => {
        if (selectedPhotoIndex !== null && !selectedPhoto) {
            setSelectedPhotoIndex(null);
        }
    }, [selectedPhoto, selectedPhotoIndex]);

    useEffect(() => {
        if (selectedVideo || selectedPhotoIndex === null) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                changePhoto(-1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                changePhoto(1);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedVideo, selectedPhotoIndex, changePhoto]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4 text-center font-kantumruy">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
                    <ImageIcon className="h-6 w-6" />
                </div>
                <h1 className="text-base font-bold text-foreground">មិនអាចផ្ទុកកម្រងរូបភាពបានទេ</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    សូមពិនិត្យការភ្ជាប់អ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។
                </p>
                <button
                    type="button"
                    onClick={() => void mutate()}
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    ព្យាយាមម្តងទៀត
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-[100dvh] bg-gradient-to-b from-amber-50/30 via-background to-background p-4 sm:p-6 pb-28 font-kantumruy">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link 
                            to={`/w/${id}`}
                            className="w-9 h-9 rounded-full bg-card hover:bg-muted flex items-center justify-center border border-border text-muted-foreground hover:text-foreground shadow-xs active:scale-95 transition-all"
                            title="ត្រឡប់ទៅធៀបការ"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black text-foreground">កម្រងរូបភាព</h1>
                            <p className="text-[11px] sm:text-xs text-muted-foreground">រូបថតអនុស្សាវរីយ៍ពីភ្ញៀវកិត្តិយស</p>
                        </div>
                    </div>

                    <Link 
                        to={`/w/${id}/gallery/live`} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200/60 dark:border-rose-500/20 active:scale-95 transition-all"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>មើល Live Slide</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                    {galleryItems.map((item: any) => (
                        <div key={item.id} className="group relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border/80 shadow-xs">
                            {item.type === 'VIDEO' ? (
                                <button
                                    type="button"
                                    onClick={() => setSelectedVideo({ url: item.url, caption: item.caption || null })}
                                    aria-label={item.caption ? `ចាក់វីដេអូ៖ ${item.caption}` : "ចាក់វីដេអូ"}
                                    className="flex h-full w-full items-center justify-center bg-black/70 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
                                >
                                    <Play className="h-10 w-10 drop-shadow-md" aria-hidden="true" />
                                    <span className="sr-only">ចុចដើម្បីមើលវីដេអូ</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setSelectedPhotoIndex(photos.findIndex((photo: any) => photo.id === item.id))}
                                    aria-label={item.caption ? `មើលរូបភាព៖ ${item.caption}` : "មើលរូបភាពពេញ"}
                                    className="h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-500"
                                >
                                    <img
                                        src={item.url}
                                        alt={item.caption || "រូបភាពក្នុងកម្រង"}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <span className="sr-only">ចុចដើម្បីមើលរូបភាពធំ</span>
                                </button>
                            )}
                            {item.caption && (
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] font-bold line-clamp-1">
                                    {item.caption}
                                </div>
                            )}
                        </div>
                    ))}

                    {galleryItems.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center p-6 bg-card rounded-3xl border border-dashed border-border/80">
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3">
                                <ImageIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">មិនទាន់មានរូបភាពនៅឡើយ</h3>
                            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                មិនមានរូបភាពសម្រាប់បង្ហាញនៅឡើយទេ។
                            </p>
                        </div>
                    )}
                </div>

            </div>
            <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                <DialogContent className="w-[96vw] max-w-5xl border-white/10 bg-black p-2 sm:p-4">
                    <DialogTitle className="sr-only">
                        {selectedVideo?.caption || "មើលវីដេអូក្នុងកម្រងរូបភាព"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        ប្រើប៊ូតុងលើវីដេអូដើម្បីចាក់ ផ្អាក ឬប្តូរសំឡេង។
                    </DialogDescription>
                    {selectedVideo && (
                        <video
                            key={selectedVideo.url}
                            src={selectedVideo.url}
                            controls
                            autoPlay
                            playsInline
                            className="max-h-[78dvh] w-full rounded-xl bg-black object-contain"
                        />
                    )}
                    {selectedVideo?.caption && (
                        <p className="px-2 pb-1 text-center text-sm font-medium text-white">
                            {selectedVideo.caption}
                        </p>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog
                open={selectedPhotoIndex !== null}
                onOpenChange={(open) => !open && setSelectedPhotoIndex(null)}
            >
                <DialogContent className="w-[96vw] max-w-6xl border-white/10 bg-black p-2 sm:p-4">
                    <DialogTitle className="sr-only">
                        {selectedPhoto?.caption || "មើលរូបភាពក្នុងកម្រង"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        ប្រើប៊ូតុងមុន និងបន្ទាប់ដើម្បីមើលរូបភាពផ្សេងទៀត។
                    </DialogDescription>
                    {selectedPhoto && (
                        <div className="relative flex min-h-[45vh] max-h-[82dvh] items-center justify-center">
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || "រូបភាពក្នុងកម្រង"}
                                className="max-h-[76dvh] max-w-full rounded-xl object-contain"
                            />
                            {photos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => changePhoto(-1)}
                                        aria-label="រូបភាពមុន"
                                        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white shadow-lg hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => changePhoto(1)}
                                        aria-label="រូបភាពបន្ទាប់"
                                        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white shadow-lg hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    {selectedPhoto && (
                        <div className="flex items-center justify-between gap-3 px-2 pb-1 text-white">
                            <p className="min-w-0 flex-1 truncate text-sm">
                                {selectedPhoto.caption || "រូបភាព"}
                            </p>
                            <span className="shrink-0 text-xs text-white/70">
                                {(selectedPhotoIndex ?? 0) + 1} / {photos.length}
                            </span>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
