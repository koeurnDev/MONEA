import { useState } from "react";
import { uploadImage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function UploadPage() {
    const { id: weddingId } = useParams();
    const navigate = useNavigate();
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        try {
            await uploadImage(formData);
            navigate(`/w/${weddingId}/gallery`);
        } catch (error) {
            console.error(error);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-b from-amber-50/40 via-background to-background p-4 sm:p-6 flex flex-col items-center justify-center font-kantumruy">
            <div className="w-full max-w-md bg-card p-6 sm:p-8 rounded-3xl shadow-xl border border-border/80">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-foreground">
                        បញ្ចូលរូបភាព / វីដេអូ
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        ចែករំលែកអនុស្សាវរីយ៍ល្អៗក្នុងថ្ងៃពិសេស
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="weddingId" value={weddingId} />
                    <input type="hidden" name="turnstileToken" value="skip-captcha-for-now" />

                    <div className="flex flex-col items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-56 border-2 border-rose-200/80 dark:border-rose-500/20 border-dashed rounded-2xl cursor-pointer bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/70 transition-colors overflow-hidden relative">
                            {preview ? (
                                <div className="relative w-full h-full p-2 flex items-center justify-center">
                                    <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-5 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-100/70 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center mb-3">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-foreground">ចុចទីនេះដើម្បីជ្រើសរើសរូបថត</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, WebP ឬ Video</p>
                                </div>
                            )}
                            <input id="dropzone-file" name="file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} required />
                        </label>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-xs font-bold text-foreground">សារជូនពរ ឬចំណងជើងរូបភាព (Optional)</label>
                        <Input name="caption" placeholder="ឧ. រីករាយថ្ងៃអាពាហ៍ពិពាហ៍..." className="h-11 rounded-xl text-xs" />
                    </div>

                    <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 rounded-xl text-xs shadow-md shadow-rose-600/20 active:scale-98 transition-all" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                កំពុងបង្ហោះ...
                            </>
                        ) : (
                            "បង្ហោះរូបភាព (Upload Photo)"
                        )}
                    </Button>

                    <div className="text-center pt-2">
                        <Link to={`/w/${weddingId}/gallery`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-bold">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>ត្រឡប់ទៅវិចិត្រសាល</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
