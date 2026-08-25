# 🎨 MONEA Template Creation Guide (មគ្គុទ្ទេសក៍បង្កើត Template ថ្មី)

ឯកសារនេះជាស្តង់ដារបច្ចេកទេសផ្លូវការកម្រិត **Production-Ready** សម្រាប់ការបង្កើត និងបន្ថែម **Template ធៀបការឌីជីថលថ្មី** ចូលក្នុងប្រព័ន្ធ **MONEA** ឲ្យមានរបៀបរៀបរយ ដំណើរការលឿន គ្មាន Error និងត្រូវចិត្តភ្ញៀវ ១០០%។

---

## 📱 ១. ទស្សនវិជ្ជាចម្បង (Mobile-First Philosophy)

- **ភ្ញៀវ ៩៥% - ៩៨% បើកមើលលើទូរសព្ទដៃ (iOS Safari & Android Chrome):**
  - យើងផ្តោតការឌីហ្សាញលើ **Mobile Canvas** (ទទឹងអេក្រង់ចន្លោះ `375px` ដល់ `480px`)។
  - នៅពេលបើកលើ Laptop/Desktop អេក្រង់ធំ ទំព័រនឹងបង្ហាញជា **Mobile Stage Canvas** ចំកណ្តាលដ៏ប្រណីត (`max-w-[540px] mx-auto`) ដោយមិនពង្រីករូបថតឲ្យយារ ឬបែកបាក់ឡើយ។
- **Fast LCP & Low Data Usage:** រាល់រូបភាព និង Asset ទាំងអស់ត្រូវ Optimize សម្រាប់ Mobile Data។

---

## 📁 ២. រចនាសម្ព័ន្ធ Folder & Files (Directory Structure)

រាល់ Template ថ្មីត្រូវមានទីតាំងនៅក្នុង `src/components/templates/` និងត្រូវចុះឈ្មោះក្នុង `index.ts` (Template Registry)៖

```text
src/components/templates/
├── [template-id]/                  # Folder ផ្ទុក Sub-components នៃ Template នោះ
│   ├── EntranceEnvelope.tsx        # ស្រោមសំបុត្រ ឬអេក្រង់បើកសំបុត្រដំបូង (Handle Autoplay)
│   ├── HeroSection.tsx             # ផ្នែក Cover, ឈ្មោះកូនកំលោះ-កូនក្រមុំ, ថ្ងៃខែ
│   ├── CountdownSection.tsx        # នាឡិការាប់ថយក្រោយ ឬពាក្យថ្លែង
│   ├── LoveStorySection.tsx        # ដំណើររឿងស្នេហា (Groom & Bride story)
│   ├── ScheduleSection.tsx         # កាលវិភាគកម្មវិធី (ព្រឹក/ល្ងាច)
│   ├── LocationSection.tsx         # ទីតាំង និង Google Maps Safe Embed / Direct Link
│   ├── GallerySection.tsx          # វិចិត្រសាលរូបថតអនុស្សាវរីយ៍ (Next/Image Optimized)
│   ├── GiftSection.tsx             # ផ្ទាំងចំណងដៃ (QR Code ធនាគារ)
│   └── ThankYouSection.tsx         # សារថ្លែងអំណរគុណ & Footer
├── YourTemplateName.tsx            # File មេដែលប្រមូលផ្តុំគ្រប់ Sections ខាងលើ
├── types.ts                        # Type definitions (WeddingData, TemplateProps...)
└── index.ts                        # 🌟 Template Registry មាស (Dynamic Loading)
```

---

## 🧬 ៣. ទិន្នន័យ Props ស្តង់ដារ (`WeddingData`)

រាល់ Template ត្រូវទទួល Props ទម្រង់ជា៖

```typescript
import { WeddingData } from "./types";

export interface TemplateProps {
    wedding: WeddingData;
    guestName?: string;
}
```

