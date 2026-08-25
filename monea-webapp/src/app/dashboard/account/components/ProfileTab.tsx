import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, KeyRound, Phone, User as UserIcon, Loader2, ShieldCheck, Check, AlertCircle, Copy, Fingerprint } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";

interface ProfileTabProps {
    user: any;
    onShowChangePassword: () => void;
    onUpdateSuccess?: () => void;
}

export function ProfileTab({ user, onShowChangePassword, onUpdateSuccess }: ProfileTabProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleCopyId = () => {
        if (!user?.id) return;
        navigator.clipboard.writeText(user.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleSave = async () => {
        setLoading(true);
        setStatusMessage(null);
        try {
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone })
            });
            if (res.ok) {
                setStatusMessage({ type: 'success', text: t("account.profile.saved", { defaultValue: "បានរក្សាទុកព័ត៌មានដោយជោគជ័យ!" }) });
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                }
                setTimeout(() => setStatusMessage(null), 3000);
            } else {
                setStatusMessage({ type: 'error', text: t("common.errors.general", { defaultValue: "មានបញ្ហាក្នុងការរក្សាទុក សូមព្យាយាមម្តងទៀត" }) });
            }
        } catch (error) {
            console.error("Error updating profile", error);
            setStatusMessage({ type: 'error', text: t("common.errors.network", { defaultValue: "មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ" }) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden font-kantumruy">
            <CardHeader className="p-6 sm:p-8 pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-kantumruy tracking-tight">
                    {t("account.profile.title", { defaultValue: "ព័ត៌មានផ្ទាល់ខ្លួន" })}
                </CardTitle>
                <CardDescription className="font-kantumruy text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {t("account.profile.description", { defaultValue: "ធ្វើបច្ចុប្បន្នភាពឈ្មោះ និងលេខទូរស័ព្ទសម្រាប់គណនីរបស់អ្នក។" })}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 pt-2 space-y-6">
                {statusMessage && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold font-kantumruy ${
                        statusMessage.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                        {statusMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">
                            {t("account.profile.labels.username", { defaultValue: "ឈ្មោះពេញ" })}
                        </Label>
                        <div className="relative">
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ឈ្មោះរបស់អ្នក"
                                className="h-12 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl px-4 pl-11 font-medium text-foreground font-kantumruy focus-visible:ring-rose-500"
                            />
                            <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">
                            {t("account.profile.labels.phone", { defaultValue: "លេខទូរស័ព្ទ" })}
                        </Label>
                        <div className="relative">
                            <Input 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="012 345 678"
                                className="h-12 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-2xl px-4 pl-11 font-medium text-foreground font-kantumruy focus-visible:ring-rose-500"
                            />
                            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground shrink-0" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">
                            {t("account.profile.labels.email", { defaultValue: "អ៊ីមែល" })}
                        </Label>
                        <div className="h-12 bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 rounded-2xl px-4 flex items-center font-medium text-muted-foreground gap-3 select-all cursor-not-allowed">
                            <Mail size={18} className="text-muted-foreground shrink-0" />
                            <span className="truncate text-sm">{user?.email || "..."}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">
                            {t("account.profile.labels.role", { defaultValue: "តួនាទី" })}
                        </Label>
                        <div className="h-12 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 flex items-center font-bold text-rose-600 dark:text-rose-400 gap-3">
                            <ShieldCheck size={18} className="shrink-0" />
                            <span className="truncate text-sm uppercase">{user?.role || "USER"}</span>
                        </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">
                            លេខសម្គាល់គណនី (User ID)
                        </Label>
                        <div className="h-12 bg-slate-100/80 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 rounded-2xl px-4 flex items-center justify-between font-mono text-xs text-foreground shadow-xs">
                            <div className="flex items-center gap-2.5 truncate">
                                <Fingerprint size={18} className="text-rose-500 shrink-0" />
                                <span className="truncate font-bold tracking-tight text-slate-800 dark:text-slate-200">{user?.id || "..."}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyId}
                                className="px-3 py-1.5 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-foreground transition-all shrink-0 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
                                title="ចុចដើម្បីចម្លង User ID"
                            >
                                {copiedId ? (
                                    <>
                                        <Check size={13} className="text-emerald-500" />
                                        <span className="text-emerald-600 dark:text-emerald-400">បានចម្លង</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={13} className="text-slate-400" />
                                        <span>ចម្លង</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-start pt-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="rounded-2xl font-bold font-kantumruy text-xs uppercase tracking-wider px-8 h-11 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>{t("common.loading.saving", { defaultValue: "កំពុងរក្សាទុក..." })}</span>
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                <span>{t("common.save", { defaultValue: "រក្សាទុកការកែប្រែ" })}</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="pt-6 border-t border-slate-200/80 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/80 dark:border-white/10 text-center sm:text-left">
                        <div className="flex items-center gap-4 mx-auto sm:mx-0">
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 dark:text-rose-400">
                                <KeyRound size={22} />
                            </div>
                            <div className="space-y-0.5 text-left">
                                <p className="text-sm font-bold text-foreground font-kantumruy">{t("account.profile.changePassword.title", { defaultValue: "ផ្លាស់ប្តូរពាក្យសម្ងាត់" })}</p>
                                <p className="text-xs text-muted-foreground font-kantumruy leading-relaxed">{t("account.profile.changePassword.description", { defaultValue: "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់ដើម្បីបង្កើនសុវត្ថិភាពគណនី។" })}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl font-bold font-kantumruy text-xs px-5 h-10 border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800 text-foreground transition-all active:scale-95 w-full sm:w-auto shrink-0"
                            onClick={onShowChangePassword}
                        >
                            {t("account.profile.changePassword.button", { defaultValue: "ផ្លាស់ប្តូរ" })}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
