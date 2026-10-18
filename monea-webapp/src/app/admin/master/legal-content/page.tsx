import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import km from "@/i18n/km.json";
import en from "@/i18n/en.json";
import { moneaClient } from "@/lib/api-client";
import { createLegalDocument, isLegalContent, type LegalContent } from "@/lib/legal-content";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialLegalContent: LegalContent = {
    privacy: {
        km: createLegalDocument(km.common.privacy),
        en: createLegalDocument(en.common.privacy),
    },
    terms: {
        km: createLegalDocument(km.common.terms),
        en: createLegalDocument(en.common.terms),
    },
};

type DocumentKey = keyof LegalContent;
type LocaleKey = "km" | "en";

export default function LegalContentAdminPage() {
    const [content, setContent] = useState<LegalContent>(initialLegalContent);
    const [activeDocument, setActiveDocument] = useState<DocumentKey>("privacy");
    const [activeLocale, setActiveLocale] = useState<LocaleKey>("km");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const response = await moneaClient.get<{ content: unknown }>("/api/admin/master/legal-content", { cache: "no-store" });
            if (cancelled) return;
            const payload = response.data;
            if (response.error) {
                console.error("[Admin Legal Content] Failed to load:", response.error);
                setLoadError(true);
                showToast({ title: "មិនអាចទាញយកខ្លឹមសារបាន", description: response.error, type: "error" });
            } else if (payload?.content !== null && payload?.content !== undefined) {
                const loadedContent = payload.content;
                if (isLegalContent(loadedContent)) {
                    setContent(loadedContent);
                } else {
                    setLoadError(true);
                    console.error("[Admin Legal Content] Invalid content response");
                    showToast({ title: "ទម្រង់ខ្លឹមសារមិនត្រឹមត្រូវ", type: "error" });
                }
            }
            setLoading(false);
        };
        void load();
        return () => { cancelled = true; };
        // The initial server load must not rerun on every edit, or it would overwrite the user's draft.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showToast]);

    const updateDocument = (field: "title" | "lastUpdated" | "body", value: string) => {
        setContent((current) => ({
            ...current,
            [activeDocument]: {
                ...current[activeDocument],
                [activeLocale]: {
                    ...current[activeDocument][activeLocale],
                    [field]: value,
                },
            },
        }));
    };

    const save = async () => {
        setSaving(true);
        const response = await moneaClient.patch<{ content: unknown }>("/api/admin/master/legal-content", content);
        setSaving(false);
        if (response.error) {
            showToast({ title: "បរាជ័យក្នុងការរក្សាទុក", description: response.error, type: "error" });
            return;
        }
        if (!response.data || !isLegalContent(response.data.content)) {
            console.error("[Admin Legal Content] Save response was invalid");
            showToast({ title: "ទម្រង់ចម្លើយមិនត្រឹមត្រូវ", type: "error" });
            return;
        }
        setContent(response.data.content);
        showToast({ title: "បានរក្សាទុកខ្លឹមសារដោយជោគជ័យ", type: "success" });
    };

    const document = content[activeDocument][activeLocale];
    const documentLabels: Record<DocumentKey, string> = {
        privacy: "គោលការណ៍ឯកជនភាព",
        terms: "លក្ខខណ្ឌប្រើប្រាស់",
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 pb-12 font-kantumruy">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" aria-label="ត្រឡប់ទៅ Admin">
                        <Link to="/admin/master"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">កែខ្លឹមសារគេហទំព័រ</h1>
                        <p className="text-sm text-muted-foreground">Privacy Policy និង Terms of Use ជាភាសាខ្មែរ និងអង់គ្លេស</p>
                    </div>
                </div>
                <Button onClick={() => void save()} disabled={loading || loadError || saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    រក្សាទុក
                </Button>
            </div>

            <Card>
                <CardContent className="space-y-6 p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                        {(Object.keys(documentLabels) as DocumentKey[]).map((key) => (
                            <Button key={key} variant={activeDocument === key ? "default" : "outline"} onClick={() => setActiveDocument(key)}>
                                <FileText className="mr-2 h-4 w-4" />{documentLabels[key]}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-2 border-b">
                        {(["km", "en"] as const).map((locale) => (
                            <button
                                key={locale}
                                type="button"
                                onClick={() => setActiveLocale(locale)}
                                className={`border-b-2 px-4 py-2 text-sm font-medium ${activeLocale === locale ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                            >
                                {locale === "km" ? "ភាសាខ្មែរ" : "English"}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex min-h-56 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : loadError ? (
                        <p role="alert" className="py-12 text-center text-sm text-destructive">
                            មិនអាចទាញយកទិន្នន័យបានទេ។ សូមផ្ទុកទំព័រឡើងវិញ មុនពេលកែប្រែ។
                        </p>
                    ) : (
                        <div className="space-y-5">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">ចំណងជើង</span>
                                <input
                                    value={document.title}
                                    onChange={(event) => updateDocument("title", event.target.value)}
                                    maxLength={160}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">កាលបរិច្ឆេទធ្វើបច្ចុប្បន្នភាព</span>
                                <input
                                    value={document.lastUpdated}
                                    onChange={(event) => updateDocument("lastUpdated", event.target.value)}
                                    maxLength={120}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">ខ្លឹមសារ</span>
                                <textarea
                                    value={document.body}
                                    onChange={(event) => updateDocument("body", event.target.value)}
                                    maxLength={100_000}
                                    rows={20}
                                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-7"
                                    placeholder={"ប្រើ ## សម្រាប់ចំណងជើងផ្នែក និង - សម្រាប់បញ្ជី\n\nឧទាហរណ៍៖\n## ការប្រមូលទិន្នន័យ\nយើងប្រមូលព័ត៌មានដែលចាំបាច់សម្រាប់សេវាកម្ម។\n\n- ព័ត៌មានគណនី\n- ព័ត៌មានកម្មវិធី"}
                                />
                                <span className="text-xs text-muted-foreground">អនុញ្ញាតតែអត្ថបទធម្មតា; `##` សម្រាប់ចំណងជើង និង `-` សម្រាប់បញ្ជី។</span>
                            </label>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