### 📋 បញ្ជីទិន្នន័យសំខាន់ៗដែលមានក្នុង `wedding`៖
- `wedding.groomName` (ឈ្មោះកូនកំលោះ) & `wedding.brideName` (ឈ្មោះកូនក្រមុំ)
- `wedding.date` (កាលបរិច្ឆេទមង្គលការ - ISO String / Date)
- `wedding.location` (ឈ្មោះទីតាំង ឬសាលមង្គលការ / Google Maps URL)
- `wedding.eventType` (`"wedding"` ឬ `"anniversary"`)
- `wedding.activities` (បញ្ជីកម្មវិធី - Array: `{ id, title, time, description, icon }`)
- `wedding.galleryItems` (បញ្ជីរូបថត - Array: `{ url, type, caption }`)
- `wedding.themeSettings`:
  - `primaryColor` (ពណ៌ចម្បង ឧ. `#D4AF37`, `#E11D48`)
  - `heroImage`, `heroImageX`, `heroImagePosition` (រូប Cover និងទីតាំងចំណុចកណ្តាល)
  - `groomStory`, `brideStory`, `storyTitle` (រឿងរ៉ាវស្នេហា)
  - `musicUrl` (Link ចម្រៀង Background ឧ. `.mp3`)
  - `videoUrl` (Link YouTube Video)
  - `bankAccounts` (បញ្ជីកុងធនាគារចំណងដៃ - Array: `{ bankName, accountName, accountNumber, qrCodeUrl }`)
  - `visibility` (ការកំណត់បើក/បិទ Section):
    - `showStory`, `showSchedule`, `showGallery`, `showGuestbook`, `showGift`, `showVideo`, `showMap`

---

## 🛡️ ៤. វិធានបច្ចេកទេស Production-Ready (Rules & Standards)

### វិធានទី១៖ ការពារករណីទិន្នន័យទទេ (Always Provide Fallbacks)
កុំសន្មតថាម្ចាស់ការបានបំពេញទិន្នន័យគ្រប់ប្រអប់។ ត្រូវឆែកលក្ខខណ្ឌ និងដាក់ Fallback ជានិច្ច៖
```tsx
const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems?.[0]?.url || "/images/default-hero.jpg";
const activities = wedding.activities || [];
const bankAccounts = wedding.themeSettings?.bankAccounts || [];
const primaryColor = wedding.themeSettings?.primaryColor || "#D4AF37";
```

---

### វិធានទី២៖ គោរពតាមការបើក/បិទ Section របស់ម្ចាស់ការ (`visibility`)
```tsx
{(wedding.themeSettings?.visibility as any)?.showStory !== false && (
    <LoveStorySection wedding={wedding} />
)}

{(wedding.themeSettings?.visibility as any)?.showGift !== false && bankAccounts.length > 0 && (
    <GiftSection wedding={wedding} />
)}
```

---

### វិធានទី៣៖ ការគ្រប់គ្រង Audio/Music Autoplay Policy (iOS Safari & Android Chrome)
នៅលើ Mobile Browsers ប្រព័ន្ធសុវត្ថិភាពនឹង **Block Autoplay** ជាដាច់ខាត ប្រសិនបើមិនទាន់មាន User Gesture (ការចុចពីអ្នកប្រើប្រាស់)។

> [!IMPORTANT]
> **ដំណោះស្រាយស្តង់ដារ:** ត្រូវ Trigger Audio `play()` ភ្លាមៗនៅក្នុង Event `onClick` នៃប៊ូតុង **"បើកសំបុត្រអញ្ជើញ" (Entrance Envelope)**៖

```tsx
const handleOpenEnvelope = () => {
    setRevealed(true);
    
    // Trigger Background Music ពេល User ចុចបើកសំបុត្រ (User Interaction Gesture)
    if (wedding.themeSettings?.musicUrl) {
        const audio = document.getElementById("bg-music") as HTMLAudioElement;
        if (audio) {
            audio.play().catch((err) => {
                console.log("Autoplay policy prevented audio play:", err);
            });
        }
    }
};
```

---

### វិធានទី៤៖ ស្តង់ដារ Dynamic Theme Color / Primary Color Injection
កុំដេរ Hardcoded Tailwind Class ដូចជា `bg-[#D4AF37]` ឬ `text-[#D4AF37]` ចោលក្នុង HTML ឲ្យសោះ ព្រោះម្ចាស់ការនឹងមិនអាចប្តូរពណ៌ប្រចាំរោងការរបស់ពួកគេបានទេ។

