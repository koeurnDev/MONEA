export interface SongLibraryItem {
    id: string;
    title: string;
    fileName: string;
}

export const songLibrary: SongLibraryItem[] = [
    { id: "audio-1", title: "បទភ្លេងលេខ ១", fileName: "audio-1.mp3" },
    { id: "audio-2", title: "បទភ្លេងលេខ ២", fileName: "audio-2.mp3" },
    { id: "audio-3", title: "បទភ្លេងលេខ ៣", fileName: "audio-3.mp3" },
    { id: "audio-4", title: "បទភ្លេងលេខ ៤", fileName: "audio-4.mp3" },
    { id: "audio-5", title: "បទភ្លេងលេខ ៥", fileName: "audio-5.mp3" },
    { id: "audio-6", title: "បទភ្លេងលេខ ៦", fileName: "audio-6.mp3" },
    { id: "audio-7", title: "បទភ្លេងលេខ ៧", fileName: "audio-7.mp3" },
    { id: "kruprengpret", title: "Kru Preng Pret", fileName: "1773404075365-vgd614-kruprengpret.mp3" },
    { id: "kukrog", title: "Kukrog", fileName: "kukrog.mp3" },
    { id: "nisai", title: "Nisai", fileName: "nisai.mp3" },
    { id: "veha", title: "Veha", fileName: "veha.mp3" },
];

export function getSongUrl(fileName: string): string {
    return `${import.meta.env.BASE_URL}song/${encodeURIComponent(fileName)}`;
}
