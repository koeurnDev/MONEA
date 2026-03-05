import { prisma } from "@/lib/prisma";
import { Link, Plus, Play } from "lucide-react";
import Image from "next/image";

async function getGalleryItems(weddingId: string) {
    return await prisma.galleryItem.findMany({
        where: { weddingId },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function GalleryPage({ params }: { params: { id: string } }) {
    const items = await getGalleryItems(params.id);

    return (
        <div className="min-h-screen bg-[#FFFDF5] p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-moul text-red-900">កម្រងរូបភាព</h1>
                <a href={`/w/${params.id}/gallery/live`} className="text-sm font-siemreap text-red-700 underline">
                    មើលជា Slide (Live)
                </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {items.map((item) => (
                    <div key={item.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {item.type === 'VIDEO' ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/10">
                                <Play className="w-10 h-10 text-white/80" />
                                {/* In a real app, uses a video thumbnail or player */}
                            </div>
                        ) : (
                            <Image
                                src={item.url}
                                alt={item.caption || "Gallery Image"}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-400 font-siemreap">
                        មិនទាន់មានរូបភាពនៅឡើយ
                    </div>
                )}
            </div>

            {/* FAB for Upload */}
            <a
                href={`/w/${params.id}/gallery/upload`}
                className="fixed bottom-6 right-6 w-14 h-14 bg-red-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-950 active:scale-90 transition-all z-50"
            >
                <Plus className="w-8 h-8" />
            </a>
        </div>
    );
}
