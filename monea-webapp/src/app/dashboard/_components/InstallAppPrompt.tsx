import * as React from "react";
import { Download, X } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";

interface InstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppPrompt() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [installEvent, setInstallEvent] = React.useState<InstallPromptEvent | null>(null);
    const [visible, setVisible] = React.useState(false);
    const [isInstalling, setIsInstalling] = React.useState(false);

    React.useEffect(() => {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        if (isStandalone) return;
        try {
            if (localStorage.getItem("monea-install-dismissed") === "true") return;
        } catch (error) {
            console.warn("[InstallAppPrompt] Could not read dismissal preference:", error);
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallEvent(event as InstallPromptEvent);
            setVisible(true);
        };
        const handleAppInstalled = () => {
            setVisible(false);
            setInstallEvent(null);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const dismiss = () => {
        try {
            localStorage.setItem("monea-install-dismissed", "true");
        } catch (error) {
            console.warn("[InstallAppPrompt] Could not save dismissal preference:", error);
        }
        setVisible(false);
    };

    const install = async () => {
        if (!installEvent || isInstalling) return;
        setIsInstalling(true);
        try {
            await installEvent.prompt();
            const result = await installEvent.userChoice;
            setVisible(false);
            if (result.outcome === "accepted") {
                setInstallEvent(null);
            }
        } catch (error) {
            console.error("[InstallAppPrompt] Failed to launch app installation:", error);
            setVisible(false);
            showToast({
                title: t("dashboard.installPrompt.errorTitle", { defaultValue: "Could not start installation" }),
                description: t("dashboard.installPrompt.errorDescription", {
                    defaultValue: "Please try again later or use your browser's install option."
                }),
                type: "error"
            });
        } finally {
            setIsInstalling(false);
        }
    };

    if (!visible || !installEvent) return null;

    return (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-teal-500/20 bg-teal-500/[0.08] p-3 shadow-sm sm:flex-nowrap">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white">
                <Download aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="min-w-[calc(100%-3rem)] flex-1 font-kantumruy sm:min-w-0">
                <p className="text-xs font-black text-foreground">
                    {t("dashboard.installPrompt.title", { defaultValue: "Install MONEA as an app" })}
                </p>
                <p className="text-[11px] text-muted-foreground">
                    {t("dashboard.installPrompt.description", { defaultValue: "Open MONEA faster and use it easily on your phone." })}
                </p>
            </div>
            <button
                type="button"
                onClick={install}
                disabled={isInstalling}
                className="min-h-11 shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
                {isInstalling
                    ? t("dashboard.installPrompt.installing", { defaultValue: "Opening..." })
                    : t("dashboard.installPrompt.install", { defaultValue: "Install" })}
            </button>
            <button
                type="button"
                onClick={dismiss}
                aria-label={t("dashboard.installPrompt.dismiss", { defaultValue: "Dismiss install prompt" })}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none transition hover:bg-teal-500/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-500/60"
            >
                <X aria-hidden="true" className="h-4 w-4" />
            </button>
        </div>
    );
}