> [!TIP]
> **ដំណោះស្រាយស្តង់ដារ:** ចាក់បញ្ចូល **CSS Variable (`--primary`)** ឬ Dynamic Style លើ Root Wrapper នៃ Template៖

```tsx
const primaryColor = wedding.themeSettings?.primaryColor || "#D4AF37";

return (
    <div 
        style={{ "--primary": primaryColor } as React.CSSProperties}
        className="relative w-full min-h-screen bg-[#FDFBF7]"
    >
        {/* ប៊ូតុង និង Element សំខាន់ៗប្រើប្រាស់ Dynamic Primary Color */}
        <button 
            style={{ backgroundColor: primaryColor }}
            className="px-8 py-4 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
        >
            បើកសំបុត្រអញ្ជើញ
        </button>

        <h1 style={{ color: primaryColor }} className="text-3xl font-khmer-moul">
            {wedding.groomName} & {wedding.brideName}
        </h1>
    </div>
);
```

---

### វិធានទី៥៖ ការ Render Google Maps URL ឱ្យត្រឹមត្រូវ និងមានសុវត្ថិភាព (Embed vs Direct Link)
ក្នុង `LocationSection.tsx` កុំដាក់ `<iframe src={wedding.location}>` ដោយផ្ទាល់ ព្រោះ `wedding.location` ភាគច្រើនជា Google Maps Link ធម្មតា (មិនមែន Embed URL) ឬគ្រាន់តែជាឈ្មោះអក្សរទីតាំង (ឧ. "សណ្ឋាគារ ហ្គាឌិន ស៊ីធី")។

> [!WARNING]
> ការដាក់ Link ធម្មតាចូលក្នុង `iframe.src` នឹងបណ្តាលឱ្យ Browser បង្ហាញ Error X-Frame-Options Denied!

```tsx
// Helper សម្រាប់បំប្លែង Location ទៅជា Safe Embed URL និង Navigation URL
const getMapEmbedUrl = (location?: string) => {
    if (!location) return null;
    if (location.includes("google.com/maps/embed")) return location;
    // ប្រសិនបើជា Search Query ឬឈ្មោះទីតាំងធម្មតា៖
    return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

const getDirectMapUrl = (location?: string) => {
    if (!location) return "https://maps.google.com";
    if (location.startsWith("http")) return location;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};

// ការប្រើប្រាស់ក្នុង JSX:
const embedUrl = getMapEmbedUrl(wedding.location);
const directUrl = getDirectMapUrl(wedding.location);

return (
    <div className="space-y-4">
        {embedUrl && (
            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <iframe
                    title="Wedding Location Map"
                    src={embedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        )}
        <a 
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
        >
            📍 បើកមើលផ្លូវតាម Google Maps
        </a>
    </div>
);
```

---

### វិធានទី៦៖ Image Optimization ជាមួយ `next/image` (Mobile Data & Fast LCP)
ក្នុង Mobile Canvas រូបភាព Gallery និង Hero Cover បើប្រើ tag `<img>` ធម្មតា នឹងទាញយករូប Full Resolution ធ្វើឲ្យទូរសព្ទដើរយឺត និងស៊ី Data អស់ច្រើន។

> [!TIP]
> ត្រូវកំណត់ស្តង់ដារប្រើប្រាស់ `<Image />` ពី `next/image` ជាមួយ parameter `sizes="(max-width: 540px) 100vw, 540px"`៖

```tsx
import Image from "next/image";

// 1. សម្រាប់ Hero Cover Image (ប្រើ priority ដើម្បី Fast LCP):
<div className="relative w-full h-[480px] overflow-hidden rounded-3xl">
    <Image
        src={heroImage}
        alt={`${wedding.groomName} & ${wedding.brideName}`}
        fill
        priority
        sizes="(max-width: 540px) 100vw, 540px"
        className="object-cover"
    />
</div>

// 2. សម្រាប់ Gallery Items (Lazy Loading):
<div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
    <Image
        src={photo.url}
        alt={photo.caption || "Wedding Moment"}
        fill
        loading="lazy"
        sizes="(max-width: 540px) 50vw, 270px"
        className="object-cover hover:scale-105 transition-transform duration-500"
    />
</div>
```

---

