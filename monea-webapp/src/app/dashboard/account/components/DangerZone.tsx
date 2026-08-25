import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DangerZoneProps {
    onShowDeleteAccount: () => void;
}

export function DangerZone({ onShowDeleteAccount }: DangerZoneProps) {
    const { t } = useTranslation();

    return (
        <Card className="border border-rose-200 dark:border-rose-500/20 bg-rose-500/[0.02] rounded-3xl overflow-hidden font-kantumruy mt-6">
            <CardHeader className="p-6 sm:p-8 pb-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider uppercase mb-2 w-fit">
                    <AlertTriangle size={13} /> 
                    <span>{t("account.dangerZone.badge", { defaultValue: "តំបន់ប្រុងប្រយ័ត្ន" })}</span>
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-kantumruy tracking-tight">
                    {t("account.dangerZone.title", { defaultValue: "លុបគណនីរបស់អ្នក" })}
                </CardTitle>
                <CardDescription className="font-kantumruy text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {t("account.dangerZone.description", { defaultValue: "នៅពេលដែលអ្នកលុបគណនី ទិន្នន័យពិធីមង្គលការ និងភ្ញៀវទាំងអស់នឹងត្រូវលុបជាអចិន្ត្រៃយ៍។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-2">
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
            </CardContent>
        </Card>
    );
}
