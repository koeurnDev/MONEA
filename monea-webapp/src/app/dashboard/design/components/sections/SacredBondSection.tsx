import React from 'react';
import { Plus, Trash2, Sparkles } from "lucide-react";
// next/image replaced with <img>;
import clsx from "clsx";
import { moneaClient } from "@/lib/api-client";

interface SacredBondSectionProps {
    wedding: any;
    setActiveSlotIdx: (idx: number) => void;
    slotInputRef: React.RefObject<HTMLInputElement>;
    removeGalleryItem: (idx: number) => void;
    slotUploading: boolean;
    t: any;
}

export const SacredBondSection: React.FC<SacredBondSectionProps> = ({
    wedding,
    setActiveSlotIdx,
    slotInputRef,
    removeGalleryItem,
    slotUploading,
    t
}) => {
    const cert = wedding.galleryItems?.find((item: any) => item.type === 'CERTIFICATE');
    const certIdx = wedding.galleryItems?.findIndex((item: any) => item.type === 'CERTIFICATE');
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        let active = true;
        setPreviewUrl(null);
        if (!cert?.publicId || !wedding.id || !cert.url) return () => { active = false; };

        let format = "";
        try {
            const filename = new URL(cert.url).pathname.split("/").pop() || "";
            format = filename.split(".").pop()?.toLowerCase() || "";
        } catch {
            return () => { active = false; };
        }

        void moneaClient.post<{ url: string }>("/api/cloudinary/private-certificate-preview", {
            weddingId: wedding.id,
            publicId: cert.publicId,
            format,
        }).then((response) => {
            if (response.error) throw new Error(response.error);
            if (!response.data?.url) throw new Error("Private certificate preview URL was missing");
            if (active) setPreviewUrl(response.data.url);
        }).catch((error) => {
            console.error("Could not load private certificate preview:", error);
        });

        return () => { active = false; };
    }, [cert?.publicId, cert?.url, wedding.id]);

    return (
        <section className="space-y-8">
            <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    {t("wizard.steps.4.bondTitle")}
                </h4>
                <p className="text-xs text-muted-foreground font-medium pl-3">{t("wizard.steps.4.bondSubtitle")}</p>
            </div>
            
            <div className="mx-3">
                {(() => {
                    const hasCert = !!cert?.url;

                    return (
                        <div className={clsx(
                            "relative rounded-xl overflow-hidden bg-muted/30 border border-border flex flex-col items-center justify-center group transition-all duration-500 min-h-[260px]",
                            !hasCert && "hover:border-primary/20"
                        )}>
                            {hasCert ? (
                                <>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Sacred Bond" loading="lazy" decoding="async" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    ) : (
                                        <p className="px-4 text-center text-xs text-muted-foreground">កំពុងបើកមើលឯកសារឯកជន…</p>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setActiveSlotIdx(-1);
                                                    slotInputRef.current?.click();
                                                }}
                                                className="bg-card text-primary p-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all shadow-xl"
                                            >
                                                <Plus size={20} />
                                            </button>
                                            <button
                                                onClick={() => certIdx !== undefined && certIdx !== -1 && removeGalleryItem(certIdx)}
                                                className="bg-background text-destructive p-3 rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all shadow-xl"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button 
                                    disabled={slotUploading}
                                    onClick={() => {
                                        setActiveSlotIdx(-1);
                                        slotInputRef.current?.click();
                                    }} 
                                    className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-card flex items-center justify-center text-muted-foreground/30 group-hover:text-primary shadow-sm transition-all">
                                        <Sparkles size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground font-bold block group-hover:text-primary transition-colors">{t("wizard.steps.4.uploadBond")}</span>
                                        <span className="text-xs text-muted-foreground/70 font-bold block uppercase tracking-widest">{t("wizard.steps.4.recommendSize")}</span>
                                    </div>
                                </button>
                            )}
                        </div>
                    );
                })()}
            </div>
        </section>
    );
};
