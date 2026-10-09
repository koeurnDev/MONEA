import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, ChevronDown } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useState } from "react";

interface DangerZoneProps {
    onShowDeleteAccount: () => void;
}

export function DangerZone({ onShowDeleteAccount }: DangerZoneProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="mt-6 overflow-hidden rounded-3xl border border-rose-200 bg-rose-500/[0.02] font-kantumruy dark:border-rose-500/20">
            <CardHeader className="p-4 sm:p-6">
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="flex min-h-11 w-full items-center justify-between rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                >
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-2 w-fit">
                    <AlertTriangle size={13} /> 
                    <span>{t("account.dangerZone.badge", { defaultValue: "តំបន់ប្រុងប្រយ័ត្ន" })}</span>
                </div>
                    <ChevronDown className={`h-4 w-4 text-rose-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && <CardDescription className="mt-2 font-kantumruy text-xs leading-relaxed text-muted-foreground">
                    {t("account.dangerZone.description", { defaultValue: "នៅពេលដែលអ្នកលុបគណនី ទិន្នន័យពិធីមង្គលការ និងភ្ញៀវទាំងអស់នឹងត្រូវលុបជាអចិន្ត្រៃយ៍។" })}
                </CardDescription>}
            </CardHeader>
            {expanded && <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-rose-200/80 dark:border-rose-500/20 shadow-sm">
                    <div className="space-y-1">
                        <p className="text-sm sm:text-base font-bold font-kantumruy text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <Trash2 size={18} /> 
                            <span>{t("account.dangerZone.deleteTitle", { defaultValue: "លុបគណនីជាស្ថាពរ" })}</span>
                        </p>
                        <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed max-w-md">
                            {t("account.dangerZone.deleteDescription", { defaultValue: "សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ សូមប្រាកដថាអ្នកពិតជាចង់លុប។" })}
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onShowDeleteAccount}
                        className="rounded-xl font-bold font-kantumruy text-xs px-6 h-11 bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all active:scale-95 shrink-0 w-full sm:w-auto"
                    >
                        {t("account.dangerZone.button", { defaultValue: "លុបគណនី" })}
                    </Button>
                </div>
            </CardContent>}
        </Card>
    );
}
