import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ImageOff } from "lucide-react";

export default function UploadPage() {
    const { id: weddingId } = useParams();

    return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-background p-4 font-kantumruy">
            <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-xl sm:p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                </div>
                <h1 className="text-lg font-bold text-foreground">ការបង្ហោះរូបភាពត្រូវបានបិទ</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    ដើម្បីការពារកម្រងរូបភាពរបស់គូស្វាមីភរិយា ភ្ញៀវមិនអាចបង្ហោះរូបភាព ឬវីដេអូតាមតំណសាធារណៈបានទេ។
                </p>
                <Link
                    to={`/w/${weddingId}/gallery`}
                    className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition-colors hover:bg-rose-700"
                >
                    <ChevronLeft className="h-4 w-4" />
                    ត្រឡប់ទៅកម្រងរូបភាព
                </Link>
            </div>
        </div>
    );
}
