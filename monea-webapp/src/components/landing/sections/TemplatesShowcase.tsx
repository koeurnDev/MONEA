import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
    normalizeTemplatePresentationMetadata,
    TEMPLATE_CATALOG,
    type TemplatePresentationMetadata,
} from "@/components/templates/template-config";
import { moneaClient } from "@/lib/api-client";

export function TemplatesShowcase() {
    const [metadata, setMetadata] = useState<Record<string, TemplatePresentationMetadata> | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadMetadata = async () => {
            try {
                const response = await moneaClient.get<unknown>("/api/templates/metadata", { cache: "no-store" });
                if (response.error || !response.data) {
                    throw new Error(response.error || "Template metadata response was empty");
                }

                const normalizedMetadata = normalizeTemplatePresentationMetadata(response.data);
                if (!cancelled) {
                    setMetadata(normalizedMetadata);
                }
            } catch (error) {
                console.error("[TemplatesShowcase] Failed to load template metadata:", error);
            }
        };

        void loadMetadata();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="bg-background px-4 py-14 font-kantumruy text-foreground transition-colors duration-300 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-6xl">
                <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">MONEO · DIGITAL INVITATIONS</p>
                        <h2 className="text-2xl font-bold leading-relaxed sm:text-3xl">មើលគម្របគំរូធៀប</h2>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            ជ្រើសរើសរចនាបថដែលសមនឹងថ្ងៃពិសេសរបស់អ្នក។
                        </p>
                    </div>
                    <Link
                        to="/templates"
                        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-border px-5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        មើលគំរូទាំងអស់ <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {TEMPLATE_CATALOG.map((template, index) => {
                        const presentation = metadata?.[template.id];
                        const image = presentation?.image ?? template.image;
                        const hasCustomCover = !!presentation && presentation.image !== template.image;
                        const isPaperDesign = template.id === "nea-m05" && !hasCustomCover;

                        return (
                            <article
                                key={template.id}
                                aria-label={`គម្របគំរូ ${template.code}`}
                                className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm"
                            >
                                <div className="relative aspect-[1.08/1] overflow-hidden bg-muted">
                                    {isPaperDesign ? (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-[#68745c] bg-cover bg-center p-6"
                                            style={{ backgroundImage: "url('/khmer-invite-starter-kit/textures/paper-olive.webp')" }}
                                        >
                                            <img
                                                src="/khmer-invite-starter-kit/elements/crest.svg"
                                                alt=""
                                                className="h-14 w-14 opacity-80"
                                            />
                                        </div>
                                    ) : (
                                        <img
                                            src={image}
                                            alt=""
                                            loading={index < 2 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                                    <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-black/50 px-3 py-1 text-xs font-bold tracking-[0.16em] text-white backdrop-blur-sm sm:text-xs">
                                        {template.code}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
