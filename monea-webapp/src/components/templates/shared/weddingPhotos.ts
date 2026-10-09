import type { WeddingData } from "../types";

const DEMO_PHOTO_FILES = new Set([
    "621811254_905398285378636_5240747682765358044_n.jpg",
    "621811002_905396558712142_5126771807004187076_n.jpg",
    "621811942_905392918712506_8600818650624857202_n.jpg",
    "621813168_905393265379138_2356104923368506186_n.jpg",
    "622279784_905392782045853_1189842078802821714_n.jpg",
    "622374686_905392995379165_1001573724208229331_n.jpg",
    "622582548_905399002045231_4147705888928073222_n.jpg",
    "622629866_905398512045280_817022291532741601_n.jpg",
]);

export const isDemoPhoto = (url?: string) => {
    if (!url) return false;
    const fileName = url.split(/[?#]/, 1)[0].split("/").pop();
    return Boolean(fileName && DEMO_PHOTO_FILES.has(fileName));
};

export const getWeddingPhotos = (wedding: WeddingData) => {
    const photos = (wedding.galleryItems || []).filter(
        (item) => item.url?.trim() && item.type?.toUpperCase() !== "VIDEO" && !isDemoPhoto(item.url),
    );
    const uploadedPhotos = photos.filter((item) => item.publicId);
    return uploadedPhotos.length ? uploadedPhotos : photos;
};

export type ConfiguredPaymentAccount = {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    qrUrl?: string | null;
    qrCodeUrl?: string | null;
};

export const getConfiguredPaymentAccounts = (accounts: unknown): ConfiguredPaymentAccount[] => {
    if (!Array.isArray(accounts)) return [];

    return accounts.flatMap((account): ConfiguredPaymentAccount[] => {
        if (!account || typeof account !== "object") return [];
        const candidate = account as ConfiguredPaymentAccount;
        const accountNumber = candidate.accountNumber?.trim();
        const qrUrl = candidate.qrUrl?.trim() || candidate.qrCodeUrl?.trim();
        const qrPath = qrUrl?.split(/[?#]/, 1)[0];
        const hasRealAccountNumber = Boolean(accountNumber && accountNumber !== "001 234 567");
        const hasRealQr = Boolean(qrPath && !qrPath.endsWith("/images/qr.webp"));
        if (!hasRealAccountNumber && !hasRealQr) return [];

        const sanitizedAccount: ConfiguredPaymentAccount = {
            ...candidate,
            accountName: candidate.accountName?.trim() === "KAB SIN & MEAS CHANMEANA" ? undefined : candidate.accountName,
            accountNumber: hasRealAccountNumber ? accountNumber : undefined,
            qrUrl: candidate.qrUrl && !candidate.qrUrl.split(/[?#]/, 1)[0].endsWith("/images/qr.webp") ? candidate.qrUrl : undefined,
            qrCodeUrl: candidate.qrCodeUrl && !candidate.qrCodeUrl.split(/[?#]/, 1)[0].endsWith("/images/qr.webp") ? candidate.qrCodeUrl : undefined,
        };
        return [sanitizedAccount];
    });
};

export const getWeddingHeroImage = (wedding: WeddingData, fallback = "") => {
    const uploadedPhoto = getWeddingPhotos(wedding).find((item) => item.publicId)?.url;
    return uploadedPhoto
        || (wedding.themeSettings?.heroImagePublicId && !isDemoPhoto(wedding.themeSettings.heroImage) ? wedding.themeSettings.heroImage : undefined)
        || (!isDemoPhoto(wedding.themeSettings?.heroImage) ? wedding.themeSettings?.heroImage : undefined)
        || (!isDemoPhoto(wedding.themeSettings?.coverImageUrl) ? wedding.themeSettings?.coverImageUrl : undefined)
        || getWeddingPhotos(wedding)[0]?.url
        || (!isDemoPhoto(fallback) ? fallback : "");
};
