import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/i18n/LanguageProvider";

interface DeleteAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (password: string) => Promise<void>;
    isDeleting: boolean;
    error?: string;
}

export function DeleteAccountDialog({ 
    open, 
    onOpenChange, 
    onSubmit, 
    isDeleting, 
    error 
}: DeleteAccountDialogProps) {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(password);
        if (!error) setPassword("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[92vw] max-w-[440px] max-h-[90dvh] overflow-y-auto rounded-2xl md:rounded-[2.5rem] border-none shadow-2xl p-5 sm:p-6 md:p-10 font-kantumruy">
                <DialogHeader className="space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <Trash2 size={28} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center font-kantumruy">
                        {t("account.dialogs.deleteAccount.title", { defaultValue: "លុបគណនី" })}
                    </DialogTitle>
                    <DialogDescription className="text-center font-kantumruy text-sm opacity-70">
                        {t("account.dialogs.deleteAccount.description", { defaultValue: "គណនីនឹងត្រូវបិទភ្លាមៗ ហើយទិន្នន័យ រូបភាព និងអនុស្សាវរីយ៍នឹងត្រូវរក្សាទុក 30 ថ្ងៃ មុនលុបជាអចិន្ត្រៃយ៍។" })}
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="mt-2 rounded-2xl bg-destructive/5 py-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-bold font-kantumruy ml-2">
                        {t("account.dialogs.deleteAccount.alert", { defaultValue: "បន្ទាប់ពីបញ្ជាក់ គណនីនឹងមិនអាចចូលប្រើបាន។ អ្នកអាចទាក់ទងជំនួយក្នុងរយៈពេល 30 ថ្ងៃ ដើម្បីស្នើសុំស្តារគណនី និងអនុស្សាវរីយ៍វិញ។" })}
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-5 sm:mt-6">
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">
                            {t("account.dialogs.deleteAccount.label", { defaultValue: "បញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក" })}
                        </Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 rounded-2xl border-none bg-muted/40 px-4 font-bold focus-visible:ring-2 focus-visible:ring-destructive/30 sm:h-14 sm:px-5"
                                placeholder={t("account.dialogs.deleteAccount.placeholder", { defaultValue: "បញ្ចូលពាក្យសម្ងាត់របស់អ្នកដើម្បីបញ្ជាក់" })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {error && (
                            <p className="ml-1 font-kantumruy text-xs font-bold text-destructive">{error}</p>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-3 mt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11 sm:h-12 rounded-2xl font-bold font-kantumruy"
                        >
                            {t("account.dialogs.deleteAccount.cancel", { defaultValue: "បោះបង់" })}
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={isDeleting || !password}
                            className="h-11 flex-[1.5] rounded-2xl font-black font-kantumruy sm:h-12"
                        >
                            {isDeleting 
                                ? t("account.dialogs.deleteAccount.processing", { defaultValue: "កំពុងលុប..." }) 
                                : t("account.dialogs.deleteAccount.submit", { defaultValue: "លុបគណនីរបស់ខ្ញុំ" })}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
