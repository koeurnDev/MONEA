import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/i18n/LanguageProvider";

export function PreferencesTab() {
    const { t, locale, setLocale } = useTranslation();

    return (
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden font-kantumruy">
            <CardHeader className="p-6 sm:p-8 pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-kantumruy tracking-tight">
                    {t("account.preferences.title", { defaultValue: "ចំណូលចិត្ត" })}
                </CardTitle>
                <CardDescription className="font-kantumruy text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {t("account.preferences.description", { defaultValue: "កំណត់ភាសានិងជម្រើសផ្ទាល់ខ្លួនសម្រាប់គណនីរបស់អ្នក។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 sm:p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
                            <Languages size={24} />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm sm:text-base font-bold font-kantumruy tracking-tight text-foreground">
                                {t("account.preferences.language.title", { defaultValue: "ភាសាកម្មវិធី (Application Language)" })}
                            </p>
                            <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">
                                {t("account.preferences.language.description", { defaultValue: "ជ្រើសរើសភាសាដែលត្រូវបង្ហាញលើផ្ទៃផ្ទាំងគ្រប់គ្រង" })}
                            </p>
                        </div>
                    </div>
                    <div className="w-full sm:w-[180px] shrink-0">
                        <Select value={locale} onValueChange={(val: any) => setLocale(val)}>
                            <SelectTrigger className="h-11 bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/10 rounded-xl font-bold font-kantumruy text-xs shadow-sm">
                                <SelectValue placeholder="ជ្រើសរើសភាសា" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 shadow-xl p-1 font-kantumruy">
                                <SelectItem value="km" className="rounded-lg py-2.5 font-bold font-kantumruy text-xs cursor-pointer">
                                    🇰🇭 {t("account.preferences.language.km", { defaultValue: "ភាសាខ្មែរ (Khmer)" })}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
