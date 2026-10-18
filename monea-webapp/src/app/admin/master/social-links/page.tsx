import { useEffect, useState } from "react";
import { ArrowLeft, Facebook, Instagram, Link2, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/Toast";
import { moneaClient } from "@/lib/api-client";
import {
    DEFAULT_SOCIAL_LINKS,
    isSocialLinks,
    SOCIAL_PLATFORMS,
    type SocialLink,
    type SocialPlatform,
} from "@/lib/social-links";

const platformLabels: Record<SocialPlatform, string> = {
    telegram: "Telegram",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    other: "ផ្សេងៗ / Custom",
};

const defaultLabels: Partial<Record<SocialPlatform, string>> = {
    telegram: "Telegram",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
};

function isValidLink(link: SocialLink): boolean {
    if (!link.label.trim() || link.label.trim().length > 50) return false;
    if (!link.url.trim() || link.url.trim().length > 2048) return false;

    try {
        const url = new URL(link.url.trim());
        return (url.protocol === "https:" || url.protocol === "http:") &&
            !url.username && !url.password;
    } catch {
        return false;
    }
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
    if (platform === "telegram") return <Send className="h-4 w-4" />;
    if (platform === "facebook") return <Facebook className="h-4 w-4" />;
    if (platform === "instagram") return <Instagram className="h-4 w-4" />;
    if (platform === "tiktok") return <TikTokIcon size={16} />;
    return <Link2 className="h-4 w-4" />;
}

export default function SocialLinksAdminPage() {
    const [links, setLinks] = useState<SocialLink[]>(DEFAULT_SOCIAL_LINKS);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const response = await moneaClient.get<{ links: unknown }>("/api/admin/master/social-links", {
                cache: "no-store",
            });
            if (cancelled) return;

            if (response.error) {
                console.error("[Admin Social Links] Failed to load:", response.error);
                setLoadError(true);
                showToast({
                    title: "មិនអាចទាញយក Social Media បាន",
                    description: response.error,
                    type: "error",
                });
            } else if (response.data?.links !== null && response.data?.links !== undefined) {
                if (isSocialLinks(response.data.links)) {
                    setLinks(response.data.links);
                } else {
                    console.error("[Admin Social Links] Invalid links response");
                    setLoadError(true);
                    showToast({ title: "ទម្រង់ Social Media មិនត្រឹមត្រូវ", type: "error" });
                }
            }

            setLoading(false);
        };
        void load();
        return () => { cancelled = true; };
        // Do not reload server values after each draft edit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showToast]);

    const updateLink = (index: number, update: Partial<SocialLink>) => {
        setLinks((current) => current.map((link, linkIndex) =>
            linkIndex === index ? { ...link, ...update } : link
        ));
    };

    const updatePlatform = (index: number, platform: SocialPlatform) => {
        updateLink(index, {
            platform,
            label: defaultLabels[platform] || (platform === "other" ? "" : platformLabels[platform]),
        });
    };

    const addLink = () => {
        if (links.length >= 12) {
            showToast({ title: "អាចបន្ថែមបានអតិបរមា ១២ តំណភ្ជាប់", type: "error" });
            return;
        }
        setLinks((current) => [...current, { platform: "other", label: "", url: "" }]);
    };

    const save = async () => {
        const normalizedLinks = links.map((link) => ({
            ...link,
            label: link.label.trim(),
            url: link.url.trim(),
        }));
        if (!normalizedLinks.every(isValidLink)) {
            showToast({
                title: "សូមពិនិត្យព័ត៌មាន Social Media",
                description: "ត្រូវបញ្ចូលឈ្មោះ និងតំណភ្ជាប់ HTTP(S) ត្រឹមត្រូវគ្រប់ជួរ។",
                type: "error",
            });
            return;
        }

        setSaving(true);
        const response = await moneaClient.patch<{ links: unknown }>(
            "/api/admin/master/social-links",
            { links: normalizedLinks },
        );
        setSaving(false);
        if (response.error) {
            showToast({ title: "រក្សាទុកមិនបាន", description: response.error, type: "error" });
            return;
        }
        if (!response.data || !isSocialLinks(response.data.links)) {
            console.error("[Admin Social Links] Save response was invalid");
            showToast({ title: "ចម្លើយពីម៉ាស៊ីនមេមិនត្រឹមត្រូវ", type: "error" });
            return;
        }

        setLinks(response.data.links);
        showToast({ title: "បានរក្សាទុក Social Media ដោយជោគជ័យ", type: "success" });
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 font-kantumruy">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" aria-label="ត្រឡប់ទៅ Admin">
                        <Link to="/admin/master"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">គ្រប់គ្រង Social Media</h1>
                        <p className="text-sm text-muted-foreground">
                            កែ ឬបន្ថែមតំណភ្ជាប់បណ្តាញសង្គមដែលបង្ហាញនៅផ្នែកខាងក្រោមគេហទំព័រ។
                        </p>
                    </div>
                </div>
                <Button onClick={() => void save()} disabled={loading || loadError || saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    រក្សាទុក
                </Button>
            </div>

            {loading ? (
                <div className="flex min-h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : loadError ? (
                <p role="alert" className="py-12 text-center text-sm text-destructive">
                    មិនអាចទាញយកទិន្នន័យបានទេ។ សូមផ្ទុកទំព័រឡើងវិញ មុនពេលកែប្រែ។
                </p>
            ) : (
                <Card>
                    <CardContent className="space-y-4 p-4 sm:p-6">
                        {links.length === 0 && (
                            <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                                មិនទាន់មាន Social Media link ទេ។ បន្ថែមតំណភ្ជាប់ដើម្បីបង្ហាញនៅ Footer។
                            </p>
                        )}
                        {links.map((link, index) => (
                            <div key={index} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[150px_1fr_2fr_auto] sm:items-end">
                                <label className="space-y-2 text-sm font-medium">
                                    <span>បណ្តាញ</span>
                                    <select
                                        value={link.platform}
                                        onChange={(event) => updatePlatform(index, event.target.value as SocialPlatform)}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3"
                                    >
                                        {SOCIAL_PLATFORMS.map((platform) => (
                                            <option key={platform} value={platform}>{platformLabels[platform]}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-2 text-sm font-medium">
                                    <span>ឈ្មោះបង្ហាញ</span>
                                    <input
                                        value={link.label}
                                        onChange={(event) => updateLink(index, { label: event.target.value })}
                                        maxLength={50}
                                        placeholder="ឧ. Telegram"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3"
                                    />
                                </label>
                                <label className="space-y-2 text-sm font-medium">
                                    <span>តំណភ្ជាប់</span>
                                    <input
                                        type="url"
                                        value={link.url}
                                        onChange={(event) => updateLink(index, { url: event.target.value })}
                                        maxLength={2048}
                                        placeholder="https://..."
                                        className="h-10 w-full rounded-md border border-input bg-background px-3"
                                    />
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label={`លុប ${link.label || "Social Media"}`}
                                    onClick={() => setLinks((current) => current.filter((_, linkIndex) => linkIndex !== index))}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addLink} disabled={links.length >= 12}>
                            <Plus className="mr-2 h-4 w-4" /> បន្ថែម Social Media
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
