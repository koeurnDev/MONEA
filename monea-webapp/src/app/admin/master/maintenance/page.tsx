import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Activity, 
    ArrowLeft, 
    Database, 
    Trash2, 
    ShieldCheck, 
    Loader2, 
    Globe, 
    RefreshCcw, 
    CheckCircle2, 
    Users, 
    FileText, 
    Sparkles, 
    HardDrive,
    Server,
    HeartPulse,
    Image as ImageIcon,
    Layers,
    Search,
    ExternalLink,
    Copy,
    Check,
    X,
    Maximize2,
    Download,
    Upload,
    Save,
    AlertTriangle,
    Shield
} from "lucide-react";
import { Link } from 'react-router-dom';
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function MasterMaintenancePage() {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const isKm = locale === 'km';

    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [cleanupConfirm, setCleanupConfirm] = useState(false);

    // Media Gallery Modal State
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaAssets, setMediaAssets] = useState<any[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [mediaSearch, setMediaSearch] = useState("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Backup & Restore State
    const [downloadingBackup, setDownloadingBackup] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [restoringBackup, setRestoringBackup] = useState(false);
    const [restoreData, setRestoreData] = useState<any>(null);
    const [restoreFileError, setRestoreFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await moneaClient.get<any>("/api/admin/master/maintenance/tasks");
            if (res.data) setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMediaGallery = async () => {
        setShowMediaModal(true);
        setLoadingMedia(true);
        try {
            const res = await fetch("/api/admin/master/media/assets");
            const data = await res.json();
            setMediaAssets(data.assets || []);
        } catch (e) {
            showToast({ title: isKm ? "បរាជ័យក្នុងការទាញយករូបភាព" : "Failed to fetch media", type: "error" });
        } finally {
            setLoadingMedia(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
        showToast({ title: isKm ? "បានចម្លង Link រួចរាល់!" : "Link Copied!", type: "success" });
    };

    const formatHealthStatus = (status: string) => {
        if (!status) return "ល្អប្រសើរ";
        const s = String(status).toUpperCase();
        if (s === "HEALTHY" || s === "ONLINE" || s === "LOCAL_ACTIVE" || s === "ACTIVE") return "ល្អប្រសើរ";
        if (s === "DEGRADED") return "ដំណើរការខ្សោយ";
        if (s === "DOWN" || s === "ERROR") return "មានបញ្ហា";
        return status;
    };

    // ─── 1-Click Direct Backup Download ───────────────────────────────────────
    const handleDownloadBackup = async () => {
        setDownloadingBackup(true);
        try {
            const res = await fetch("/api/admin/master/maintenance/backup");
            if (!res.ok) throw new Error("Backup failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `monea_backup_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast({
                title: isKm ? "បានទាញយក Backup ជោគជ័យ!" : "Backup Downloaded!",
                description: isKm ? "ឯកសារទិន្នន័យទាំងអស់ត្រូវបានរក្សាទុកក្នុងកុំព្យូទ័ររបស់អ្នកដោយសុវត្ថិភាព។" : "Database snapshot saved locally.",
                type: "success"
            });
        } catch (e) {
            showToast({ title: isKm ? "បរាជ័យក្នុងការទាញយក Backup" : "Backup Error", type: "error" });
        } finally {
            setDownloadingBackup(false);
        }
    };

    // ─── Restore Handlers ─────────────────────────────────────────────────────
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRestoreFileError(null);
        setRestoreData(null);
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (!parsed || !parsed.data) {
                    setRestoreFileError(isKm ? "ឯកសារនេះមិនមែនជាទម្រង់ Backup របស់ MONEA ឡើយ" : "Invalid backup file structure");
                    return;
                }
                setRestoreData(parsed);
            } catch (err) {
                setRestoreFileError(isKm ? "មិនអាចអានឯកសារ JSON នេះបានឡើយ" : "Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmRestore = async () => {
        if (!restoreData) return;
        setRestoringBackup(true);
        try {
            const res = await fetch("/api/admin/master/maintenance/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(restoreData)
            });
            const data = await res.json();
            if (data.success) {
                showToast({
                    title: isKm ? "បានបញ្ចូលទិន្នន័យ Backup ជោគជ័យ!" : "Database Restored Successfully!",
                    description: isKm 
                        ? `បានស្តារ៖ ${data.summary?.users || 0} Users, ${data.summary?.weddings || 0} ធៀបការ, ${data.summary?.guests || 0} ភ្ញៀវ។`
                        : `Restored ${data.summary?.users || 0} users and ${data.summary?.weddings || 0} weddings.`,
                    type: "success"
                });
                setShowRestoreModal(false);
                setRestoreData(null);
                loadData();
            } else {
                showToast({ title: "Error", description: data.error || "Failed to restore database", type: "error" });
            }
        } catch (e) {
            showToast({ title: "Error", description: "Failed to restore backup", type: "error" });
        } finally {
            setRestoringBackup(false);
        }
    };

    const confirmCleanup = async () => {
        setCleaning(true);
        try {
            const res = await moneaClient.delete<any>("/api/admin/master/maintenance/tasks");
            if (res.data) {
                showToast({
                    title: isKm ? "បានសម្អាតកំណត់ត្រាចាស់ៗជោគជ័យ" : "Cleanup Complete",
                    description: isKm ? `បានលុបកំណត់ត្រាចាស់ចំនួន ${res.data.deletedCount || 0} ចេញពីប្រព័ន្ធ។` : `Removed ${res.data.deletedCount || 0} old logs.`,
                    type: "success"
                });
            } else if (res.error) {
                showToast({ title: "បរាជ័យ", description: res.error, type: "error" });
            }
            setCleanupConfirm(false);
            loadData();
        } catch (e) {
            showToast({ title: "Error", description: "Failed to perform cleanup", type: "error" });
        } finally {
            setCleaning(false);
        }
    };

    const handleOptimize = async () => {
        setOptimizing(true);
        try {
            const res = await fetch("/api/admin/master/maintenance/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "VACUUM" })
            });
            const data = await res.json();
            if (data.success) {
                showToast({
                    title: isKm ? "ការបង្កើនល្បឿនប្រព័ន្ធទិន្នន័យបានជោគជ័យ" : "Optimization Complete",
                    description: isKm ? "ដំណើរការបង្កើនល្បឿន និងសម្អាត Memory ត្រូវបានបញ្ចប់ដោយជោគជ័យ។" : "Database indexes and memory reclaimed.",
                    type: "success"
                });
            }
            loadData();
        } catch (e) {
            showToast({ title: "Error", description: "Failed to optimize database", type: "error" });
        } finally {
            setOptimizing(false);
        }
    };

    const dbStorage = stats?.storage?.database || {
        usedMB: 12.5,
        usedFormatted: "12.5 MB",
        maxQuotaMB: 500,
        freeMB: 487.5,
        usagePercent: 2.5
    };

    const mediaStorage = stats?.storage?.cloudinary || {
        usedGB: 0.01,
        usedFormatted: "10.5 MB",
        maxQuotaGB: 25.0,
        freeGB: 24.99,
        usagePercent: 0.1,
        totalPhotos: 0
    };

    const imagekitStorage = stats?.storage?.imagekit || {
        usedGB: 0.0,
        usedFormatted: "0.0 MB",
        maxQuotaGB: 20.0,
        freeGB: 20.0,
        usagePercent: 0.01,
        totalPhotos: 0
    };

    const filteredAssets = mediaAssets.filter(item => 
        item.public_id?.toLowerCase().includes(mediaSearch.toLowerCase()) ||
        item.format?.toLowerCase().includes(mediaSearch.toLowerCase())
    );

    return (
        <div className="w-full min-h-full font-kantumruy pb-16">
            <ConfirmModal
                open={cleanupConfirm}
                onClose={() => setCleanupConfirm(false)}
                onConfirm={confirmCleanup}
                loading={cleaning}
                title={isKm ? "សម្អាតកំណត់ត្រាចាស់ៗ" : "Clean Old Logs"}
                description={isKm ? "សកម្មភាពនេះនឹងលុបកំណត់ត្រាចាស់ទាំងអស់ (ចាស់ជាង ៣០ ថ្ងៃ) ពីប្រព័ន្ធដើម្បីកាត់បន្ថយទំហំផ្ទុក។ ការណ៍នេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។" : "This will delete all system logs older than 30 days to optimize storage."}
                confirmLabel={isKm ? "ចាប់ផ្ដើមសម្អាត" : "Start Cleanup"}
                detail="Delete all system logs older than 30 days"
                variant="warning"
            />

            {/* Top Bar Header */}
            <div className="bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/master">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border bg-card shadow-xs hover:bg-muted">
                                <ArrowLeft size={17} className="text-muted-foreground" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                <HeartPulse size={13} />
                                <span>{isKm ? "សុខភាព និងការថែទាំប្រព័ន្ធ" : "Health & Maintenance"}</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                {isKm ? "ការត្រួតពិនិត្យ និងថែទាំប្រព័ន្ធ" : "System Diagnostics & Maintenance"}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={loadData}
                            variant="outline"
                            disabled={loading}
                            className="h-10 px-4 rounded-xl font-bold text-xs border border-border bg-card shadow-xs flex items-center gap-2"
                        >
                            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                            <span>{isKm ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-6">
                {loading && !stats ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        <p className="text-xs font-bold text-muted-foreground">{isKm ? "កំពុងទាញយកទិន្នន័យសុខភាពប្រព័ន្ធ..." : "Running diagnostics..."}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 3 Dedicated Storage Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Card 1: Neon Database Storage */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shrink-0">
                                            <Database size={18} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                {isKm ? "ទំហំផ្ទុក Database" : "Database"}
                                            </CardTitle>
                                            <p className="text-[11px] text-muted-foreground">
                                                Neon PostgreSQL
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-muted text-foreground border border-border/60">
                                        {dbStorage.usagePercent}%
                                    </span>
                                </CardHeader>
                                <CardContent className="p-5 space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    dbStorage.usagePercent > 85 
                                                        ? "bg-rose-500 shadow-rose-500/50" 
                                                        : (dbStorage.usagePercent > 60 ? "bg-amber-500 shadow-amber-500/50" : "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30")
                                                )}
                                                style={{ width: `${Math.max(3, dbStorage.usagePercent)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>ប្រើ៖ <strong className="text-foreground font-mono">{dbStorage.usedFormatted}</strong></span>
                                            <span>សល់៖ <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{dbStorage.freeMB} MB</strong></span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-bold">{isKm ? "ទំហំប្រើ" : "Used"}</span>
                                            <span className="text-xs font-mono font-black text-foreground">{dbStorage.usedFormatted}</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-bold">{isKm ? "កម្រិតផ្ទុក" : "Quota"}</span>
                                            <span className="text-xs font-mono font-black text-foreground">{dbStorage.maxQuotaMB} MB</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2: Cloudinary Media Storage (Primary) */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
                                            <ImageIcon size={18} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                {isKm ? "Cloudinary (ចម្បង)" : "Cloudinary (Primary)"}
                                            </CardTitle>
                                            <p className="text-[11px] text-muted-foreground">
                                                Primary Media CDN
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-muted text-foreground border border-border/60">
                                        {mediaStorage.usagePercent}%
                                    </span>
                                </CardHeader>
                                <CardContent className="p-5 space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    mediaStorage.usagePercent > 85 
                                                        ? "bg-rose-500 shadow-rose-500/50" 
                                                        : (mediaStorage.usagePercent > 60 ? "bg-amber-500 shadow-amber-500/50" : "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30")
                                                )}
                                                style={{ width: `${Math.max(3, mediaStorage.usagePercent)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>ប្រើ៖ <strong className="text-foreground font-mono">{mediaStorage.usedFormatted}</strong></span>
                                            <span>សល់៖ <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{mediaStorage.freeGB} GB</strong></span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-bold">{isKm ? "រូបភាព" : "Photos"}</span>
                                            <span className="text-xs font-mono font-black text-foreground">{mediaStorage.totalPhotos || 0} សន្លឹក</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-bold">{isKm ? "កម្រិតផ្ទុក" : "Quota"}</span>
                                            <span className="text-xs font-mono font-black text-foreground">{mediaStorage.maxQuotaGB} GB</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleOpenMediaGallery}
                                        className="w-full h-9 rounded-xl font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                                    >
                                        <ImageIcon size={13} />
                                        <span>{isKm ? "បើកមើលរូបភាពទាំងអស់" : "Browse Photos"}</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Card 3: ImageKit.io Media Storage (Secondary / Auto Failover) */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                            <Globe size={18} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold text-foreground">
                                                {isKm ? "ImageKit.io (ជំនួយ)" : "ImageKit.io (Backup)"}
                                            </CardTitle>
                                            <p className="text-[11px] text-muted-foreground">
                                                Auto-Failover CDN
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                        {imagekitStorage.usagePercent}%
                                    </span>
                                </CardHeader>
                                <CardContent className="p-5 space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5">
                                            <div 
                                                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/30"
                                                style={{ width: `${Math.max(3, imagekitStorage.usagePercent)}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                            <span>ប្រើ៖ <strong className="text-foreground font-mono">{imagekitStorage.usedFormatted}</strong></span>
                                            <span>សល់៖ <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{imagekitStorage.freeGB} GB</strong></span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-bold">{isKm ? "រូបភាព" : "Photos"}</span>
                                            <span className="text-xs font-mono font-black text-foreground">{imagekitStorage.totalPhotos || 0} សន្លឹក</span>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-bold">{isKm ? "កម្រិតផ្ទុក" : "Quota"}</span>
                                            <span className="text-xs font-mono font-black text-foreground">{imagekitStorage.maxQuotaGB} GB</span>
                                        </div>
                                    </div>

                                    <div className="p-2 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/30 text-[10px] font-mono text-cyan-700 dark:text-cyan-300 text-center truncate">
                                        ik.imagekit.io/v8dbam7a6
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Direct Backup & Restore Hub Card */}
                        <Card className="bg-card border border-indigo-500/30 dark:border-indigo-500/20 rounded-2xl shadow-xs overflow-hidden">
                            <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/30 dark:bg-indigo-950/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-foreground">
                                            {isKm ? "ការបម្រុងទុក និងស្តារទិន្នន័យ (Private Data Backup & Restore)" : "Direct Data Backup & Restore Hub"}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isKm ? "ទាញយក និងរក្សាទុកទិន្នន័យក្នុងកុំព្យូទ័រផ្ទាល់ខ្លួន ដោយគ្មានការឆ្លងកាត់ App ខាងក្រៅ (សុវត្ថិភាព ១០០%)" : "100% private offline snapshot control"}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Action 1: Download Full Backup */}
                                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1.5">
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <Download size={16} className="text-indigo-600" />
                                                <span>{isKm ? "ទាញយក Backup ពេញលេញ" : "Download Full Snapshot"}</span>
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {isKm 
                                                    ? "រក្សាទុក Users, Weddings, Guests, Gifts, និង Settings ទាំងអស់ជាឯកសារ JSON ក្នុងកុំព្យូទ័ររបស់អ្នកភ្លាមៗ។"
                                                    : "Exports complete database state into an immutable offline JSON archive."}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleDownloadBackup}
                                            disabled={downloadingBackup}
                                            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                                        >
                                            {downloadingBackup ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            <span>{isKm ? "ទាញយក Backup ឥឡូវនេះ (1-Click Download)" : "Download Backup File"}</span>
                                        </Button>
                                    </div>

                                    {/* Action 2: Restore from Backup */}
                                    <div className="p-5 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1.5">
                                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <Upload size={16} className="text-emerald-600" />
                                                <span>{isKm ? "បញ្ចូលទិន្នន័យពី Backup មកវិញ" : "Restore from Backup"}</span>
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {isKm 
                                                    ? "ជ្រើសរើសឯកសារ Backup JSON ដែលបានទាញយកពីមុន ដើម្បីស្តារទិន្នន័យត្រឡប់មក PostgreSQL វិញ។"
                                                    : "Import and sync records back into PostgreSQL with conflict resolution."}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setShowRestoreModal(true);
                                                setRestoreData(null);
                                                setRestoreFileError(null);
                                            }}
                                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Upload size={16} />
                                            <span>{isKm ? "ជ្រើសរើស File ដើម្បី Restore" : "Select File to Restore"}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Grid of details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Column 1: Data Distribution */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Layers size={18} className="text-rose-500" />
                                        <span>{isKm ? "ការបែងចែកទិន្នន័យ" : "Data Distribution"}</span>
                                    </CardTitle>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        PostgreSQL
                                    </span>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    {[
                                        { label: isKm ? "ចំនួនអ្នកប្រើប្រាស់សរុប" : "Total Users", value: stats?.users || 0, icon: Users, color: "text-blue-500" },
                                        { label: isKm ? "កម្មវិធីមង្គលការសកម្ម" : "Active Weddings", value: stats?.weddings || 0, icon: HeartPulse, color: "text-rose-500" },
                                        { label: isKm ? "ចំនួនភ្ញៀវកិត្តិយសសរុប" : "Guest Profiles", value: stats?.guests || 0, icon: Users, color: "text-emerald-500" },
                                        { label: isKm ? "កំណត់ត្រាប្រព័ន្ធ" : "System Logs", value: stats?.logs || 0, icon: FileText, color: "text-amber-500" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/70 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-card border border-border/60 flex items-center justify-center">
                                                    <item.icon size={16} className={item.color} />
                                                </div>
                                                <span className="text-xs font-bold text-foreground">{item.label}</span>
                                            </div>
                                            <span className="font-mono font-black text-sm text-foreground">
                                                {item.value.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Column 2: Service Health Status */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Server size={18} className="text-emerald-500" />
                                        <span>{isKm ? "ស្ថានភាពសេវាកម្ម" : "Service Health"}</span>
                                    </CardTitle>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>{isKm ? "ដំណើរការធម្មតា" : "ONLINE"}</span>
                                    </span>
                                </CardHeader>
                                <CardContent className="p-6 space-y-3">
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Database size={16} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-foreground block">{isKm ? "មូលដ្ឋានទិន្នន័យ" : "Database"}</span>
                                                <span className="text-[10px] text-muted-foreground">{isKm ? "ម៉ាស៊ីនមេ PostgreSQL" : "Neon PostgreSQL"}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                            {formatHealthStatus(stats?.services?.database)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Globe size={16} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-foreground block">{isKm ? "ប្រព័ន្ធផ្ទុករូបភាពចម្បង" : "Primary Storage"}</span>
                                                <span className="text-[10px] text-muted-foreground">{isKm ? "ប្រព័ន្ធផ្ទុករូបភាព Cloudinary (25 GB)" : "Cloudinary Storage"}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                            {formatHealthStatus(stats?.services?.cloudinary)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <Globe size={16} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-foreground block">{isKm ? "ប្រព័ន្ធផ្ទុករូបភាពទី ២" : "Secondary CDN"}</span>
                                                <span className="text-[10px] text-muted-foreground">{isKm ? "ImageKit.io CDN (20 GB)" : "ImageKit.io CDN"}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                                            {formatHealthStatus(stats?.services?.imagekit || "ONLINE")}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                                <Database size={16} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-foreground block">{isKm ? "ឃ្លាំងទិន្នន័យជំនួយ" : "Archive Vault"}</span>
                                                <span className="text-[10px] text-muted-foreground">{isKm ? "CockroachDB (10 GB Free)" : "CockroachDB AWS SG"}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                                            {formatHealthStatus(stats?.services?.cockroach || "ONLINE")}
                                        </span>
                                    </div>

                                    <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                                        <span>{isKm ? "ពេលវេលាត្រួតពិនិត្យចុងក្រោយ:" : "Last Checked:"}</span>
                                        <span className="font-mono font-bold">
                                            {new Date(stats?.timestamp || Date.now()).toLocaleTimeString('km-KH', { timeZone: 'Asia/Phnom_Penh' })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Column 3: Storage & Log Cleanup */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-6 pb-4 border-b border-border/50">
                                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Trash2 size={18} className="text-rose-500" />
                                        <span>{isKm ? "ការសម្អាតទិន្នន័យចាស់ៗ" : "Storage Cleanup"}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {isKm 
                                            ? "បង្កើនល្បឿន និងសន្សំសំចៃទំហំផ្ទុក ដោយលុបកំណត់ត្រាប្រព័ន្ធចាស់ៗដែលលើសពី ៣០ ថ្ងៃចេញពីប្រព័ន្ធ។"
                                            : "Improve query latency and save database storage by removing non-critical audit logs older than 30 days."}
                                    </p>
                                    <Button
                                        onClick={() => setCleanupConfirm(true)}
                                        disabled={cleaning}
                                        className="w-full h-11 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                                    >
                                        {cleaning ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                        <span>{isKm ? "សម្អាតកំណត់ត្រាចាស់ៗ" : "Clear Old Logs"}</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Column 4: Deep Optimization */}
                            <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
                                <CardHeader className="p-6 pb-4 border-b border-border/50">
                                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Sparkles size={18} className="text-amber-500" />
                                        <span>{isKm ? "ការបង្កើនប្រសិទ្ធភាពទិន្នន័យ" : "Deep Optimization"}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {isKm 
                                            ? "រៀបចំលិបិក្រមឡើងវិញ និងទាញយកអង្គចងចាំទទេមកវិញ ដើម្បីឱ្យការស្វែងរកទិន្នន័យមានល្បឿនលឿនបំផុត។"
                                            : "Reclaim dead tuples and re-optimize database indexes for peak performance and faster responses."}
                                    </p>
                                    <Button
                                        onClick={handleOptimize}
                                        disabled={optimizing}
                                        className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2"
                                    >
                                        {optimizing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                        <span>{isKm ? "បង្កើនល្បឿនប្រព័ន្ធទិន្នន័យ" : "Run VACUUM Action"}</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>

            {/* Restore Database Modal */}
            <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
                <DialogContent className="max-w-md rounded-3xl p-6 font-kantumruy bg-white">
                    <DialogHeader className="space-y-2 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                            <Upload size={24} />
                        </div>
                        <DialogTitle className="text-lg font-black text-slate-900">
                            {isKm ? "បញ្ចូលទិន្នន័យពី Backup មកវិញ" : "Restore Database"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                            {isKm ? "ជ្រើសរើសឯកសារ JSON Backup ដែលអ្នកបានទាញយកពីមុន ដើម្បីបញ្ចូលទិន្នន័យត្រឡប់មកវិញ។" : "Upload your valid JSON backup file."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-indigo-50/40 transition-colors"
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".json" 
                                onChange={handleFileSelect} 
                                className="hidden" 
                            />
                            <Download size={24} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">
                                {restoreData ? "ឯកសារ Backup ត្រូវបានជ្រើសរើស ✓" : "ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ Backup .json"}
                            </span>
                            <span className="text-[10px] text-slate-400">monea_backup_*.json</span>
                        </div>

                        {restoreFileError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                                <AlertTriangle size={15} />
                                <span>{restoreFileError}</span>
                            </div>
                        )}

                        {restoreData && (
                            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                                <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
                                    <span>ព័ត៌មាន Backup៖</span>
                                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-full border border-indigo-200">{restoreData.version || "1.2.3"}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold text-slate-700">
                                    <div>Users: {restoreData.counts?.users || restoreData.data?.users?.length || 0}</div>
                                    <div>Weddings: {restoreData.counts?.weddings || restoreData.data?.weddings?.length || 0}</div>
                                    <div>Guests: {restoreData.counts?.guests || restoreData.data?.guests?.length || 0}</div>
                                    <div>Gifts: {restoreData.counts?.gifts || restoreData.data?.gifts?.length || 0}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowRestoreModal(false)}
                            disabled={restoringBackup}
                            className="rounded-xl text-xs font-bold"
                        >
                            {isKm ? "បោះបង់" : "Cancel"}
                        </Button>
                        <Button
                            onClick={handleConfirmRestore}
                            disabled={!restoreData || restoringBackup}
                            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                        >
                            {restoringBackup ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            <span>{isKm ? "ចាប់ផ្ដើម Restore" : "Confirm Restore"}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cloudinary Media Explorer Modal */}
            <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
                <DialogContent className="max-w-4xl max-h-[85vh] rounded-3xl p-6 font-kantumruy flex flex-col bg-white overflow-hidden">
                    <DialogHeader className="space-y-2 text-left shrink-0 pb-2 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                    <ImageIcon size={20} />
                                </div>
                                <div>
                                    <DialogTitle className="text-base font-black text-slate-900">
                                        វិចិត្រសាលរូបភាព Cloudinary Media Assets
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-500">
                                        រូបភាពទាំងអស់ដែលបាន Upload ក្នុងគណនី Cloudinary ({mediaAssets.length} រូបភាព)
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <Input
                                    placeholder="ស្វែងរកតាមឈ្មោះរូប..."
                                    value={mediaSearch}
                                    onChange={e => setMediaSearch(e.target.value)}
                                    className="h-9 pl-9 rounded-xl text-xs bg-slate-50 border-slate-200"
                                />
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Gallery Grid */}
                    <div className="flex-1 overflow-y-auto py-4 min-h-[300px]">
                        {loadingMedia ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                <p className="text-xs font-bold text-slate-400">កំពុងទាញយករូបភាពពី Cloudinary Server...</p>
                            </div>
                        ) : filteredAssets.length === 0 ? (
                            <div className="py-20 text-center text-xs font-bold text-slate-400">
                                មិនមានរូបភាពត្រូវបង្ហាញឡើយ
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {filteredAssets.map((asset, idx) => {
                                    const sizeKB = asset.bytes ? (asset.bytes / 1024).toFixed(1) : "---";
                                    const imgUrl = asset.secure_url || asset.url;

                                    return (
                                        <div
                                            key={asset.public_id || idx}
                                            className="group relative rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden hover:shadow-md transition-all flex flex-col"
                                        >
                                            <div className="aspect-square relative overflow-hidden bg-slate-100">
                                                <img
                                                    src={imgUrl}
                                                    alt={asset.public_id}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                                <button
                                                    onClick={() => setPreviewImage(imgUrl)}
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                                                    title="ពង្រីករូបភាព"
                                                >
                                                    <Maximize2 size={20} />
                                                </button>
                                            </div>

                                            <div className="p-2.5 bg-white space-y-1 text-left">
                                                <p className="text-[11px] font-mono font-bold text-slate-800 truncate" title={asset.public_id}>
                                                    {asset.public_id?.split('/').pop()}
                                                </p>
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                                    <span>{asset.width}x{asset.height}</span>
                                                    <span>{sizeKB} KB</span>
                                                </div>

                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <button
                                                        onClick={() => handleCopyUrl(imgUrl)}
                                                        className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                                                        title="ចម្លង Link"
                                                    >
                                                        {copiedUrl === imgUrl ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                                        <span>{copiedUrl === imgUrl ? "បានចម្លង" : "Copy Link"}</span>
                                                    </button>
                                                    <a
                                                        href={imgUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                                        title="បើកមើលលើ Tab ថ្មី"
                                                    >
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Fullscreen Image Preview Lightbox */}
            {previewImage && (
                <div 
                    onClick={() => setPreviewImage(null)}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                    >
                        <X size={20} />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
