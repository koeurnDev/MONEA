import { Link, Plus, Play, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GalleryPage() {
    const { id } = useParams();
    const { data: items, error, isLoading } = useSWR(id ? `/api/gallery?weddingId=${id}` : null, fetcher);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div>Failed to load gallery</div>;

    const galleryItems = items?.data || [];

    return (
        <div className="min-h-screen bg-[#FFFDF5] p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-moul text-red-900">កម្រងរូបភាព</h1>
                <a href={`/w/${id}/gallery/live`} className="text-sm font-siemreap text-red-700 underline">
                    មើលជា Slide (Live)
                </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryItems.map((item: any) => (
                    <div key={item.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {item.type === 'VIDEO' ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/10">
                                <Play className="w-10 h-10 text-white/80" />
                            </div>
                        ) : (
                            <img
                                src={item.url}
                                alt={item.caption || "Gallery Image"} 
                                
                            />
                        )}
                    </div>
                ))}

                {galleryItems.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400 font-siemreap">
                        មិនទាន់មានរូបភាពនៅឡើយ
                    </div>
                )}
            </div>

            {/* FAB for Upload */}
            <a
                href={`/w/${id}/gallery/upload`}
                className="fixed bottom-6 right-6 w-14 h-14 bg-red-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-950 active:scale-90 transition-all z-50"
            >
                <Plus className="w-8 h-8" />
            </a>
        </div>
    );
}