### វិធានទី៧៖ SEO & Open Graph Meta Tags (Social Sharing Preview)
នៅពេលភ្ញៀវ Share Link ធៀបការតាម Telegram, Facebook, Messenger ឬ iMessage ប្រព័ន្ធត្រូវបង្ហាញរូបភាព Cover, ឈ្មោះកូនកំលោះ-កូនក្រមុំ និងកាលបរិច្ឆេទយ៉ាងស្រស់ស្អាត។

ចំនុចត្រូវរៀបចំក្នុង Root Route (`src/app/w/[id]/page.tsx` ឬ Server Component Layout):

```typescript
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const wedding = await getWeddingData(params.id);
    
    if (!wedding) {
        return { title: "MONEA - Digital Wedding Invitation" };
    }

    const title = `សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍៖ ${wedding.groomName} & ${wedding.brideName}`;
    const description = `សូមគោរពអញ្ជើញឯកឧត្តម លោកជំទាវ លោក លោកស្រី អញ្ជើញចូលរួមពិធីមង្គលការរបស់យើងខ្ញុំ នៅថ្ងៃទី ${wedding.date ? new Date(wedding.date).toLocaleDateString('km-KH', { dateStyle: 'full' }) : ''}`;
    const coverImage = wedding.themeSettings?.heroImage || '/images/og-default.jpg';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: coverImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [coverImage],
        },
    };
}
```

---

### វិធានទី៨៖ Framer Motion Scroll Container & Font អក្សរខ្មែរ
- ប្រសិនបើប្រើ `useScroll({ target: containerRef })` ត្រូវតែដាក់ `className="relative ..."` លើ Element ដែលមាន Ref។
- **Font ចំណងជើងធំ (Hero / Titles):** `font-khmer-moul` (Moul) ឬ `font-playfair` (English)
- **Font អត្ថបទ និងខ្លឹមសារទូទៅ (Body Text):** `font-kantumruy` (Kantumruy Pro)
- **ទំហំអក្សរ:** ប្រើ Responsive Typography (ឧ. `text-2xl md:text-3xl`)

---

## 🚀 ៥. ជំហានភ្ជាប់ Template ថ្មីចូលប្រព័ន្ធ (Dynamic Template Registry)

ដើម្បីកុំឲ្យកូដពិបាក Maintain ពេលមាន Template ច្រើន (២០-៣០ Templates) យើងលែងប្រើ Switch/Case ឬ `if/else` ច្រើនជាន់ទៀតហើយ។ យើងប្រើ **Dynamic Template Registry** ជាមួយ `React.lazy`។

### ជំហានទី១៖ ចុះឈ្មោះក្នុង Template Registry (`src/components/templates/index.ts`)
បន្ថែម Template ថ្មីរបស់អ្នកចូលក្នុង File Registry មេ៖

```typescript
import { lazy, ComponentType } from "react";
import { TemplateProps } from "./types";

export const TEMPLATE_REGISTRY: Record<string, ComponentType<TemplateProps>> = {
    "khmer-legacy": lazy(() => import("./KhmerLegacy")),
    "modern-minimal": lazy(() => import("./ModernMinimal")),
    "anniversary-elegant": lazy(() => import("./AnniversaryElegant")),
    "royal-elegance": lazy(() => import("./RoyalElegance")), // 🌟 Template ថ្មីរបស់អ្នក
};

// Helper សម្រាប់ទាញយក Template Component ដោយស្វ័យប្រវត្តិ (Safe Fallback)
export const getTemplateComponent = (templateId?: string): ComponentType<TemplateProps> => {
    if (!templateId || !TEMPLATE_REGISTRY[templateId]) {
        return TEMPLATE_REGISTRY["khmer-legacy"];
    }
    return TEMPLATE_REGISTRY[templateId];
};
```

### ជំហានទី២៖ បន្ថែមក្នុងបញ្ជីជ្រើសរើស Template ក្នុង Dashboard Design
បើក File `src/app/dashboard/design/components/Step1Template.tsx` រួចបន្ថែមព័ត៌មានបង្ហាញ Template ដោយភ្ជាប់ជាមួយ **Template Code (M-01, M-02, M-03, M-04...)**៖
```tsx
{
    code: "M-04", // 🏷️ លេខកូដកាត់ផ្លូវការ (M-01, M-02, M-03, M-04...)
    id: "royal-elegance",
    title: "M-04: រាជវាំងប្រណីត (Royal Elegance)",
    categories: ['wedding'],
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
    image: "/images/templates/royal-elegance/thumbnail.jpg",
    isFree: false,
    comingSoon: false
}
```

