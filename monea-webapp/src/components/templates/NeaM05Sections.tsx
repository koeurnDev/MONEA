import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Gift,
    Heart,
    MapPin,
    Scissors,
    Sparkles,
    Utensils,
    X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import copy from "@/i18n/nea-m05.json";
import { formatNeaM05Date, formatNeaM05DateParts } from "@/lib/nea-m05-date";
import { downloadIcsFile } from "@/lib/calendar";
import type { ResolvedTemplateConfig, WeddingData } from "./types";
import { getWeddingHeroImage, getWeddingPhotos } from "./shared/weddingPhotos";
import { getGalleryCardClass, getGalleryContainerClass, getGalleryDisplayStyle } from "./shared/gallery-layout";
import { PhotoImage } from "./shared/PhotoImage";
import { getDirectMapUrl } from "./shared/mapUtils";
import { isSectionVisible } from "./shared/template-settings";
import { GuestbookSection } from "./shared/GuestbookSection";
import { CoupleNamesLine, OneLineName } from "./shared/OneLineName";

type Locale = keyof typeof copy;

type NeaM05SectionsProps = {
    wedding: WeddingData;
    config: ResolvedTemplateConfig;
    locale: Locale;
    isApprovalPreview: boolean;
    reducedMotion: boolean;
};

const toKhmerDigits = (value: number | string, locale: Locale) => {
    const digits = String(value);
    if (locale === "en") return digits;
    return digits.replace(/\d/g, (digit) => "០១២៣៤៥៦៧៨៩"[Number(digit)]);
};

function formatVenueDate(date: Date, locale: Locale): string {
    if (locale !== "km") return formatNeaM05Date(date, locale);
    const [weekday, day, month, year] = formatNeaM05DateParts(date, locale);
    return `ថ្ងៃ${weekday} ទី${day} ខែ${month} ឆ្នាំ${year}`;
}

