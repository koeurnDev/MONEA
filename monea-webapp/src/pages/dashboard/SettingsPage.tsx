import { useTranslation } from "@/i18n/LanguageProvider";

export default function SettingsPage() {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-kantumruy">
                    {t("settings.title") || "Settings"}
                </h2>
                <p className="text-muted-foreground font-kantumruy">
                    {t("settings.subtitle") || "Manage your account and wedding settings."}
                </p>
            </div>
        </div>
    );
}
