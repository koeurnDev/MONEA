import { useState, useEffect, useMemo, useRef } from "react";
import { WeddingData } from "../types";
import { useImagePan } from "../shared/CinematicComponents";
import { useTranslation } from "@/i18n/LanguageProvider";

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2000&auto=format&fit=crop"
];

export const useSmartColor = (imageUrl: string) => {
    return { primary: '#D4AF37', secondary: '#8E5A5A', dark: '#1a1a1a' };
};

export function useKhmerLegacy(wedding: WeddingData) {
    const { locale } = useTranslation();
    const [revealed, setRevealed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        const handleForceReveal = () => setRevealed(true);
        window.addEventListener('FORCE_REVEAL', handleForceReveal);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('FORCE_REVEAL', handleForceReveal);
        };
    }, []);

    const musicUrl = wedding.themeSettings?.musicUrl;
    const galleryImages = useMemo(() => {
        const items = (wedding?.galleryItems || []).map(item => item?.url || "");
        // Pad with empty strings if needed to ensure stable indices for the 11 special slots
        const padded = [...items];
        while (padded.length < 11) padded.push("");
        return padded;
    }, [wedding?.galleryItems]);

    const dynamicPool = useMemo(() => {
        const items = (wedding?.galleryItems || [])
            .filter(item => item.type !== 'CERTIFICATE')
            .map(item => item?.url || "")
            .filter(url => url !== "");
        
        // Everything from index 11 onwards is "General Gallery"
        return items.slice(11);
    }, [wedding?.galleryItems]);

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const target = new Date(wedding.date).getTime();
        const update = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, target - now);
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            });
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [wedding.date]);

    const heroImage = wedding.themeSettings?.heroImage || (galleryImages && galleryImages.length > 0 && galleryImages[0] !== "" ? galleryImages[0] : "/assets/khmer-legacy/621811254_905398285378636_5240747682765358044_n.jpg");
    const smartColors = useSmartColor(heroImage);

    const heroPan = useImagePan(wedding.themeSettings?.heroImageX || '50%', wedding.themeSettings?.heroImagePosition || '0%', 'heroImageX', 'heroImagePosition');
    const englishPan = useImagePan(wedding.themeSettings?.englishImageX || '50%', wedding.themeSettings?.englishImagePosition || '50%', 'englishImageX', 'englishImagePosition');
    
    // Editorial Pans
    const editorialPan1 = useImagePan(wedding.themeSettings?.editorialPan1X || '50%', wedding.themeSettings?.editorialPan1Y || '50%', 'editorialPan1X', 'editorialPan1Y');
    const editorialPan2 = useImagePan(wedding.themeSettings?.editorialPan2X || '50%', wedding.themeSettings?.editorialPan2Y || '50%', 'editorialPan2X', 'editorialPan2Y');
    const editorialPan3 = useImagePan(wedding.themeSettings?.editorialPan3X || '50%', wedding.themeSettings?.editorialPan3Y || '50%', 'editorialPan3X', 'editorialPan3Y');
    const editorialPan4 = useImagePan(wedding.themeSettings?.editorialPan4X || '50%', wedding.themeSettings?.editorialPan4Y || '50%', 'editorialPan4X', 'editorialPan4Y');

    // Signature Pans
    const signaturePan1 = useImagePan(wedding.themeSettings?.signaturePan1X || '50%', wedding.themeSettings?.signaturePan1Y || '50%', 'signaturePan1X', 'signaturePan1Y');
    const signaturePan2 = useImagePan(wedding.themeSettings?.signaturePan2X || '50%', wedding.themeSettings?.signaturePan2Y || '50%', 'signaturePan2X', 'signaturePan2Y');
    const signaturePan3 = useImagePan(wedding.themeSettings?.signaturePan3X || '50%', wedding.themeSettings?.signaturePan3Y || '50%', 'signaturePan3X', 'signaturePan3Y');
    const signaturePan4 = useImagePan(wedding.themeSettings?.signaturePan4X || '50%', wedding.themeSettings?.signaturePan4Y || '50%', 'signaturePan4X', 'signaturePan4Y');
    const signaturePan5 = useImagePan(wedding.themeSettings?.signaturePan5X || '50%', wedding.themeSettings?.signaturePan5Y || '50%', 'signaturePan5X', 'signaturePan5Y');
    const signaturePan6 = useImagePan(wedding.themeSettings?.signaturePan6X || '50%', wedding.themeSettings?.signaturePan6Y || '50%', 'signaturePan6X', 'signaturePan6Y');

    const hubPan = useImagePan(wedding.themeSettings?.hubImageX || '50%', wedding.themeSettings?.hubImageY || '50%', 'hubImageX', 'hubImageY');
    const mapPan = useImagePan(wedding.themeSettings?.mapImageX || '50%', wedding.themeSettings?.mapImageY || '50%', 'mapImageX', 'mapImageY');

    const preWeddingPan1 = useImagePan(wedding.themeSettings?.preWeddingPan1X || '50%', wedding.themeSettings?.preWeddingPan1Y || '50%', 'preWeddingPan1X', 'preWeddingPan1Y');
    const preWeddingPan2 = useImagePan(wedding.themeSettings?.preWeddingPan2X || '50%', wedding.themeSettings?.preWeddingPan2Y || '50%', 'preWeddingPan2X', 'preWeddingPan2Y');
    const preWeddingPan3 = useImagePan(wedding.themeSettings?.preWeddingPan3X || '50%', wedding.themeSettings?.preWeddingPan3Y || '50%', 'preWeddingPan3X', 'preWeddingPan3Y');
    const preWeddingPan4 = useImagePan(wedding.themeSettings?.preWeddingPan4X || '50%', wedding.themeSettings?.preWeddingPan4Y || '50%', 'preWeddingPan4X', 'preWeddingPan4Y');
    const preWeddingPan5 = useImagePan(wedding.themeSettings?.preWeddingPan5X || '50%', wedding.themeSettings?.preWeddingPan5Y || '50%', 'preWeddingPan5X', 'preWeddingPan5Y');
    const preWeddingPan6 = useImagePan(wedding.themeSettings?.preWeddingPan6X || '50%', wedding.themeSettings?.preWeddingPan6Y || '50%', 'preWeddingPan6X', 'preWeddingPan6Y');

    const formatKhmerDate = (date: string | Date, includeDayName: boolean = false) => {
        if (!date) return "";
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return "";
            
            const khmerDays = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
            const khmerMonths = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
            const khmerNumbers = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
            
            const toKhmerNum = (num: number) => {
                if (typeof num !== 'number' || isNaN(num)) return "";
                return num.toString().split('').map(digit => {
                    const d = parseInt(digit);
                    return isNaN(d) ? digit : khmerNumbers[d];
                }).join('');
            };

            const dayName = khmerDays[d.getDay()];
            const day = toKhmerNum(d.getDate());
            const month = khmerMonths[d.getMonth()];
            const year = toKhmerNum(d.getFullYear());

            if (includeDayName) {
                return `ថ្ងៃ${dayName} ទី${day} ខែ${month} ឆ្នាំ${year}`;
            }
            return `ទី${day} ខែ${month} ឆ្នាំ${year}`;
        } catch (e) { return ""; }
    };

    const formatEnglishDate = (date: string | Date, long: boolean = false) => {
        if (!date) return "";
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return "";
            
            const options: Intl.DateTimeFormatOptions = long 
                ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                : { year: 'numeric', month: 'long', day: 'numeric' };
            
            return d.toLocaleDateString('en-US', options);
        } catch (e) { return ""; }
    };

    const formattedDateHero = useMemo(() => {
        return locale === 'km' ? formatKhmerDate(wedding.date) : formatEnglishDate(wedding.date);
    }, [wedding.date, locale]);

    const formattedDateInvitation = useMemo(() => {
        return locale === 'km' 
            ? formatKhmerDate(wedding.date, true).toUpperCase() 
            : formatEnglishDate(wedding.date, true).toUpperCase();
    }, [wedding.date, locale]);


    return {
        revealed,
        setRevealed,
        isPlaying,
        setIsPlaying,
        mounted,
        audioRef,
        timeLeft,
        galleryImages,
        heroImage,
        smartColors,
        heroPan,
        englishPan,
        editorialPan1,
        editorialPan2,
        editorialPan3,
        editorialPan4,
        signaturePan1,
        signaturePan2,
        signaturePan3,
        signaturePan4,
        signaturePan5,
        signaturePan6,
        hubPan,
        mapPan,
        preWeddingPan1,
        preWeddingPan2,
        preWeddingPan3,
        preWeddingPan4,
        preWeddingPan5,
        preWeddingPan6,
        formattedDateHero,
        formattedDateInvitation,
        musicUrl,
        dynamicPool,
        isMobile
    };
}