const ParentNames = ({
    title,
    father,
    mother,
    locale,
}: {
    title: string;
    father?: string;
    mother?: string;
    locale: Locale;
}) => {
    const text = copy[locale];
    const fatherName = father?.trim();
    const motherName = mother?.trim();

    if (!fatherName && !motherName) return null;

    return (
        <div className="min-w-0 px-2 py-3 text-center sm:px-3 sm:py-4">
            <h3 className="m05-khmer-safe font-khmer-moul text-sm leading-[1.9] text-[#d9bd83] sm:text-base">
                {title}
            </h3>
            <div className="mt-3 space-y-2">
                {fatherName && (
                    <p className="m05-khmer-safe break-words font-kantumruy text-sm leading-[1.9] text-[#fffaf0] [overflow-wrap:anywhere] sm:text-base">
                        <span className="text-[#e0d5bd]">{text.fatherNamePrefix} </span><span className="font-semibold">{fatherName}</span>
                    </p>
                )}
                {motherName && (
                    <p className="m05-khmer-safe break-words font-kantumruy text-sm leading-[1.9] text-[#fffaf0] [overflow-wrap:anywhere] sm:text-base">
                        <span className="text-[#e0d5bd]">{text.motherNamePrefix} </span><span className="font-semibold">{motherName}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

const RitualIcon = ({ index }: { index: number }) => {
    const Icon = [Gift, Sparkles, Scissors, Heart, Sparkles, Heart, Gift, Utensils][index % 8];
    return <Icon aria-hidden="true" data-m05-draw="" size={18} strokeWidth={1.4} />;
};

export default function NeaM05Sections({
    wedding,
    config,
    locale,
    isApprovalPreview,
    reducedMotion,
}: NeaM05SectionsProps) {
    const text = wedding.eventType === "anniversary"
        ? { ...copy[locale], ...copy[locale].engagement }
        : copy[locale];
    const gallery = useMemo(() => getWeddingPhotos(wedding), [wedding]);
    const visibleGallery = gallery;
    const galleryDisplayStyle = getGalleryDisplayStyle(wedding.themeSettings?.galleryStyle);
    const parents = wedding.themeSettings?.parents;
    const groomFather = (parents?.groomFather || wedding.groomFather)?.trim();
    const groomMother = (parents?.groomMother || wedding.groomMother)?.trim();
    const brideFather = (parents?.brideFather || wedding.brideFather)?.trim();
    const brideMother = (parents?.brideMother || wedding.brideMother)?.trim();
    const couplePhoto = getWeddingHeroImage(wedding);
    const candlePhoto = visibleGallery[2]?.url || couplePhoto || visibleGallery[0]?.url;
    const loveStory = wedding.themeSettings?.loveStory?.trim()
        || wedding.themeSettings?.story?.kh?.trim()
        || "";
    const showLoveStory = isSectionVisible(config, "story");
    const storyImages = wedding.themeSettings?.storyImages !== undefined
        ? wedding.themeSettings.storyImages.filter(Boolean)
        : visibleGallery.slice(0, 5).map((item) => item.url);
    const hasLoveStoryContent = Boolean(loveStory || wedding.themeSettings?.storyImages?.some(Boolean));
    const activities = wedding.activities ?? [];
    const showTimeline = isSectionVisible(config, "timeline");
    const showGallery = isSectionVisible(config, "gallery");
    const targetTime = wedding.date ? new Date(wedding.date).getTime() : Number.NaN;
    const [remaining, setRemaining] = useState<number | null>(null);
    const [activeImage, setActiveImage] = useState<number | null>(null);
    const [floatingLights, setFloatingLights] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const nextFloatingLightId = useRef(0);
    const [downloadError, setDownloadError] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const galleryDialogRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = reducedMotion;

    const releaseFloatingLight = (event: MouseEvent<HTMLButtonElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = event.detail === 0 ? 50 : ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = event.detail === 0 ? 50 : ((event.clientY - bounds.top) / bounds.height) * 100;
        const id = nextFloatingLightId.current++;
        setFloatingLights((lights) => [...lights.slice(-6), { id, x, y }]);
    };

    useEffect(() => {
        if (!Number.isFinite(targetTime)) {
            setRemaining(null);
            return;
        }
        const update = () => setRemaining(Math.max(0, targetTime - Date.now()));
        update();
        const timer = window.setInterval(update, 1000);
        return () => window.clearInterval(timer);
    }, [targetTime]);

    useEffect(() => {
        if (activeImage === null) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        galleryDialogRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveImage(null);
            if (event.key === "ArrowRight") setActiveImage((index) => index === null ? null : (index + 1) % visibleGallery.length);
            if (event.key === "ArrowLeft") setActiveImage((index) => index === null ? null : (index - 1 + visibleGallery.length) % visibleGallery.length);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [activeImage, visibleGallery.length]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || prefersReducedMotion) return;
        gsap.registerPlugin(CustomEase, ScrollTrigger);
        const revealEase = CustomEase.create("m05SectionReveal", "0.22, 1, 0.36, 1");
        const context = gsap.context(() => {
            root.querySelectorAll<HTMLElement>("[data-m05-reveal]").forEach((element) => {
                gsap.fromTo(
                    element,
                    { opacity: 0, y: 28 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.95,
                        ease: revealEase,
                        scrollTrigger: { trigger: element, start: "top 82%", once: true },
                    },
                );
            });

            const thread = root.querySelector<SVGPathElement>("[data-m05-thread]");
            const programme = root.querySelector<HTMLElement>("#m05-programme");
            if (thread && programme) {
                const length = thread.getTotalLength();
                gsap.set(thread, { strokeDasharray: length, strokeDashoffset: length });
                gsap.to(thread, {
                    strokeDashoffset: 0,
                    ease: "none",
                    scrollTrigger: { trigger: programme, start: "top 60%", end: "bottom 65%", scrub: 0.8 },
                });
            }

            root.querySelectorAll<SVGPathElement>("[data-m05-draw] path").forEach((path) => {
                const article = path.closest("article");
                if (!article) return;
                const length = path.getTotalLength();
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 0.65,
                    ease: revealEase,
                    scrollTrigger: { trigger: article, start: "top 78%", once: true },
                });
            });

        }, root);
        return () => {
            context.revert();
        };
    }, [prefersReducedMotion]);

    const countdownParts = remaining === null
        ? null
        : [
            Math.floor(remaining / 86_400_000),
            Math.floor((remaining % 86_400_000) / 3_600_000),
            Math.floor((remaining % 3_600_000) / 60_000),
            Math.floor((remaining % 60_000) / 1_000),
        ];
    const saveQr = async (source: string, index: number) => {
        setDownloadError(false);
        try {
            const response = await fetch(source);
            if (!response.ok) throw new Error(`QR download failed (${response.status})`);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = `nea-m05-qr-${index + 1}.${blob.type.includes("png") ? "png" : "webp"}`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch (error) {
            console.error("Unable to save the wedding gift QR image:", error);
            setDownloadError(true);
        }
    };

    const openGalleryImage = (delta: number) => {
        setActiveImage((index) => {
            if (index === null || visibleGallery.length === 0) return index;
            return (index + delta + visibleGallery.length) % visibleGallery.length;
        });
    };

    return (
        <div ref={rootRef} className="contents">
            <section
                id="m05-invitation-words"
                data-m05-reveal=""
                className="relative overflow-hidden bg-[#25281f] px-5 py-20 text-[#f4ecdc] [container-type:inline-size] sm:py-28"
            >
                <div className="m05-invitation-words-layout relative mx-auto grid max-w-[1100px] items-center gap-8 sm:gap-12">
                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                        whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1 }}
                        className="m05-invitation-photo relative mx-auto w-full max-w-[340px]"
                    >
                        <div className="relative overflow-hidden rounded-t-[50%] border border-[#c8ad76]/35 shadow-[0_18px_48px_rgba(0,0,0,.3)]">
                            {couplePhoto ? (
                                <PhotoImage src={couplePhoto} alt={text.couplePhotoAlt} className="aspect-[4/5] w-full rounded-t-[50%] object-cover object-center" loading="lazy" decoding="async" />
                            ) : (
                                <div className="aspect-[4/5] rounded-t-[50%] bg-gradient-to-b from-[#899174] to-[#4d5940]" />
                            )}
                        </div>
                    </motion.div>

                    <div className="m05-invitation-copy relative rounded-2xl border border-[#c8ad76]/20 bg-black/10 px-4 py-5 text-center sm:px-6 sm:py-7">
                        <p className="m05-foil m05-khmer-safe font-khmer-moul text-sm sm:text-base">{text.formalEyebrow}</p>
                        <h2 className="m05-section-title m05-khmer-safe mx-auto mt-2 max-w-xl font-khmer-moul text-base leading-[1.85] sm:text-xl">{text.formalTitle}</h2>
                        <p className="m05-invitation-description m05-khmer-safe mx-auto mt-4 max-w-2xl font-kantumruy text-base leading-[2] text-[#f4ecdc] sm:text-lg">
                            {wedding.themeSettings?.invitationText || wedding.themeSettings?.welcomeMessage || text.formalPlaceholder}
                        </p>
                        {(groomFather || groomMother || brideFather || brideMother) && (
                            <div className="mt-6 grid grid-cols-2 divide-x divide-[#c8ad76]/20 sm:mt-8">
                                <ParentNames title={text.groomParents} father={groomFather} mother={groomMother} locale={locale} />
                                <ParentNames title={text.brideParents} father={brideFather} mother={brideMother} locale={locale} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section
                id="m05-couple"
                data-m05-reveal=""
                className="relative overflow-hidden bg-[#24271f] px-5 py-20 text-[#f4ecdc] [container-type:inline-size] sm:py-28"
                style={{
                    backgroundImage: "url('/khmer-invite-starter-kit/textures/paper-cream.webp')",
                    backgroundBlendMode: "multiply",
                }}
            >
                <div className="m05-couple-layout relative mx-auto grid max-w-5xl items-center gap-12">
                    <div className="mx-auto w-full max-w-[360px]">
                        <div
                            className="relative aspect-[4/5] overflow-hidden"
                            style={{ clipPath: "polygon(50% 0%,56% 2%,62% 0%,68% 2%,74% 0%,80% 2%,86% 0%,92% 2%,98% 0%,100% 7%,98% 13%,100% 19%,98% 25%,100% 31%,98% 37%,100% 43%,98% 49%,100% 55%,98% 61%,100% 67%,98% 73%,100% 79%,98% 85%,100% 91%,98% 97%,92% 100%,86% 98%,80% 100%,74% 98%,68% 100%,62% 98%,56% 100%,50% 98%,44% 100%,38% 98%,32% 100%,26% 98%,20% 100%,14% 98%,8% 100%,2% 98%,0% 92%,2% 86%,0% 80%,2% 74%,0% 68%,2% 62%,0% 56%,2% 50%,0% 44%,2% 38%,0% 32%,2% 26%,0% 20%,2% 14%,0% 8%,2% 2%,8% 0%,14% 2%,20% 0%,26% 2%,32% 0%,38% 2%,44% 0%)" }}
                        >
                            {couplePhoto ? (
                                <>
                                    <PhotoImage src={couplePhoto} alt={text.couplePhotoAlt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                    <span className="m05-photo-tint pointer-events-none absolute inset-2" aria-hidden="true" />
                                </>
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-[#909878] to-[#252b21]" />
                            )}
                        </div>
                    </div>
                    <div className="min-w-0 text-center">
                        <p className="m05-foil m05-khmer-safe font-khmer-moul text-xs">{text.coupleEyebrow}</p>
                        <h2 className="m05-section-title m05-khmer-safe mt-3 whitespace-nowrap font-khmer-moul text-[clamp(0.8rem,4.2cqi,1.5rem)]">{text.coupleTitle}</h2>
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-6">
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#d7bd88]">{text.groom}</p>
                                <OneLineName name={wedding.groomName} className="m05-foil m05-khmer-safe mt-2 font-moulpali text-[clamp(0.7rem,3.5cqi,1rem)]" />
                            </div>
                            <div className="min-w-0 border-l border-[#c8ad76]/25 pl-2 sm:pl-4">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#d7bd88]">{text.bride}</p>
                                <OneLineName name={wedding.brideName} className="m05-foil m05-khmer-safe mt-2 font-moulpali text-[clamp(0.7rem,3.5cqi,1rem)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="m05-countdown" data-m05-reveal="" className="relative overflow-hidden bg-[#25281f] px-4 py-14 text-center text-[#f4ecdc] [container-type:inline-size] sm:px-6 sm:py-20">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c8ad76]/45 to-transparent" />
                <style>{`
                    #m05-countdown .m05-countdown-number {
                        padding-block: .12em .16em;
                        line-height: 1.4 !important;
                    }
                    #m05-countdown .m05-countdown-unit {
                        padding-block: .18em .2em;
                        line-height: 1.7 !important;
                    }
                `}</style>
                <div className="relative mx-auto max-w-4xl">
                    <div className="mb-3 flex items-center justify-center gap-3 sm:mb-4">
                        <span aria-hidden="true" className="h-px w-7 bg-[#c8ad76]/60 sm:w-12" />
                        <p className="m05-foil m05-khmer-safe font-khmer-moul text-[10px] tracking-[0.16em] sm:text-xs">{text.countdownEyebrow}</p>
                        <span aria-hidden="true" className="h-px w-7 bg-[#c8ad76]/60 sm:w-12" />
                    </div>
                    <h2 className="m05-section-title m05-khmer-safe font-khmer-moul text-lg text-[#f6edda] sm:text-2xl">{text.countdownTitle}</h2>
                    <div className="relative mx-auto mt-7 grid max-w-3xl grid-cols-4 sm:mt-10">
                        <span aria-hidden="true" className="absolute inset-x-[12.5%] top-[67%] h-px bg-gradient-to-r from-transparent via-[#c8ad76]/65 to-transparent" />
                        {(countdownParts || [null, null, null, null]).map((value, index) => {
                            const digits = value === null
                                ? "—"
                                : index === 0
                                    ? String(value)
                                    : String(value).padStart(2, "0");
                            return (
                                <div key={text.countdownUnits[index]} className="relative flex min-w-0 flex-col items-center px-0 sm:px-2">
                                    <p className="m05-foil m05-countdown-number whitespace-nowrap font-serif-elegant text-[clamp(1.5rem,9cqi,4rem)] tabular-nums">
                                        {locale === "km" && value !== null ? toKhmerDigits(digits, locale) : digits}
                                    </p>
                                    <span aria-hidden="true" className="relative z-10 mt-1 h-2 w-2 rotate-45 border border-[#e6ce98] bg-[#25281f] shadow-[0_0_12px_rgba(200,173,118,.18)]" />
                                    <p className="m05-khmer-safe m05-countdown-unit mt-2 font-khmer-moul text-[10px] text-[#e5d5b2] sm:mt-3 sm:text-xs">{text.countdownUnits[index]}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mx-auto mt-7 flex max-w-md items-center justify-center gap-3 sm:mt-9">
                        <span aria-hidden="true" className="h-px w-8 bg-[#c8ad76]/45 sm:w-16" />
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#c8ad76]" strokeWidth={1.4} aria-hidden="true" />
                        <p className="m05-khmer-safe font-kantumruy text-xs text-[#e7dec9] sm:text-sm">
                            {Number.isFinite(targetTime) ? formatNeaM05Date(new Date(targetTime), locale) : text.datePlaceholder}
                        </p>
                        <span aria-hidden="true" className="h-px w-8 bg-[#c8ad76]/45 sm:w-16" />
                    </div>
                </div>
            </section>

            {showTimeline && activities.length > 0 && <section id="m05-programme" className="relative overflow-hidden bg-[#25281f] px-5 py-16 text-[#f4ecdc] sm:px-8 sm:py-24">
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
                    style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%,color-mix(in srgb,var(--m05-foil) 9%,transparent),transparent 68%)" }}
                />
                <div className="m05-programme-layout relative mx-auto grid max-w-[1500px] gap-6 sm:gap-8">
                    <div className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 text-center">
                        <span aria-hidden="true" className="h-px w-8 bg-[#c8ad76]/55 sm:w-14" />
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#d9bd83]" strokeWidth={1.5} aria-hidden="true" />
                        <h2 className="m05-section-title m05-khmer-safe font-khmer-moul text-lg text-[#f4ecdc] sm:text-xl">
                            {locale === "km" ? "កម្មវិធី" : "Programme"}
                        </h2>
                        <span aria-hidden="true" className="h-px w-8 bg-[#c8ad76]/55 sm:w-14" />
                    </div>
                    <div className="m05-programme-list relative mx-auto w-full max-w-2xl pt-2 md:mx-0 md:pr-4 md:pt-0">
                        <svg aria-hidden="true" className="absolute bottom-8 left-5 top-0 h-[calc(100%-2rem)] w-px overflow-visible sm:left-6" viewBox="0 0 1 1000" preserveAspectRatio="none">
                            <path data-m05-thread="" d="M.5 0V1000" fill="none" stroke="url(#m05-programme-thread)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            <defs>
                                <linearGradient id="m05-programme-thread" x1="0" y1="0" x2="0" y2="1">
                                    <stop stopColor="#f2dba7" />
                                    <stop offset=".7" stopColor="#b18d55" />
                                    <stop offset="1" stopColor="#b18d55" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {activities.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((activity, index) => (
                            <motion.article
                                key={`${activity.time}-${activity.title}`}
                                initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
                                whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.25 }}
                                transition={{ duration: 0.7, delay: Math.min(index * 0.08, 0.4), ease: [0.22, 1, 0.36, 1] }}
                                className="relative mb-3 grid grid-cols-[40px_1fr] gap-3 last:mb-0 sm:mb-5 sm:grid-cols-[48px_1fr] sm:gap-6"
                            >
                                <span
                                    className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#c7a86d] bg-[#25281f] text-[#ecd6a7] sm:h-12 sm:w-12"
                                    style={{ boxShadow: "0 0 18px color-mix(in srgb,var(--m05-foil) 18%,transparent)" }}
                                >
                                    <RitualIcon index={index} />
                                </span>
                                <div className="border-b border-[#ddc894]/20 pb-3 pt-0 sm:pb-4 sm:pt-1">
                                    <p className="m05-foil m05-khmer-safe font-khmer-moul text-xs tracking-[0.08em]">{activity.time}</p>
                                    <h3 className="m05-khmer-safe mt-0.5 font-khmer-moul text-base sm:mt-1 sm:text-lg">{activity.title}</h3>
                                    {activity.description && (
                                        <p className="m05-khmer-safe mt-0.5 font-kantumruy text-sm text-[#d2c7ae]/80 sm:mt-1">{activity.description}</p>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>}

            {showLoveStory && hasLoveStoryContent && (
            <section id="m05-story" className="relative overflow-hidden bg-[#25281f] px-5 py-16 text-[#f4ecdc] sm:py-24">
                <div className="relative mx-auto grid w-full max-w-[1800px] gap-8 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.8fr)] lg:items-center lg:gap-12">
                    <div className="flex flex-col justify-center text-center lg:text-left">
                        <h2 className="m05-section-title m05-khmer-safe whitespace-nowrap font-khmer-moul text-lg leading-[1.7] sm:text-2xl">{text.storyTitle}</h2>
                        <p className="m05-khmer-safe mt-2 font-kantumruy text-xs text-[#f0eadb]/80">{text.storyHint}</p>
                        {loveStory && (
                            <p className="m05-khmer-safe mx-auto mt-5 max-w-2xl whitespace-pre-line break-words text-left font-kantumruy text-sm leading-8 text-[#f4ecdc]/90 sm:text-base sm:leading-9 lg:mx-0">
                                {loveStory}
                            </p>
                        )}
                    </div>
                    <div
                        className="flex min-w-0 snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7"
                        role="region"
                        aria-label={text.storyTitle}
                        tabIndex={0}
                    >
                            {storyImages.map((src, index) => (
                                <motion.article
                                    key={`${src}-${index}`}
                                    initial={prefersReducedMotion ? false : { opacity: 0, x: 90 }}
                                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className="w-[82vw] max-w-[760px] min-w-[min(82vw,760px)] snap-start sm:w-[72vw] sm:min-w-[min(72vw,760px)]"
                                >
                                    <div className="relative overflow-hidden">
                                        <PhotoImage src={src} alt={`${text.storyPhotoAlt} ${toKhmerDigits(index + 1, locale)}`} className="h-[clamp(240px,42vw,540px)] w-full object-cover transition-transform duration-700 hover:scale-[1.035]" loading="lazy" decoding="async" />
                                        <span className="m05-photo-tint pointer-events-none absolute inset-1.5" aria-hidden="true" />
                                    </div>
                                    {wedding.themeSettings?.storyImageCaptions?.[index]?.trim() && (
                                        <p className="m05-khmer-safe mt-3 text-center text-sm leading-relaxed text-[#e8d8b4]">
                                            {wedding.themeSettings.storyImageCaptions[index]}
                                        </p>
                                    )}
                                </motion.article>
                            ))}
                            {storyImages.length > 0 && (
                                <motion.div
                                    initial={prefersReducedMotion ? false : { opacity: 0, x: 90 }}
                                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex w-[72vw] min-w-[min(72vw,560px)] snap-start items-center justify-center px-6 text-center sm:w-[48vw] sm:min-w-[min(48vw,560px)]"
                                >
                                    <p className="m05-foil m05-khmer-safe font-khmer-moul text-2xl leading-[1.8] sm:text-3xl">
                                        {text.storyEnding}
                                    </p>
                                </motion.div>
                            )}
                    </div>
                </div>
            </section>
            )}

            <section id="m05-candlelight" className="relative isolate flex min-h-[720px] flex-col items-center justify-center overflow-hidden bg-[#171a16] px-5 py-14 text-[#f4ecdc] [container-type:inline-size] sm:min-h-[780px] sm:py-20">
                {candlePhoto && (
                    <img src={candlePhoto} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_20%]" loading="lazy" decoding="async" />
                )}
                {candlePhoto && <div className="m05-photo-tint pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />}
                <div
                    className="pointer-events-none absolute inset-0 -z-10"
                    style={{ backgroundImage: "linear-gradient(180deg,color-mix(in srgb,var(--m05-dark-surface) 70%,transparent) 0%,color-mix(in srgb,var(--m05-dark-surface) 12%,transparent) 38%,color-mix(in srgb,var(--m05-dark-surface) 62%,transparent) 68%,var(--m05-page-background) 100%)" }}
                />
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_38%,transparent_20%,rgba(10,9,7,.32)_100%)]" />
                <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
                    <h2 className="m05-section-title m05-khmer-safe mt-2 font-khmer-moul text-lg leading-[1.8] sm:text-2xl">{text.candleTitle}</h2>
                    <CoupleNamesLine groom={wedding.groomName} bride={wedding.brideName} separator="♡" className="m05-khmer-safe mt-4 font-moulpali text-[clamp(0.8rem,5cqi,1.5rem)] text-[#fff4d6] [text-shadow:0_2px_5px_rgba(0,0,0,.95),0_0_18px_rgba(0,0,0,.7)]" />
                </div>
                <button
                    type="button"
                    onClick={releaseFloatingLight}
                    aria-label={text.touchWater}
                    className="group absolute inset-0 z-0 flex h-full w-full touch-manipulation items-center justify-center overflow-hidden border-0 outline-none backdrop-blur-[0.5px] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e4c47c]"
                    style={{ backgroundImage: "linear-gradient(180deg,color-mix(in srgb,var(--m05-dark-surface) 10%,transparent) 0%,color-mix(in srgb,var(--m05-foil) 16%,transparent) 52%,color-mix(in srgb,var(--m05-dark-surface) 48%,transparent) 100%)" }}
                >
                    <svg className="pointer-events-none absolute inset-0 h-full w-full text-[#d9e2ce]/20" viewBox="0 0 1440 780" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 345 C180 325 300 362 480 343 S780 326 960 345 1260 364 1440 340" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M0 370 C220 350 330 383 560 366 S860 350 1080 370 1300 383 1440 366" fill="none" stroke="currentColor" strokeOpacity=".65" strokeWidth=".8" />
                        <path d="M0 470 C200 452 340 488 540 468 S900 454 1100 474 1300 486 1440 468" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth=".8" />
                        <path d="M0 560 C180 544 360 576 560 557 S900 543 1120 565 1320 575 1440 558" fill="none" stroke="currentColor" strokeOpacity=".4" strokeWidth=".7" />
                    </svg>
                    <span className="pointer-events-none absolute bottom-8 left-1/2 z-10 inline-flex w-[min(92%,42rem)] -translate-x-1/2 items-center justify-center gap-2 text-center font-kantumruy text-xs leading-7 text-[#f0eadb]/95 drop-shadow-[0_1px_8px_rgba(0,0,0,.9)] transition-colors group-hover:text-white sm:text-sm">
                        <Sparkles size={13} aria-hidden="true" />
                        {text.candleHint}
                    </span>
                    {floatingLights.map((light) => (
                        <motion.span
                            key={light.id}
                            initial={{ opacity: 0, scale: 0.35, y: 12 }}
                            animate={prefersReducedMotion
                                ? { opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }
                                : { opacity: [0, 1, 0.9, 0], scale: [0.4, 1, 1.05, 0.8], y: [12, 0, -14, -32] }}
                            transition={{ duration: 4, ease: "easeOut" }}
                            onAnimationComplete={() => setFloatingLights((lights) => lights.filter(({ id }) => id !== light.id))}
                            style={{ left: `${light.x}%`, top: `${light.y}%` }}
                            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                            aria-hidden="true"
                        >
                            <motion.span
                                initial={{ opacity: 0.75, scale: 0.35 }}
                                animate={{ opacity: 0, scale: 5 }}
                                transition={{ duration: 1.7, ease: "easeOut" }}
                                className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f2dba7]/70"
                            />
                            <span className="absolute -inset-5 rounded-full bg-[#f7ce79]/25 blur-xl" />
                            <svg
                                viewBox="0 0 56 42"
                                className="relative h-12 w-14"
                                style={{ filter: "drop-shadow(0 0 12px color-mix(in srgb,var(--m05-foil) 80%,transparent))" }}
                            >
                                <path d="M28 37C16 37 7 32 4 24c8 1 13 4 18 9-3-8-2-14 6-21 8 7 9 13 6 21 5-5 10-8 18-9-3 8-12 13-24 13Z" fill="#b18d55" fillOpacity=".8" stroke="#f2dba7" strokeOpacity=".75" />
                                <ellipse cx="28" cy="30" rx="9" ry="4" fill="#f4d58d" />
                                <path d="M28 27c-5-5 3-8 1-13 8 6 2 9 4 13Z" fill="#fff0b0" />
                            </svg>
                        </motion.span>
                    ))}
                </button>
            </section>

            {showGallery && <section id="m05-gallery" className="relative overflow-hidden bg-[#25281f] px-4 py-20 text-[#f4ecdc] sm:px-6 sm:py-28">
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundImage: "radial-gradient(ellipse at 50% 25%,color-mix(in srgb,var(--m05-foil) 7%,transparent),transparent 55%)" }}
                />
                <div className="relative mx-auto max-w-7xl">
                    <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
                        <div>
                            <h2 className="m05-section-title m05-khmer-safe whitespace-nowrap font-khmer-moul text-[clamp(10px,3.8vw,24px)] sm:text-2xl">{text.galleryTitle}</h2>
                        </div>
                        {visibleGallery.length > 0 && (
                            <span className="m05-foil shrink-0 font-serif-elegant text-sm tracking-[0.16em]" aria-label={`${visibleGallery.length} ${text.galleryPhotoAlt}`}>
                                {toKhmerDigits(String(visibleGallery.length).padStart(2, "0"), locale)}
                            </span>
                        )}
                    </div>
                    {visibleGallery.length > 0 ? (
                        <div className={galleryDisplayStyle === "masonry"
                            ? "grid auto-rows-[clamp(135px,18vw,220px)] grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-12"
                            : getGalleryContainerClass(galleryDisplayStyle)}>
                            {visibleGallery.map((item, index) => (
                                <button
                                    key={`${item.url}-${index}`}
                                    type="button"
                                    onClick={() => setActiveImage(index)}
                                    className={`group relative block min-h-0 overflow-hidden bg-[#1b1e18] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e4c47c] ${galleryDisplayStyle === "masonry"
                                        ? index === 0 ? "col-span-2 row-span-2 md:col-span-7" : index < 3 ? "col-span-1 md:col-span-5" : "col-span-1 md:col-span-3"
                                        : galleryDisplayStyle === "polaroid" ? "aspect-square" : getGalleryCardClass(galleryDisplayStyle, index)}`}
                                    aria-label={`${text.openPhoto} ${toKhmerDigits(index + 1, locale)}`}
                                >
                                    <PhotoImage
                                        src={item.url}
                                        alt={`${text.galleryPhotoAlt} ${toKhmerDigits(index + 1, locale)}`}
                                        className={`${galleryDisplayStyle === "polaroid"
                                            ? "absolute inset-0 h-full w-full object-cover"
                                            : "absolute inset-0 h-full w-full object-cover"} transition-transform duration-700 group-hover:scale-[1.035]`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-75" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="m05-khmer-safe border border-dashed border-[#b89a60]/60 px-4 py-12 text-center font-kantumruy text-sm">{text.galleryPlaceholder}</p>
                    )}
                </div>
            </section>}

            {isSectionVisible(config, "map") && <section id="m05-venue" data-m05-reveal="" className="relative overflow-hidden bg-[#25281f] px-5 py-20 text-center text-[#f4ecdc] [container-type:inline-size] sm:py-28">
                <MapPin aria-hidden="true" className="relative mx-auto mb-4 h-7 w-7 text-[#d9bd83]" strokeWidth={1.4} />
                <p className="m05-foil m05-khmer-safe relative font-khmer-moul text-xs">{text.venueEyebrow}</p>
                <h2 className="m05-section-title m05-khmer-safe relative mt-2 font-khmer-moul text-lg sm:text-2xl">{text.venueTitle}</h2>
                <div className="relative mx-auto mt-7 grid w-full max-w-2xl gap-5 rounded-2xl border border-[#c8ad76]/35 bg-black/10 p-5 text-left shadow-[0_18px_48px_rgba(0,0,0,.16)] sm:grid-cols-2 sm:gap-7 sm:p-7">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[#d9bd83]">
                            <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
                            <p className="m05-khmer-safe m05-venue-copy font-khmer-moul text-xs">{text.venueAddressLabel}</p>
                        </div>
                        <p className="m05-khmer-safe m05-venue-copy mt-2 break-words font-kantumruy text-sm font-semibold leading-relaxed text-[#fff4dc] [overflow-wrap:anywhere] sm:text-base">
                            {wedding.locationName || wedding.location || text.venuePlaceholder}
                        </p>
                        {wedding.locationName && wedding.location && (
                            <p className="m05-khmer-safe m05-venue-copy mt-1 break-words font-kantumruy text-xs leading-relaxed text-[#e0d5bd]/85 [overflow-wrap:anywhere] sm:text-sm">{wedding.location}</p>
                        )}
                    </div>
                    <div className="min-w-0 border-t border-[#c8ad76]/25 pt-4 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
                        <div className="flex items-center gap-2 text-[#d9bd83]">
                            <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" />
                            <p className="m05-khmer-safe m05-venue-copy font-khmer-moul text-xs">{text.eventDateLabel}</p>
                        </div>
                        <p className="m05-khmer-safe m05-venue-copy mt-2 break-words font-kantumruy text-sm font-semibold leading-relaxed text-[#fff4dc] [overflow-wrap:anywhere] sm:text-base">
                            {Number.isFinite(targetTime) ? formatVenueDate(new Date(targetTime), locale) : text.datePlaceholder}
                        </p>
                        {wedding.themeSettings?.lunarDate && (
                            <p className="m05-khmer-safe m05-venue-copy mt-1 break-words font-kantumruy text-xs leading-relaxed text-[#e0d5bd]/85 [overflow-wrap:anywhere] sm:text-sm">
                                <span className="text-[#d9bd83]">{text.lunarDateLabel}៖ </span>{wedding.themeSettings.lunarDate}
                            </p>
                        )}
                    </div>
                </div>
                <div className="relative mx-auto mt-5 flex w-full max-w-2xl flex-col justify-center gap-3 sm:flex-row">
                    <a
                        href={getDirectMapUrl(
                            wedding.themeSettings?.mapLink?.includes("google.com/maps/embed")
                                ? ""
                                : wedding.themeSettings?.mapLink || wedding.mapUrl,
                            [wedding.locationName, wedding.location].filter(Boolean).join(", "),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8ad76] px-5 py-3 font-kantumruy text-xs font-semibold text-[#25281f] shadow-sm transition hover:bg-[#d8c18e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3dfb5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#25281f]"
                    >
                        <MapPin size={15} aria-hidden="true" /> {text.openMap} <ExternalLink size={12} aria-hidden="true" />
                    </a>
                    {Number.isFinite(targetTime) && (
                        <button
                            type="button"
                            onClick={() => {
                                const startDate = new Date(targetTime);
                                const endDate = new Date(startDate);
                                endDate.setDate(endDate.getDate() + 1);
                                downloadIcsFile({
                                    title: `${wedding.groomName} & ${wedding.brideName}`,
                                    description: wedding.themeSettings?.invitationText || text.formalTitle,
                                    location: wedding.locationName || wedding.location || "",
                                    startDate,
                                    endDate,
                                    allDay: true,
                                    fileName: "nea-m05-wedding.ics",
                                });
                            }}
                            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-[#c8ad76]/60 px-5 py-3 font-kantumruy text-xs font-medium text-[#f5e9ce] transition hover:bg-[#c8ad76]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3dfb5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#25281f]"
                        >
                            <CalendarDays size={15} aria-hidden="true" /> {text.saveCalendar}
                        </button>
                    )}
                </div>
            </section>}

            {isSectionVisible(config, "gift") && <section id="m05-gift" data-m05-reveal="" className="relative bg-[#25281f] px-5 py-20 text-center text-[#f4ecdc] sm:py-28">
                <div className="mx-auto max-w-5xl">
                    <Gift className="mx-auto h-8 w-8 text-[#a2824f]" strokeWidth={1.2} aria-hidden="true" />
                    <h2 className="m05-section-title m05-khmer-safe mt-3 font-khmer-moul text-lg sm:text-2xl">{text.giftTitle}</h2>
                    <p className="m05-khmer-safe mx-auto mt-3 max-w-xl font-kantumruy text-sm text-[#e0d5bd]">{text.giftIntro}</p>
                    <div className="mx-auto mt-8 grid w-full max-w-4xl gap-5 sm:grid-cols-2">
                        {(wedding.themeSettings?.bankAccounts || []).map((account, index) => {
                            const qrSource = account.qrUrl || (wedding.themeSettings?.paymentQrUrl ?? "");
                            return (
                                <article key={`${account.bankName}-${index}`} className={`mx-auto w-full max-w-md border-b border-[#b89a60]/35 py-6 ${(wedding.themeSettings?.bankAccounts || []).length === 1 ? "sm:col-span-2" : ""}`}>
                                    <div className="mx-auto w-full max-w-[17rem]">
                                        <div className="m05-khqr-header flex h-11 items-center justify-center font-serif-elegant text-lg font-bold tracking-[0.08em] text-white">
                                            KHQR
                                        </div>
                                        <div className="bg-white px-3 pt-2 text-left text-[#202020]">
                                            <p className="m05-khmer-safe break-words font-kantumruy text-xs font-semibold [overflow-wrap:anywhere]">{account.accountName}</p>
                                            <div className="mx-auto flex aspect-square w-full max-w-52 items-center justify-center bg-white p-1">
                                                {qrSource ? (
                                                    <img src={qrSource} alt={`${account.bankName || "KHQR"} ${text.qrAlt}`} className="h-full w-full object-contain" loading="lazy" />
                                                ) : (
                                                    <span className="m05-khmer-safe px-4 font-kantumruy text-xs text-[#746a58]">{text.qrPlaceholder}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isApprovalPreview && qrSource.includes("/images/qr.webp") && (
                                        <p className="m05-khmer-safe mt-2 font-kantumruy text-[10px] text-[#d9bd83]">{text.demoQrNotice}</p>
                                    )}
                                    {qrSource && (
                                        <button
                                            type="button"
                                            onClick={() => void saveQr(qrSource, index)}
                                            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#a2824f] px-4 py-2 font-kantumruy text-xs text-[#f4ecdc] transition-colors hover:bg-[#a2824f]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9bd83]"
                                        >
                                            <Download size={14} aria-hidden="true" /> {text.saveQr}
                                        </button>
                                    )}
                                </article>
                            );
                        })}
                        {(wedding.themeSettings?.bankAccounts || []).length === 0 && (
                            <article className="py-6 sm:col-span-2">
                                <div className="mx-auto flex aspect-square w-48 items-center justify-center bg-white p-4">
                                    <span className="m05-khmer-safe font-kantumruy text-xs text-[#746a58]">{text.qrPlaceholder}</span>
                                </div>
                                <p className="m05-khmer-safe mt-3 font-kantumruy text-xs text-[#d9cfb9]">{text.qrMissing}</p>
                            </article>
                        )}
                    </div>
                    {downloadError && <p role="alert" className="m05-khmer-safe mt-4 font-kantumruy text-xs text-red-800">{text.qrDownloadError}</p>}
                </div>
            </section>}

            {isSectionVisible(config, "guestbook") && <GuestbookSection wedding={wedding} tone="dark" unboxed />}

            <section id="m05-thank-you" data-m05-reveal="" className="relative overflow-hidden bg-[#171a16] px-5 py-20 text-center text-[#f4ecdc] [container-type:inline-size] sm:py-28">
                <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "url('/khmer-invite-starter-kit/textures/paper-cream.webp')" }} />
                <div className="m05-thank-you-content relative mx-auto max-w-3xl">
                    <div aria-hidden="true" className="mx-auto mb-4 flex w-20 items-center justify-center gap-2 text-[#c8ad76]">
                        <span className="h-px flex-1 bg-current opacity-60" />
                        <Sparkles className="h-5 w-5" strokeWidth={1.2} />
                        <span className="h-px flex-1 bg-current opacity-60" />
                    </div>
                    <p className="m05-foil m05-khmer-safe font-khmer-moul text-2xl sm:text-3xl">{text.thankYouTitle}</p>
                    <p className="m05-khmer-safe mx-auto mt-4 max-w-xl font-kantumruy text-sm leading-[2] text-[#d9cfb9]">{wedding.themeSettings?.acknowledgment || text.thankYouMessage}</p>
                    <div className="mx-auto mt-12 h-px max-w-xs bg-gradient-to-r from-transparent via-[#b99b68]/75 to-transparent" />
                    <CoupleNamesLine groom={wedding.groomName} bride={wedding.brideName} separator="♡" className="m05-foil m05-khmer-safe mt-5 font-moulpali text-lg" />
                    <p className="mt-8 font-serif-elegant text-[10px] font-medium uppercase tracking-[0.24em] text-[#e2c68e]/70">
                        MONEO
                    </p>
                </div>
            </section>

            {showGallery && activeImage !== null && visibleGallery[activeImage] && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    <motion.div
                        ref={galleryDialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={text.galleryViewer}
                        tabIndex={-1}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080908]/95 p-4 sm:p-8"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) setActiveImage(null);
                        }}
                        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
                        onTouchEnd={(event) => {
                            if (touchStartX.current === null) return;
                            const delta = event.changedTouches[0]?.clientX - touchStartX.current;
                            if (delta && Math.abs(delta) > 40) openGalleryImage(delta < 0 ? 1 : -1);
                            touchStartX.current = null;
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveImage(null)}
                            aria-label={text.closeViewer}
                            className="absolute right-4 top-4 z-20 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#f2dba7]/70 bg-[#171a16]/95 px-4 text-sm text-[#fff4d6] shadow-[0_4px_24px_rgba(0,0,0,.65)] transition-colors hover:bg-[#3a3425] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2dba7]"
                        >
                            <X size={19} aria-hidden="true" /> <span>{text.closeViewer}</span>
                        </button>
                        <button type="button" onClick={() => openGalleryImage(-1)} aria-label={text.previousPhoto} className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center border border-white/30 bg-black/30 text-white sm:left-6">
                            <ChevronLeft size={22} />
                        </button>
                        <motion.img
                            key={visibleGallery[activeImage].url}
                            initial={{ opacity: 0, scale: 0.985 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={visibleGallery[activeImage].url}
                            alt={`${text.galleryPhotoAlt} ${toKhmerDigits(activeImage + 1, locale)}`}
                            className="max-h-[86svh] max-w-[86vw] object-contain"
                            decoding="async"
                        />
                        <button type="button" onClick={() => openGalleryImage(1)} aria-label={text.nextPhoto} className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center border border-white/30 bg-black/30 text-white sm:right-6">
                            <ChevronRight size={22} />
                        </button>
                        <p className="absolute bottom-3 left-0 right-0 text-center font-kantumruy text-xs text-white/70">
                            {toKhmerDigits(activeImage + 1, locale)} / {toKhmerDigits(visibleGallery.length, locale)}
                        </p>
                    </motion.div>
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
}
