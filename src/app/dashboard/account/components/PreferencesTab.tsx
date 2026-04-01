"use client";

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
        <Card className="bg-card/40 backdrop-blur-2xl border-none shadow-[0_8px_60px_rgba(0,0,0,0.06)] dark:shadow-none rounded-[3rem] overflow-hidden p-1">
            <CardHeader className="p-10 pb-6">
                <CardTitle className="text-2xl font-black text-foreground font-kantumruy tracking-tight">{t("account.preferences.title")}</CardTitle>
                <CardDescription className="font-kantumruy text-sm mt-1.5 opacity-60 leading-relaxed max-w-xl">
                    {t("account.preferences.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-10">
                <div className="flex items-center gap-6 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 transition-all hover:bg-primary/10 group">
                    <div className="p-5 bg-primary/10 rounded-3xl text-primary transform transition-transform group-hover:scale-110 duration-300">
                        <Languages size={32} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-lg font-black font-kantumruy tracking-tight text-foreground">{t("account.preferences.language.title")}</p>
                        <p className="text-xs text-muted-foreground font-kantumruy opacity-70 leading-relaxed">{t("account.preferences.language.description")}</p>
                    </div>
                    <div className="min-w-[180px]">
                        <Select value={locale} onValueChange={(val: any) => setLocale(val)}>
                            <SelectTrigger className="h-14 bg-background border-border/10 rounded-2xl font-black font-kantumruy shadow-sm transition-all hover:border-primary/30 focus:ring-primary/20">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/20 shadow-2xl dark:shadow-none p-1.5 backdrop-blur-3xl">
                                <SelectItem value="km" className="rounded-xl py-3 font-black font-kantumruy focus:bg-primary/5 cursor-pointer">
                                    {t("account.preferences.language.km")}
                                </SelectItem>
                                <SelectItem value="en" className="rounded-xl py-3 font-black font-kantumruy focus:bg-primary/5 cursor-pointer">
                                    {t("account.preferences.language.en")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
