"use client";

import { useAccountSettings } from "./hooks/useAccountSettings";
import { ProfileTab } from "./components/ProfileTab";
import { SecurityTab } from "./components/SecurityTab";
import { ChangePasswordDialog } from "./components/ChangePasswordDialog";
import { Disable2FADialog } from "./components/Disable2FADialog";
import { DangerZone } from "./components/DangerZone";
import { DeleteAccountDialog } from "./components/DeleteAccountDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m, AnimatePresence } from 'framer-motion';
import { User, Shield, Settings2 } from "lucide-react";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { PreferencesTab } from "./components/PreferencesTab";
import { useTranslation } from "@/i18n/LanguageProvider";

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
        <div className="max-w-6xl mx-auto py-12 px-6 relative">
            <TwoFactorSetup
                open={show2FASetup}
                onOpenChange={setShow2FASetup}
                onSuccess={() => mutate()}
            />

            {/* Background Glows */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-50" />

            {/* Header section */}
            <m.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-14 text-center md:text-left"
            >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-6 shadow-sm">
                    <User size={16} /> {t("account.badge")}
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight font-kantumruy uppercase mb-5 leading-[1.1]">
                    {t("account.title")}
                </h1>
                <p className="text-lg text-muted-foreground font-medium font-kantumruy max-w-3xl leading-relaxed">
                    {t("account.subtitle")}
                </p>
            </m.div>

            {/* Main Tabs Layout */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                <TabsList className="bg-muted/30 backdrop-blur-md border border-border/10 h-auto p-1.5 rounded-[2rem] inline-flex shadow-sm mb-4">
                    <TabsTrigger value="profile" className="rounded-[1.5rem] px-8 py-4 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all gap-3 font-kantumruy group">
                        <User size={18} className="group-data-[state=active]:text-primary transition-colors" /> {t("account.tabs.profile")}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-[1.5rem] px-8 py-4 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all gap-3 font-kantumruy group">
                        <Shield size={18} className="group-data-[state=active]:text-red-500 transition-colors" /> {t("account.tabs.security")}
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-[1.5rem] px-8 py-4 font-bold text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all gap-3 font-kantumruy group">
                        <Settings2 size={18} className="group-data-[state=active]:text-primary transition-colors" /> {t("account.tabs.preferences")}
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <TabsContent key="profile" value="profile" className="mt-0 outline-none">
                            <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                <ProfileTab
                                    user={user}
                                    onShowChangePassword={() => setShowChangePassword(true)}
                                />
                            </m.div>
                        </TabsContent>
                    )}

                    {activeTab === "security" && (
                        <TabsContent key="security" value="security" className="mt-0 outline-none">
                            <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
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
                        <TabsContent key="preferences" value="preferences" className="mt-0 outline-none">
                            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                <PreferencesTab />
                            </m.div>
                        </TabsContent>
                    )}
                </AnimatePresence>
            </Tabs>

            {/* Danger Zone */}
            <DangerZone 
                onShowDeleteAccount={() => setShowDeleteAccount(true)} 
            />

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
