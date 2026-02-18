export interface BankAccount {
    bankName: string;
    accountName: string;
    accountNumber: string;
    qrUrl?: string | null;
}

export interface WeddingData {
    id: string;
    groomName: string;
    brideName: string;
    date: Date | string;
    location: string | null;
    galleryItems: { url: string; type: string }[];
    activities: { time: string; description: string | null; title: string }[];
    themeSettings?: {
        primaryColor?: string;
        musicUrl?: string;
        mapLink?: string;
        videoUrl?: string;
        heroImage?: string;
        heroImagePosition?: string;
        heroImageX?: string;
        heroImageScale?: number;
        heroImageBrightness?: number;
        heroImageContrast?: number;
        groomImagePosition?: string;
        groomImageX?: string;
        groomImageScale?: number;
        brideImagePosition?: string;
        brideImageX?: string;
        brideImageScale?: number;
        dynamicPrimaryColor?: string;
        dynamicSecondaryColor?: string;
        galleryStyle?: 'masonry' | 'slider' | 'polaroid';
        facebookUrl?: string;
        telegramUrl?: string;
        paymentQrUrl?: string;
        lunarDate?: string;
        acknowledgment?: string;
        groomVow?: string;
        brideVow?: string;
        mainQuote?: string;
        bankAccounts?: BankAccount[];
        groomStory?: string;
        brideStory?: string;
        customLabels?: Record<string, string>;
        storyImages?: string[];
        welcomeMessage?: string;
        visibility?: {
            showHero?: boolean;
            showGallery?: boolean;
            showStory?: boolean;
            showTimeline?: boolean;
            showGuestbook?: boolean;
            showEventInfo?: boolean;
            showContact?: boolean;
        };
        fontStyle?: string;
        shareImage?: string;
        parents?: {
            groomFather?: string;
            groomMother?: string;
            brideFather?: string;
            brideMother?: string;
            groomPhone?: string;
            bridePhone?: string;
        };
        giftRegistry?: {
            id: string;
            type: string; // 'ABA' | 'ACLEDA' | 'WING' | 'CASH'
            bankName?: string;
            accountName: string;
            accountNumber: string;
            qrCodeUrl?: string;
        }[];
    } | null;
    templateId?: string | null;
    eventType?: 'wedding' | 'anniversary';
}
