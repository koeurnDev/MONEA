import { Link, useParams } from "react-router-dom";
import { Plus, Play, Loader2, ChevronLeft, Sparkles, Image as ImageIcon } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GalleryPage() {
    const { id } = useParams();
    const { data: items, error, isLoading } = useSWR(id ? `/api/gallery?weddingId=${id}` : null, fetcher);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4 text-center font-kantumruy">
            <p className="text-muted-foreground text-sm">មិនអាចទាញយកទិន្នន័យរូបភាពបានទេ</p>
        </div>
    );

    const galleryItems = items?.data || [];

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
                                <div className="w-full h-full flex items-center justify-center bg-black/20">
                                    <Play className="w-10 h-10 text-white drop-shadow-md" />
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.caption || "Gallery Image"} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
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
                                សូមចុចប៊ូតុង (+) ខាងក្រោម ដើម្បីបង្ហោះរូបភាពអនុស្សាវរីយ៍ដំបូងគេ!
                            </p>
                        </div>
                    )}
                </div>

                {/* Floating Action Button (FAB) for Upload */}
                <Link
                    to={`/w/${id}/gallery/upload`}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-xl shadow-rose-600/30 flex items-center justify-center active:scale-90 transition-all z-50 group"
                    title="បង្ហោះរូបភាពថ្មី"
                >
                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
                </Link>
            </div>
        </div>
    );
}
