"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";

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
                window.location.href = "/login";
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

    const handleRevokeSessions = async () => {
        if (!confirm("តើអ្នកពិតជាចង់ចាកចេញពីគ្រប់ឧបករណ៍មែនទេ?")) return;
        setRevoking(true);
        try {
            const res = await fetch("/api/admin/security/revoke", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "SELF" })
            });
            const data = await res.json();
            if (data.success) {
                alert("បានចាកចេញពីគ្រប់ឧបករណ៍ដោយជោគជ័យ។ លោកអ្នកត្រូវចូលប្រព័ន្ធម្ដងទៀត។");
                window.location.href = "/login";
            }
        } catch (err) {
            alert("មានបញ្ហាក្នុងការចាកចេញ។");
        } finally {
            setRevoking(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");

        if (newPassword !== confirmPassword) {
            setPwError("លេខសម្ងាត់ថ្មីមិនស៊ីគ្នាទេ");
            return;
        }

        if (newPassword.length < 8) {
            setPwError("លេខសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ ខ្ទង់");
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
                alert("ប្តូរលេខសម្ងាត់បានជោគជ័យ។ ដើម្បីសុវត្ថិភាព លោកអ្នកត្រូវចូលប្រព័ន្ធម្ដងទៀត។");
                window.location.href = "/login";
            } else {
                setPwError(data.error || "មានបញ្ហាក្នុងការប្តូរលេខសម្ងាត់");
            }
        } catch (err) {
            setPwError("មានបញ្ហាបច្ចេកទេស");
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
                alert("បានបិទប្រព័ន្ធការពារ ២ ជាន់ដោយជោគជ័យ។");
                setShowDisable2FA(false);
                setDisablePassword("");
                mutate();
            } else {
                setDisableError(data.error || "មានបញ្ហាក្នុងការបិទ 2FA");
            }
        } catch (err) {
            setDisableError("មានបញ្ហាបច្ចេកទេស");
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
                alert("គណនីរបស់អ្នកត្រូវបានលុបដោយជោគជ័យ។");
                window.location.href = "/";
            } else {
                setDeleteError(data.error || "មានបញ្ហាក្នុងការលុបគណនី");
            }
        } catch (err) {
            setDeleteError("មានបញ្ហាបច្ចេកទេស");
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
