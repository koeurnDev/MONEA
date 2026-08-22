import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GalleryProps {
    images: { id: string; url: string }[];
    weddingId: string;
}

export default function Gallery({ images, weddingId }: GalleryProps) {
    // Use placeholder if no images
    const displayImages = images.length > 0 ? images.slice(0, 4) : [];

    return (
        <section className="p-4 py-12 bg-black font-siemreap">
            <div className="flex justify-between items-end mb-6 px-2">
                <h3 className="text-pink-500 font-moul text-xl">កម្រងរូបភាព</h3>
                <Link href={`/w/${weddingId}/gallery`} className="text-sm text-gray-400 flex items-center gap-1 hover:text-white transition-colors">
                    មើលទាំងអស់ <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {displayImages.map((img) => (
                    <div key={img.id} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-pink-500/20 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <Image
                            src={img.url}
                            alt="Wedding"
                            fill
                            className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
                {displayImages.length === 0 && (
                    <div className="col-span-2 py-10 text-center border border-dashed border-gray-800 rounded-lg text-gray-600">
                        មិនទាន់មានរូបភាព
                    </div>
                )}
            </div>
        </section>
    );
}
