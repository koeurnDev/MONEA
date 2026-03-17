export interface BankAccount {
    bankName: string;
    accountName: string;
    accountNumber: string;
    qrUrl?: string | null;
    side?: string;
}

export interface GiftRegistryItem {
    id: string;
    type: string; // 'ABA' | 'ACLEDA' | 'WING' | 'CASH'
    bankName?: string;
    accountName: string;
    accountNumber: string;
    qrCodeUrl?: string;
}

export interface WeddingData {
    id: string;
    groomName: string;
    brideName: string;
    date: Date | string;
    time?: string | null;
    location: string | null;
    galleryItems: { url: string; publicId?: string; type: string }[];
    activities: { time: string; description: string | null; title: string, icon?: string | null, publicId?: string | null, order?: number }[];
    themeSettings?: {
        primaryColor?: string;
        musicUrl?: string;
        musicUrlPublicId?: string;
        mapLink?: string;
        videoUrl?: string;
        heroImage?: string;
        heroImagePublicId?: string;
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
        englishImageX?: string;
        englishImagePosition?: string;
        englishImageScale?: number;
        bannerImageX?: string;
        bannerImagePosition?: string;
        bannerImageScale?: number;
        signatureImageScale?: number;
        editorialPan1X?: string; editorialPan1Y?: string; editorialPan1Scale?: number;
        editorialPan2X?: string; editorialPan2Y?: string; editorialPan2Scale?: number;
        editorialPan3X?: string; editorialPan3Y?: string; editorialPan3Scale?: number;
        editorialPan4X?: string; editorialPan4Y?: string; editorialPan4Scale?: number;
        signaturePan1X?: string; signaturePan1Y?: string; signaturePan1Scale?: number;
        signaturePan2X?: string; signaturePan2Y?: string; signaturePan2Scale?: number;
        signaturePan3X?: string; signaturePan3Y?: string; signaturePan3Scale?: number;
        hubImageX?: string; hubImageY?: string;
        mapImageX?: string; mapImageY?: string;
        preWeddingPan1X?: string; preWeddingPan1Y?: string;
        preWeddingPan2X?: string; preWeddingPan2Y?: string;
        preWeddingPan3X?: string; preWeddingPan3Y?: string;
        preWeddingPan4X?: string; preWeddingPan4Y?: string;
        preWeddingPan5X?: string; preWeddingPan5Y?: string;
        preWeddingPan6X?: string; preWeddingPan6Y?: string;
        galleryImageX?: string; galleryImageY?: string;
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
        story?: {
            kh?: string;
            en?: string;
        };
        customLabels?: Record<string, string>;
        storyImages?: string[];
        welcomeMessage?: string;
        invitationText?: string;
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
        editorialText1?: string;
        editorialText2?: string;
        editorialText3?: string;
        giftRegistry?: GiftRegistryItem[];
        locationQrUrl?: string;
        locationQrPublicId?: string;
    } | null;
    templateId?: string | null;
    eventType?: 'wedding' | 'anniversary';
    packageType?: string | null;
    guestId?: string; // Unique ID for QR check-in
}
