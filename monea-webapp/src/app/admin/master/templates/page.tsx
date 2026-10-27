import { useCallback, useEffect, useState } from "react";
import { DollarSign, Eye, LayoutGrid, Loader2, Pencil, Save, Search, X, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/Toast";
import { moneaClient } from "@/lib/api-client";
import {
    normalizeTemplatePresentationMetadata,
    TEMPLATE_DEFINITIONS,
} from "@/components/templates/template-config";
import type { TemplatePresentationMetadata } from "@/components/templates/template-config";
import ImageUploadWidget from "@/components/ui/image-upload-widget";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Availability = Record<string, boolean>;
type TemplateMetadata = Record<string, TemplatePresentationMetadata>;
type TemplateFilter = "ALL" | "ENABLED" | "DISABLED";

export default function TemplateAvailabilityPage() {
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [metadata, setMetadata] = useState<TemplateMetadata | null>(null);
    const [draft, setDraft] = useState<TemplatePresentationMetadata | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<TemplateFilter>("ALL");
    const { showToast } = useToast();
    
    // Bulk copy state
    const [bulkCopyOpen, setBulkCopyOpen] = useState(false);
    const [bulkCopySource, setBulkCopySource] = useState("modern-minimal");
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [bulkCopying, setBulkCopying] = useState(false);
    const [bulkCopyResults, setBulkCopyResults] = useState<{ templateId: string; success: boolean; error?: string }[] | null>(null);

    const loadConfiguration = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        const [availabilityResponse, metadataResponse] = await Promise.all([
            moneaClient.get<Availability>("/api/admin/master/templates", { cache: "no-store" }),
            moneaClient.get<TemplateMetadata>("/api/admin/master/templates/metadata", { cache: "no-store" }),
        ]);
        if (availabilityResponse.error || !availabilityResponse.data) {
            setLoadError(availabilityResponse.error || "Failed to load template availability");
        } else if (metadataResponse.error || !metadataResponse.data) {
            setLoadError(metadataResponse.error || "Failed to load template metadata");
        } else {
            setAvailability(availabilityResponse.data);
            setMetadata(normalizeTemplatePresentationMetadata(metadataResponse.data));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadConfiguration();
    }, [loadConfiguration]);

    const updateAvailability = async (templateId: string, enabled: boolean) => {
        if (savingId) return;
        setSavingId(templateId);
        const response = await moneaClient.patch<Availability>("/api/admin/master/templates", {
            templateId,
            enabled,
        });
        if (response.error || !response.data) {
            showToast({
                title: "បរាជ័យក្នុងការរក្សាទុក",
                description: response.error || "Failed to update template availability",
                type: "error",
            });
        } else {
            setAvailability(response.data);
            showToast({
                title: enabled ? "បានបើក template" : "បានបិទ template",
                type: "success",
            });
        }
        setSavingId(null);
    };

    const startEditing = (templateId: string) => {
        if (!metadata) return;
        setEditingId(templateId);
        setDraft({ ...metadata[templateId] });
    };

    const saveMetadata = async () => {
        if (!editingId || !draft || savingMetadata) return;
        setSavingMetadata(true);
        const response = await moneaClient.patch<TemplateMetadata>("/api/admin/master/templates/metadata", {
            templateId: editingId,
            ...draft,
        });
        if (response.error || !response.data) {
            showToast({
                title: "បរាជ័យក្នុងការរក្សាទុក",
                description: response.error || "Failed to update template details",
                type: "error",
            });
        } else {
            setMetadata(normalizeTemplatePresentationMetadata(response.data));
            setEditingId(null);
            setDraft(null);
            showToast({ title: "បានរក្សាទុកព័ត៌មាន Template", type: "success" });
        }
        setSavingMetadata(false);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setDraft(null);
    };

    const handleBulkCopy = async () => {
        if (selectedTargets.length === 0) {
            showToast({
                title: "សូមជ្រើសរើស Template",
                description: "អ្នកត្រូវជ្រើសរើសយ៉ាងហោចណាស់ template មួយដើម្បី copy",
                type: "error",
            });
            return;
        }

        setBulkCopying(true);
        setBulkCopyResults(null);

        const response = await moneaClient.post<{
            success: boolean;
            message: string;
            results: { templateId: string; success: boolean; error?: string }[];
        }>("/api/admin/template-preview/bulk-copy", {
            sourceTemplateId: bulkCopySource,
            targetTemplateIds: selectedTargets,
        });

        setBulkCopying(false);

        if (response.error || !response.data) {
            showToast({
                title: "បរាជ័យក្នុងការ copy demo data",
                description: response.error || "Failed to copy demo data",
                type: "error",
            });
        } else {
            setBulkCopyResults(response.data.results);
            const successCount = response.data.results.filter(r => r.success).length;
            
            if (successCount === selectedTargets.length) {
                showToast({
                    title: "✅ Copy រួចរាល់!",
                    description: `បាន copy demo data ទៅ ${successCount} template(s) ដោយជោគជ័យ`,
                    type: "success",
                });
                // Reset selections after success
                setTimeout(() => {
                    setBulkCopyOpen(false);
                    setSelectedTargets([]);
                    setBulkCopyResults(null);
                }, 2000);
            } else {
                showToast({
                    title: "Copy រួចមួយផ្នែក",
                    description: `បាន copy ${successCount}/${selectedTargets.length} template(s)`,
                    type: "info",
                });
            }
        }
    };

    const toggleTargetSelection = (templateId: string) => {
        setSelectedTargets(prev =>
            prev.includes(templateId)
                ? prev.filter(id => id !== templateId)
                : [...prev, templateId]
        );
    };

    const selectAllTargets = () => {
        const allOtherTemplates = templates
            .filter(t => t.id !== bulkCopySource)
            .map(t => t.id);
        setSelectedTargets(allOtherTemplates);
    };

    const deselectAllTargets = () => {
        setSelectedTargets([]);
    };

    const templates = Object.values(TEMPLATE_DEFINITIONS);
    const enabledCount = templates.filter((template) => availability?.[template.id] === true).length;
    const disabledCount = templates.length - enabledCount;
    const visibleTemplates = templates.filter((template) => {
        const details = metadata?.[template.id];
        const enabled = availability?.[template.id] === true;
        const query = search.trim().toLocaleLowerCase();
        const matchesSearch = !query || [
            template.id,
            template.title,
            template.description,
            details?.title,
            details?.description,
        ].some((value) => value?.toLocaleLowerCase().includes(query));
        const matchesFilter = filter === "ALL"
            || (filter === "ENABLED" ? enabled : !enabled);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="mx-auto max-w-6xl space-y-5 p-3 sm:space-y-6 sm:p-6">
            <header className="flex items-start gap-3 sm:gap-4">
                <div className="shrink-0 rounded-2xl bg-teal-500/10 p-2.5 text-teal-600 dark:text-teal-300 sm:p-3">
                    <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl font-black text-foreground sm:text-2xl">គ្រប់គ្រង Template</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        គ្រប់គ្រងព័ត៌មាន រូបភាព សិទ្ធិប្រើប្រាស់ និងតម្លៃរបស់ Template នៅទីនេះ។
                    </p>
                </div>
                <div className="ml-auto flex shrink-0 gap-2">
                    <Button 
                        type="button"
                        variant="outline" 
                        className="gap-2"
                        onClick={() => setBulkCopyOpen(true)}
                    >
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Copy Demo Data</span>
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                        <Link to="/admin/master/template-pricing">
                            <DollarSign className="h-4 w-4" />
                            <span className="hidden sm:inline">តម្លៃ និងបញ្ចុះតម្លៃ</span>
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Bulk Copy Dialog */}
            <Dialog open={bulkCopyOpen} onOpenChange={setBulkCopyOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogTitle className="flex items-center gap-2 text-lg font-black">
                        <Copy className="h-5 w-5" />
                        Copy Demo Data ពី Template មួយទៅ Template ផ្សេង
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed">
                        ជ្រើសរើស source template និង target templates ដើម្បី copy រូបភាព ព័ត៌មាន និងទិន្នន័យ demo។
                    </DialogDescription>

                    <div className="space-y-4">
                        {/* Source Template Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold">Source Template (Copy ពី)</Label>
                            <select
                                value={bulkCopySource}
                                onChange={(e) => {
                                    setBulkCopySource(e.target.value);
                                    setSelectedTargets(prev => prev.filter(id => id !== e.target.value));
                                }}
                                disabled={bulkCopying}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            >
                                {templates.map((template) => {
                                    const details = metadata?.[template.id];
                                    return (
                                        <option key={template.id} value={template.id}>
                                            {template.code} - {details?.title || template.title}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-xs text-muted-foreground">
                                Demo data ពី template នេះនឹងត្រូវ copy ទៅ templates ដែលបានជ្រើសរើស
                            </p>
                        </div>

                        {/* Target Templates Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold">Target Templates (Copy ទៅ)</Label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllTargets}
                                        disabled={bulkCopying}
                                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                                    >
                                        ជ្រើសទាំងអស់
                                    </button>
                                    <span className="text-xs text-muted-foreground">|</span>
                                    <button
                                        type="button"
                                        onClick={deselectAllTargets}
                                        disabled={bulkCopying}
                                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                                    >
                                        លុបចោលទាំងអស់
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border bg-muted/30 p-3">
                                {templates
                                    .filter(t => t.id !== bulkCopySource)
                                    .map((template) => {
                                        const details = metadata?.[template.id];
                                        const isSelected = selectedTargets.includes(template.id);
                                        const result = bulkCopyResults?.find(r => r.templateId === template.id);
                                        
                                        return (
                                            <div
                                                key={template.id}
                                                className="flex items-center gap-3 rounded-lg border bg-background p-3 transition hover:border-primary/40"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`target-${template.id}`}
                                                    checked={isSelected}
                                                    onChange={() => toggleTargetSelection(template.id)}
                                                    disabled={bulkCopying}
                                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                                <label
                                                    htmlFor={`target-${template.id}`}
                                                    className="flex flex-1 cursor-pointer items-center gap-3"
                                                >
                                                    {details?.image ? (
                                                        <img
                                                            src={details.image}
                                                            alt=""
                                                            className="h-12 w-9 rounded border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-9 items-center justify-center rounded border bg-muted text-muted-foreground">
                                                            <LayoutGrid className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold">
                                                            {template.code} - {details?.title || template.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {template.id}
                                                        </p>
                                                    </div>
                                                </label>
                                                {result && (
                                                    result.success ? (
                                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    ) : (
                                                        <X className="h-5 w-5 text-destructive" />
                                                    )
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                បានជ្រើសរើស {selectedTargets.length} template(s)
                            </p>
                        </div>

                        {/* Results Display */}
                        {bulkCopyResults && (
                            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                                <p className="mb-2 font-bold">លទ្ធផល:</p>
                                {bulkCopyResults.map((result) => {
                                    const template = templates.find(t => t.id === result.templateId);
                                    return (
                                        <div key={result.templateId} className="flex items-center gap-2 py-1">
                                            {result.success ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <X className="h-4 w-4 text-destructive" />
                                            )}
                                            <span className="flex-1">
                                                {template?.code} - {result.success ? "ជោគជ័យ" : `បរាជ័យ: ${result.error}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setBulkCopyOpen(false);
                                    setSelectedTargets([]);
                                    setBulkCopyResults(null);
                                }}
                                disabled={bulkCopying}
                            >
                                បោះបង់
                            </Button>
                            <Button
                                type="button"
                                onClick={handleBulkCopy}
                                disabled={bulkCopying || selectedTargets.length === 0}
                            >
                                {bulkCopying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        កំពុង Copy...
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Demo Data
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {loading ? (
                <div role="status" className="flex justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : loadError ? (
                <Card>
                    <CardContent className="space-y-3 p-6 text-center">
                        <p role="alert" className="text-sm font-semibold text-destructive">{loadError}</p>
                        <button type="button" className="text-sm font-bold underline" onClick={() => void loadConfiguration()}>
                            ព្យាយាមម្តងទៀត
                        </button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <section aria-label="សេចក្តីសង្ខេប Template" className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { label: "Template សរុប", value: templates.length, id: "ALL" as const },
                            { label: "កំពុងបើក", value: enabledCount, id: "ENABLED" as const },
                            { label: "បានបិទ", value: disabledCount, id: "DISABLED" as const },
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                aria-pressed={filter === item.id}
                                className="rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:rounded-2xl sm:p-4"
                            >
                                <span className="block text-[11px] font-semibold leading-snug text-muted-foreground sm:text-xs">{item.label}</span>
                                <span className="mt-1 block text-lg font-black tabular-nums text-foreground sm:text-2xl">{item.value}</span>
                            </button>
                        ))}
                    </section>

                    <section className="space-y-3 rounded-2xl border border-border bg-card p-3 sm:p-4">
                        <div className="relative">
                            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខសម្គាល់ Template..."
                                aria-label="ស្វែងរក Template"
                                className="h-11 rounded-xl pl-10"
                            />
                            {search && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="សម្អាតការស្វែងរក"
                                    onClick={() => setSearch("")}
                                    className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-muted-foreground"
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-0.5" role="group" aria-label="ច្រោះតាមស្ថានភាព Template">
                            {([
                                { id: "ALL", label: "ទាំងអស់" },
                                { id: "ENABLED", label: "កំពុងបើក" },
                                { id: "DISABLED", label: "បានបិទ" },
                            ] satisfies { id: TemplateFilter; label: string }[]).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id)}
                                    aria-pressed={filter === item.id}
                                    className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        filter === item.id
                                            ? "bg-primary text-primary-foreground"
                                            : "border border-border bg-background text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    {item.label}
                                    <span className="ml-2 tabular-nums opacity-75">
                                        {item.id === "ALL" ? templates.length : item.id === "ENABLED" ? enabledCount : disabledCount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-black text-foreground">បញ្ជី Template</h2>
                        <span className="text-xs font-semibold text-muted-foreground">
                            បង្ហាញ {visibleTemplates.length} / {templates.length}
                        </span>
                    </div>

                {visibleTemplates.length === 0 ? (
                    <Card>
                        <CardContent className="space-y-3 p-8 text-center">
                            <LayoutGrid className="mx-auto h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm font-bold text-foreground">រកមិនឃើញ Template ត្រូវនឹងលក្ខខណ្ឌទេ</p>
                            {(search || filter !== "ALL") && (
                                <Button type="button" variant="outline" onClick={() => { setSearch(""); setFilter("ALL"); }}>
                                    សម្អាតការស្វែងរក និង Filter
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                <div className="grid gap-3">
                    {visibleTemplates.map((template) => {
                        const enabled = availability?.[template.id] === true;
                        const busy = savingId === template.id;
                        const details = metadata?.[template.id];
                        const isEditing = editingId === template.id && draft;
                        return (
                            <Card key={template.id}>
                                <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
                                            {details?.image ? (
                                                <img
                                                    src={details.image}
                                                    alt={details.title || template.title}
                                                    className="h-16 w-12 shrink-0 rounded-lg border object-cover sm:h-20 sm:w-14"
                                                />
                                            ) : (
                                                <div aria-label="មិនទាន់បញ្ចូលរូប Cover" className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground sm:h-20 sm:w-14">
                                                    <LayoutGrid className="h-5 w-5" aria-hidden="true" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="break-words font-bold leading-snug text-foreground">{details?.title || template.title}</p>
                                                <p className="mt-1 break-words text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                                                    <span className="font-medium">{template.id}</span>
                                                    <span className="px-1">·</span>
                                                    {details?.eventType === "both" ? "អាពាហ៍ពិពាហ៍ និងភ្ជាប់ពាក្យ" : details?.eventType === "anniversary" ? "ភ្ជាប់ពាក្យ" : "អាពាហ៍ពិពាហ៍"}
                                                </p>
                                                <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                                                    {enabled ? "បើកសម្រាប់អ្នកប្រើថ្មី" : "បិទសម្រាប់អ្នកប្រើថ្មី"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex w-full shrink-0 items-center justify-between gap-2 border-t pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
                                            <div className="flex items-center gap-2">
                                                {busy && <Loader2 aria-label="កំពុងរក្សាទុក" className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                <Switch
                                                    checked={enabled}
                                                    disabled={savingId !== null || savingMetadata}
                                                    onCheckedChange={(checked) => void updateAvailability(template.id, checked)}
                                                    aria-label={`${enabled ? "បិទ" : "បើក"} ${details?.title || template.title}`}
                                                />
                                            </div>
                                            <Button asChild type="button" variant="outline" size="sm" className="h-9 px-3">
                                                <Link to={`/dashboard/design?templatePreview=${encodeURIComponent(template.id)}`}>
                                                    <Eye className="h-3.5 w-3.5 sm:mr-2" />
                                                    <span className="hidden sm:inline">កែ Demo</span>
                                                </Link>
                                            </Button>
                                            {!isEditing && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    aria-label={`កែប្រែ ${details?.title || template.title}`}
                                                    disabled={editingId !== null || savingId !== null}
                                                    onClick={() => startEditing(template.id)}
                                                    className="h-9 px-3"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 sm:mr-2" />
                                                    <span className="hidden sm:inline">កែប្រែ</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold">
                                                    ឈ្មោះ Template
                                                    <input
                                                        maxLength={80}
                                                        value={draft.title}
                                                        onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                                                        className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 font-normal"
                                                    />
                                                </label>
                                                <label className="block text-sm font-semibold">
                                                    ពិពណ៌នា
                                                    <textarea
                                                        maxLength={300}
                                                        rows={3}
                                                        value={draft.description}
                                                        onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                                                        className="mt-1.5 w-full resize-y rounded-lg border bg-background px-3 py-2 font-normal"
                                                    />
                                                </label>
                                                <label className="block text-sm font-semibold">
                                                    ប្រភេទកម្មវិធីដែលអាចប្រើបាន
                                                    <select
                                                        value={draft.eventType}
                                                        onChange={(event) => setDraft({ ...draft, eventType: event.target.value as TemplatePresentationMetadata["eventType"] })}
                                                        className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 font-normal"
                                                    >
                                                        <option value="both">អាពាហ៍ពិពាហ៍ និងភ្ជាប់ពាក្យ</option>
                                                        <option value="wedding">អាពាហ៍ពិពាហ៍</option>
                                                        <option value="anniversary">ភ្ជាប់ពាក្យ</option>
                                                    </select>
                                                </label>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-sm font-semibold">រូប Cover</p>
                                                <ImageUploadWidget
                                                    value={draft.image}
                                                    onChange={(image) => setDraft({ ...draft, image })}
                                                    onRemove={() => setDraft({ ...draft, image: "" })}
                                                    folder="template-covers"
                                                    compact
                                                    label="បញ្ចូលរូប Cover"
                                                    maxFileSizeBytes={10 * 1024 * 1024}
                                                    allowedMimeTypes={["image/jpeg", "image/png", "image/webp"]}
                                                />
                                                <div className="rounded-xl border bg-muted/30 p-3">
                                                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Preview</p>
                                                    <div className="flex gap-3">
                                                        {draft.image ? (
                                                            <img src={draft.image} alt="" className="h-20 w-14 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="flex h-20 w-14 items-center justify-center rounded-lg border bg-muted text-[10px] text-muted-foreground">
                                                                មិនទាន់មានរូប
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="font-bold">{draft.title || "ឈ្មោះ Template"}</p>
                                                            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{draft.description || "ពិពណ៌នា Template"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2 md:col-span-2">
                                                <Button type="button" variant="outline" disabled={savingMetadata} onClick={cancelEditing}>
                                                    <X className="mr-2 h-4 w-4" /> បោះបង់
                                                </Button>
                                                <Button type="button" disabled={savingMetadata || !draft.title.trim()} onClick={() => void saveMetadata()}>
                                                    {savingMetadata ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                    រក្សាទុក
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                )}
                </>
            )}
        </div>
    );
}