> [!TIP]
> **ស្តង់ដារកំណត់ឈ្មោះកូដកាត់ Template (M-XX Naming Standard):**
> - **M-01:** `khmer-legacy` (រាជវាំងខ្មែរ / Khmer Legacy)
> - **M-02:** `modern-minimal` (តិចតួចទាន់សម័យ / Modern Minimal)
> - **M-03:** `anniversary-elegant` (ខួបប្រណីត / Anniversary Elegant)
> - **M-04, M-05...:** សម្រាប់ Template ថ្មីៗដែលនឹងត្រូវបង្កើតបន្តបន្ទាប់។
>
> *អត្ថប្រយោជន៍:* ជួយឱ្យអតិថិជន និងក្រុមការងារ Support ងាយស្រួលហៅចំណាំម៉ូដតាមលេខកូដកាត់ (ឧ. "ខ្ញុំចង់បានម៉ូដ M-01") ដោយមិនបាច់ហៅឈ្មោះវែងៗ។

### ជំហានទី៣៖ Render ដោយស្វ័យប្រវត្តិតាម Registry ក្នុង Preview & Live View
ក្នុង `preview/page.tsx` និង `WeddingDataView.tsx` គ្រាន់តែហៅប្រើខ្លីបែបនេះ៖

```tsx
import { Suspense } from "react";
import { getTemplateComponent } from "@/components/templates";

export default function WeddingView({ wedding, guestName }: { wedding: WeddingData; guestName?: string }) {
    const SelectedTemplate = getTemplateComponent(wedding.templateId);

    return (
        <Suspense fallback={<TemplateLoadingSkeleton />}>
            <SelectedTemplate wedding={wedding} guestName={guestName} />
        </Suspense>
    );
}
```

### ជំហានទី៤៖ ពិនិត្យភាពត្រឹមត្រូវនៃកូដ (Type Check)
រត់ពាក្យបញ្ជាដើម្បីប្រាកដថាគ្មាន Type Error៖
```bash
npx tsc --noEmit
```

---

## 💻 ៦. គំរូកូដគ្រោងឆ្អឹងចាប់ផ្តើមពេញលេញ (Full Production-Ready Starter Boilerplate)

បងអាចចម្លង (Copy) កូដគំរូដែលបំពាក់គ្រប់ស្តង់ដារបច្ចេកទេសទាំង ៦ ខាងលើនេះយកទៅចាប់ផ្តើមបង្កើត Template ថ្មីបានភ្លាមៗ៖

