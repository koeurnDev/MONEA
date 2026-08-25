import { useAccountSettings } from "./hooks/useAccountSettings";
import { ProfileTab } from "./components/ProfileTab";
import { SecurityTab } from "./components/SecurityTab";
import { ChangePasswordDialog } from "./components/ChangePasswordDialog";
import { Disable2FADialog } from "./components/Disable2FADialog";
import { DangerZone } from "./components/DangerZone";
import { DeleteAccountDialog } from "./components/DeleteAccountDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m, AnimatePresence } from 'framer-motion';
import { User, Shield, Settings2, UserCog } from "lucide-react";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { PreferencesTab } from "./components/PreferencesTab";
import { useTranslation } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/app/dashboard/_components/PageHeader";

export default function AccountSettingsPage() {
    const { t } = useTranslation();

    const {
        user,
        mutate,
        show2FASetup,
        setShow2FASetup,
        securityLogs,
        loadingLogs,
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

        // Account Deletion
        showDeleteAccount,
        setShowDeleteAccount,
        deletingAccount,
        deleteError,
        handleDeleteAccount
    } = useAccountSettings();

    return (
        <div className="max-w-5xl mx-auto py-6 md:py-10 px-4 sm:px-6 relative space-y-8">
            <TwoFactorSetup
                open={show2FASetup}
                onOpenChange={setShow2FASetup}
                onSuccess={() => mutate()}
            />

            {/* Page Header */}
            <PageHeader
                title={t("account.title", { defaultValue: "ការកំណត់គណនី" })}
                icon={UserCog}
                iconColor="text-rose-500"
            />

            {/* Main Tabs Layout */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="w-full">
                    <TabsList className="bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 h-auto p-1.5 rounded-2xl flex w-full justify-between shadow-sm">
                        <TabsTrigger 
                            value="profile" 
                            className="rounded-xl px-3 py-2.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-md transition-all gap-2 font-kantumruy group flex-1 focus-visible:ring-0"
                        >
                            <User size={16} className="shrink-0 group-data-[state=active]:text-rose-500" />
                            <span>{t("account.tabs.profile", { defaultValue: "ប្រវត្តិរូប" })}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="security" 
                            className="rounded-xl px-3 py-2.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-md transition-all gap-2 font-kantumruy group flex-1 focus-visible:ring-0"
                        >
                            <Shield size={16} className="shrink-0 group-data-[state=active]:text-rose-500" />
                            <span>{t("account.tabs.security", { defaultValue: "សុវត្ថិភាព" })}</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="preferences" 
                            className="rounded-xl px-3 py-2.5 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-md transition-all gap-2 font-kantumruy group flex-1 focus-visible:ring-0"
                        >
                            <Settings2 size={16} className="shrink-0 group-data-[state=active]:text-rose-500" />
                            <span>{t("account.tabs.preferences", { defaultValue: "ចំណូលចិត្ត" })}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <TabsContent key="profile" value="profile" className="mt-0 outline-none space-y-6" forceMount>
                            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                                <ProfileTab
                                    user={user}
                                    onShowChangePassword={() => setShowChangePassword(true)}
                                    onUpdateSuccess={() => mutate()}
                                />
                                <DangerZone 
                                    onShowDeleteAccount={() => setShowDeleteAccount(true)} 
                                />
                            </m.div>
                        </TabsContent>
                    )}

                    {activeTab === "security" && (
                        <TabsContent key="security" value="security" className="mt-0 outline-none" forceMount>
                            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                                <SecurityTab
                                    user={user}
                                    securityLogs={securityLogs}
                                    loadingLogs={loadingLogs}
                                    revoking={revoking}
                                    onFetchLogs={fetchLogs}
                                    onRevokeSessions={handleRevokeSessions}
                                    onShow2FASetup={() => setShow2FASetup(true)}
                                    onShowDisable2FA={() => setShowDisable2FA(true)}
                                />
                            </m.div>
                        </TabsContent>
                    )}

                    {activeTab === "preferences" && (
                        <TabsContent key="preferences" value="preferences" className="mt-0 outline-none" forceMount>
                            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                                <PreferencesTab />
                            </m.div>
                        </TabsContent>
                    )}
                </AnimatePresence>
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
