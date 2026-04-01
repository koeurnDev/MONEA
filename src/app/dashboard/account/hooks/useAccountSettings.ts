"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { useTranslation } from "@/i18n/LanguageProvider";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

export function useAccountSettings() {
    const { data: user, mutate, error } = useSWR("/api/auth/me", fetcher);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [revoking, setRevoking] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");

    // Change Password States
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [pwError, setPwError] = useState("");

    // 2FA Disable state
    const [showDisable2FA, setShowDisable2FA] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disabling2FA, setDisabling2FA] = useState(false);
    const [disableError, setDisableError] = useState("");

    // Account Deletion state
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        if (error?.status === 401) {
            fetch("/api/auth/logout", { method: "POST" }).finally(() => {
                window.location.href = "/sign-in";
            });
        }
    }, [error]);

    const fetchLogs = useCallback(async () => {
        setLoadingLogs(true);
        try {
            const res = await fetch("/api/admin/security/logs");
            if (res.status === 401) return;
            if (!res.ok) throw new Error("Failed to fetch logs");
            const data = await res.json();
            if (Array.isArray(data)) setSecurityLogs(data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "security") {
            fetchLogs();
        }
    }, [activeTab, fetchLogs]);

    const { t } = useTranslation();

    const handleRevokeSessions = async () => {
        if (!confirm(t("account.security.sessions.confirm"))) return;
        setRevoking(true);
        try {
            const res = await fetch("/api/admin/security/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "SELF" })
            });
            const data = await res.json();
            if (data.success) {
                alert(t("account.security.sessions.success"));
                window.location.href = "/sign-in";
            }
        } catch (err) {
            alert(t("account.security.sessions.error"));
        } finally {
            setRevoking(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");

        if (newPassword !== confirmPassword) {
            setPwError(t("account.dialogs.changePassword.errors.mismatch"));
            return;
        }

        if (newPassword.length < 8) {
            setPwError(t("account.dialogs.changePassword.errors.length"));
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t("account.dialogs.changePassword.success"));
                window.location.href = "/sign-in";
            } else {
                setPwError(data.error || t("account.dialogs.changePassword.errors.general"));
            }
        } catch (err) {
            setPwError(t("account.dialogs.changePassword.errors.tech"));
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setDisableError("");
        setDisabling2FA(true);
        try {
            const res = await fetch("/api/auth/2fa/disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: disablePassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t("account.dialogs.disable2fa.success"));
                setShowDisable2FA(false);
                setDisablePassword("");
                mutate();
            } else {
                setDisableError(data.error || t("account.dialogs.disable2fa.errors.general"));
            }
        } catch (err) {
            setDisableError(t("account.dialogs.disable2fa.errors.tech"));
        } finally {
            setDisabling2FA(false);
        }
    };

    const handleDeleteAccount = async (password: string) => {
        setDeleteError("");
        setDeletingAccount(true);
        try {
            const res = await fetch("/api/user/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok) {
                alert(t("account.dialogs.deleteAccount.success"));
                window.location.href = "/";
            } else {
                setDeleteError(data.error || t("account.dialogs.deleteAccount.errors.general"));
            }
        } catch (err) {
            setDeleteError(t("account.dialogs.deleteAccount.errors.tech"));
        } finally {
            setDeletingAccount(false);
        }
    };

    return {
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
    };
}
