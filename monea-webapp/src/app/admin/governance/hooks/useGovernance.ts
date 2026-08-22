"use client";
import { useState, useCallback, useEffect } from "react";

export function useGovernance() {
    const [data, setData] = useState<any>({ history: [], logs: [], templateVersions: [], templateUsage: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [rollingBack, setRollingBack] = useState<string | null>(null);
    const [versionName, setVersionName] = useState("");
    const [description, setDescription] = useState("");
    const [activeTab, setActiveTab] = useState<"system" | "templates" | "audit">("system");
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; versionId: string; versionName: string }>({
        open: false, versionId: "", versionName: ""
    });
    const [successModal, setSuccessModal] = useState(false);
    const [publishError, setPublishError] = useState("");

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const res = await fetch("/api/admin/governance");
            if (!res.ok) {
                console.error("[Governance] API error:", res.status, res.statusText);
                return;
            }
            const json = await res.json();
            if (json && Array.isArray(json.history)) {
                setData({
                    history: json.history ?? [],
                    logs: json.logs ?? [],
                    templateVersions: json.templateVersions ?? [],
                    templateUsage: json.templateUsage ?? [],
                });
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("[Governance] Fetch failed:", err);
        } finally {
            if (!silent) setRefreshing(false);
            setLoading(false);
        }
    }, []);

    // Initial load and Role check
    useEffect(() => {
        const checkRole = async () => {
            try {
                const me = await fetch("/api/auth/me").then(r => r.json());
                if (me.role !== "SUPERADMIN") {
                    window.location.href = "/admin";
                    return;
                }
                fetchData(true);
            } catch (err) {
                console.error("Auth check failed", err);
            }
        };
        checkRole();
    }, [fetchData]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchData(true), 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handlePublish = async () => {
        if (!versionName) { setPublishError("Please enter a version name"); return; }
        setPublishing(true);
        try {
            const res = await fetch("/api/admin/governance", {
                method: "POST",
                body: JSON.stringify({ versionName, description }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const newVersion = await res.json();
                setData((prev: any) => ({ ...prev, history: [newVersion, ...prev.history] }));
                setVersionName("");
                setDescription("");
            }
        } finally {
            setPublishing(false);
        }
    };

    const handleRollback = async (versionId: string) => {
        setRollingBack(versionId);
        try {
            const res = await fetch("/api/admin/governance", {
                method: "PATCH",
                body: JSON.stringify({ versionId }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                setConfirmModal({ open: false, versionId: "", versionName: "" });
                setSuccessModal(true);
                setTimeout(() => {
                    setSuccessModal(false);
                    window.location.reload();
                }, 2000);
            }
        } finally {
            setRollingBack(null);
        }
    };

    return {
        data,
        loading,
        refreshing,
        lastUpdated,
        publishing,
        rollingBack,
        versionName,
        setVersionName,
        description,
        setDescription,
        activeTab,
        setActiveTab,
        confirmModal,
        setConfirmModal,
        successModal,
        publishError,
        fetchData,
        handlePublish,
        handleRollback
    };
}
