'use client'

import { useState } from "react";
import { uploadImage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image as ImageIcon, Upload } from "lucide-react";

export default function UploadPage({ params }: { params: { id: string } }) {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFDF5] p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-red-100">
                <h1 className="text-xl font-moul text-red-900 mb-6 text-center">
                    បញ្ចូលរូបភាព / វីដេអូ
                </h1>

                <form action={uploadImage} onSubmit={() => setLoading(true)} className="space-y-6">
                    <input type="hidden" name="weddingId" value={params.id} />

                    <div className="flex flex-col items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-red-200 border-dashed rounded-lg cursor-pointer bg-red-50 hover:bg-red-100 transition-colors overflow-hidden">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 text-red-300 mb-3" />
                                    <p className="mb-2 text-sm text-gray-500 font-siemreap">ចុចដើម្បីជ្រើសរើសរូបភាព</p>
                                </div>
                            )}
                            <input id="dropzone-file" name="file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} required />
                        </label>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-siemreap text-gray-700">Caption (Optional)</label>
                        <Input name="caption" placeholder="សរសេរអ្វីមួយ..." className="font-siemreap" />
                    </div>

                    <Button type="submit" className="w-full bg-red-900 hover:bg-red-950 text-white font-siemreap h-12" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                កំពុងបញ្ចូល...
                            </>
                        ) : (
                            "បង្ហោះ (Upload)"
                        )}
                    </Button>

                    <div className="text-center mt-4">
                        <a href={`/w/${params.id}/gallery`} className="text-sm text-gray-400 font-siemreap underline">
                            ត្រឡប់ក្រោយ (Back)
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
