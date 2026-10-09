import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Languages } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

export function PreferencesTab() {
    const { t, locale } = useTranslation();

    return (
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden font-kantumruy">
            <CardHeader className="p-6 sm:p-8 pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-kantumruy tracking-tight">
                    {t("account.preferences.title", { defaultValue: "ចំណូលចិត្ត" })}
                </CardTitle>
                <CardDescription className="font-kantumruy text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {t("account.preferences.description", { defaultValue: "កំណត់ភាសានិងជម្រើសផ្ទាល់ខ្លួនសម្រាប់គណនីរបស់អ្នក។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 sm:p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-600 dark:text-teal-400 shrink-0">
                            <Languages size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm sm:text-base font-bold font-kantumruy tracking-tight text-foreground">
                                {t("account.preferences.language.title", { defaultValue: "ភាសាកម្មវិធី (Application Language)" })}
                            </p>
                            <p className="text-xs leading-relaxed text-muted-foreground font-kantumruy">
                                {locale === "km"
                                    ? "បច្ចុប្បន្ន កម្មវិធីគាំទ្រតែភាសាខ្មែរប៉ុណ្ណោះ។"
                                    : "Khmer is currently the only supported language."}
                            </p>
                        </div>
                    </div>
                    <div className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-foreground dark:border-white/10 dark:bg-zinc-800 sm:w-[180px]">
                        🇰🇭 {t("account.preferences.language.km", { defaultValue: "ភាសាខ្មែរ (Khmer)" })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
