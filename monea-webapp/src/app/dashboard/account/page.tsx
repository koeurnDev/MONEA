import { useAccountSettings } from "./hooks/useAccountSettings";
import { ProfileTab } from "./components/ProfileTab";
import { SecurityTab } from "./components/SecurityTab";
import { ChangePasswordDialog } from "./components/ChangePasswordDialog";
import { Disable2FADialog } from "./components/Disable2FADialog";
import { DangerZone } from "./components/DangerZone";
import { DeleteAccountDialog } from "./components/DeleteAccountDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, UserCog } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { useTranslation } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";
import { PreferencesTab } from "./components/PreferencesTab";

export default function AccountSettingsPage() {
    const { t } = useTranslation();

    const {
        user,
        mutate,
        show2FASetup,
        setShow2FASetup,
        securityLogs,
        loadingLogs,
        securityLogsError,
        fetchLogs,
        revoking,
        handleRevokeSessions,
        activeTab,
        setActiveTab,

        // Password
        showChangePassword,
        setShowChangePassword,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        showPasswords,
        setShowPasswords,
        changingPassword,
        pwError,
        handleChangePassword,

        // 2FA Disable
        showDisable2FA,
        setShowDisable2FA,
        disablePassword,
        setDisablePassword,
        disabling2FA,
        disableError,
        handleDisable2FA,
        showDeleteAccount,
        setShowDeleteAccount,
        deletingAccount,
        deleteError,
        handleDeleteAccount
    } = useAccountSettings();

    return (
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 md:py-10 relative space-y-5 sm:space-y-7">
            <TwoFactorSetup
                open={show2FASetup}
                onOpenChange={setShow2FASetup}
                onSuccess={() => mutate()}
            />

            {/* Page Header */}
            <PageHeader
                title={t("account.title", { defaultValue: "គណនី និងប្រវត្តិរូប" })}
                icon={UserCog}
                iconColor="text-teal-500"
                action={
                    <Link
                        to="/dashboard"
                        aria-label="ត្រឡប់ទៅ Dashboard"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                }
            />

            {/* Main Tabs Layout */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                <div className="w-full">
                    <TabsList className="h-auto w-full justify-between gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 shadow-sm dark:border-white/10 dark:bg-[#181d22]">
                        <TabsTrigger 
                            value="profile" 
                            className="group flex min-h-12 flex-1 gap-2 rounded-xl px-3 py-2 font-kantumruy text-sm font-bold text-muted-foreground transition-all focus-visible:ring-0 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2b1f22] dark:data-[state=active]:text-teal-400 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                            <User size={14} className="shrink-0 group-data-[state=active]:text-teal-400" />
                            <span>{t("account.tabs.profile", { defaultValue: "គណនី" })}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="security" 
                            className="group flex min-h-12 flex-1 gap-2 rounded-xl px-3 py-2 font-kantumruy text-sm font-bold text-muted-foreground transition-all focus-visible:ring-0 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#2b1f22] dark:data-[state=active]:text-teal-400 sm:px-4 sm:py-2.5 sm:text-sm"
                        >
                            <Shield size={14} className="shrink-0 group-data-[state=active]:text-teal-400" />
                            <span>{t("account.tabs.security", { defaultValue: "សុវត្ថិភាព" })}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div>
                    {activeTab === "profile" && (
                        <TabsContent key="profile" value="profile" className="mt-0 outline-none space-y-6" forceMount>
                            <div>
                                <ProfileTab
                                    user={user}
                                    onShowChangePassword={() => setShowChangePassword(true)}
                                    onUpdateSuccess={() => mutate()}
                                />
                                <PreferencesTab />
                            </div>
                        </TabsContent>
                    )}

                    {activeTab === "security" && (
                        <TabsContent key="security" value="security" className="mt-0 outline-none" forceMount>
                            <div>
                                <SecurityTab
                                    user={user}
                                    securityLogs={securityLogs}
                                    loadingLogs={loadingLogs}
                                    securityLogsError={securityLogsError}
                                    revoking={revoking}
                                    onFetchLogs={fetchLogs}
                                    onRevokeSessions={handleRevokeSessions}
                                    onShow2FASetup={() => setShow2FASetup(true)}
                                    onShowDisable2FA={() => setShowDisable2FA(true)}
                                />
                                <DangerZone onShowDeleteAccount={() => setShowDeleteAccount(true)} />
                            </div>
                        </TabsContent>
                    )}

                </div>
            </Tabs>

            {/* Dialogs */}
            <ChangePasswordDialog
                open={showChangePassword}
                onOpenChange={setShowChangePassword}
                onSubmit={handleChangePassword}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPasswords={showPasswords}
                setShowPasswords={setShowPasswords}
                changingPassword={changingPassword}
                pwError={pwError}
            />

            <Disable2FADialog
                open={showDisable2FA}
                onOpenChange={setShowDisable2FA}
                onSubmit={handleDisable2FA}
                disablePassword={disablePassword}
                setDisablePassword={setDisablePassword}
                disabling2FA={disabling2FA}
                disableError={disableError}
            />

            <DeleteAccountDialog
                open={showDeleteAccount}
                onOpenChange={setShowDeleteAccount}
                onSubmit={handleDeleteAccount}
                isDeleting={deletingAccount}
                error={deleteError}
            />

        </div>
    );
}