```tsx
import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { WeddingData, TemplateProps } from "./types";

export default function YourNewTemplate({ wedding, guestName }: TemplateProps) {
    const [revealed, setRevealed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. Fallbacks & Dynamic Color Configuration
    const primaryColor = wedding.themeSettings?.primaryColor || "#D4AF37";
    const heroImage = wedding.themeSettings?.heroImage || wedding.galleryItems?.[0]?.url || "/images/default-hero.jpg";
    const musicUrl = wedding.themeSettings?.musicUrl;
    const activities = wedding.activities || [];
    const bankAccounts = wedding.themeSettings?.bankAccounts || [];

    // 2. Audio Autoplay Trigger on User Gesture
    const handleOpenEnvelope = () => {
        setRevealed(true);
        if (musicUrl && audioRef.current) {
            audioRef.current.play().catch((err) => {
                console.log("Autoplay blocked by browser policy:", err);
            });
        }
    };

    return (
        <div 
            style={{ "--primary": primaryColor } as React.CSSProperties}
            className="relative w-full min-h-screen bg-[#FDFBF7] text-slate-900 font-kantumruy selection:bg-[var(--primary)] selection:text-white"
        >
            {/* Background Audio Player */}
            {musicUrl && (
                <audio ref={audioRef} id="bg-music" src={musicUrl} loop preload="auto" />
            )}

            {/* 1. Entrance Reveal Screen (Envelope Modal) */}
            <AnimatePresence>
                {!revealed && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-6 backdrop-blur-md text-white text-center"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="max-w-sm w-full p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-6"
                        >
                            <span className="text-xs uppercase tracking-widest text-slate-400">
                                សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍
                            </span>
                            
                            <h2 style={{ color: primaryColor }} className="text-2xl font-khmer-moul">
                                {wedding.groomName} & {wedding.brideName}
                            </h2>

                            {guestName && (
                                <p className="text-sm text-slate-300">
                                    សូមគោរពអញ្ជើញ៖ <span className="font-semibold text-white">{guestName}</span>
                                </p>
                            )}

                            <button
                                onClick={handleOpenEnvelope}
                                style={{ backgroundColor: primaryColor }}
                                className="w-full py-4 text-white font-bold rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all"
                            >
                                💌 បើកសំបុត្រអញ្ជើញ
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Main Mobile Stage Canvas */}
            <main className="relative max-w-[540px] mx-auto min-h-screen shadow-2xl bg-white flex flex-col">
                
                {/* Hero Cover Section (Next/Image Optimized) */}
                <section className="relative h-screen min-h-[600px] flex flex-col items-center justify-end p-8 text-center text-white overflow-hidden">
                    <Image
                        src={heroImage}
                        alt={`${wedding.groomName} & ${wedding.brideName}`}
                        fill
                        priority
                        sizes="(max-width: 540px) 100vw, 540px"
                        className="object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Hero Text Content */}
                    <div className="relative z-10 space-y-3 pb-8">
                        <span className="text-xs uppercase tracking-widest text-slate-300">
                            អាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ
                        </span>
                        <h1 style={{ color: primaryColor }} className="text-3xl md:text-4xl font-khmer-moul">
                            {wedding.groomName} & {wedding.brideName}
                        </h1>
                        <p className="text-sm tracking-widest text-slate-200">
                            {wedding.date ? new Date(wedding.date).toLocaleDateString('km-KH', { dateStyle: 'full' }) : ''}
                        </p>
                    </div>
                </section>

                {/* Schedule Section */}
                {(wedding.themeSettings?.visibility as any)?.showSchedule !== false && activities.length > 0 && (
                    <section className="p-6 py-12 space-y-6">
                        <h3 style={{ color: primaryColor }} className="text-xl font-khmer-moul text-center">
                            កម្មវិធីសិរីមង្គល
                        </h3>
                        <div className="space-y-4">
                            {activities.map((item, idx) => (
                                <div key={item.id || idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="font-bold text-sm text-slate-500 whitespace-nowrap">{item.time}</div>
                                    <div>
                                        <div className="font-semibold text-slate-900">{item.title}</div>
                                        {item.description && <div className="text-xs text-slate-600 mt-1">{item.description}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Gift Section */}
                {(wedding.themeSettings?.visibility as any)?.showGift !== false && bankAccounts.length > 0 && (
                    <section className="p-6 py-12 bg-slate-50 space-y-6 text-center">
                        <h3 style={{ color: primaryColor }} className="text-xl font-khmer-moul">
                            ចំណងដៃមង្គលការ
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            {bankAccounts.map((acc, idx) => (
                                <div key={idx} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center space-y-3">
                                    {acc.qrCodeUrl && (
                                        <div className="relative w-40 h-40 rounded-xl overflow-hidden border">
                                            <Image 
                                                src={acc.qrCodeUrl} 
                                                alt={acc.bankName} 
                                                fill 
                                                sizes="160px"
                                                className="object-contain" 
                                            />
                                        </div>
                                    )}
                                    <div className="font-semibold text-slate-800">{acc.bankName}</div>
                                    <div className="text-xs text-slate-500">{acc.accountName} - {acc.accountNumber}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-auto py-8 text-center text-xs text-slate-400 border-t border-slate-100">
                    MONEA Digital Wedding Invitation Platform
                </footer>
            </main>
        </div>
    );
}
```

---

*ឯកសារនេះត្រូវបានបង្កើតឡើងសម្រាប់ប្រើប្រាស់ជាស្តង់ដារផ្លូវការកម្រិត Production ក្នុងគម្រោង MONEA Platform។*
