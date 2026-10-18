import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    CircleAlert,
    ExternalLink,
    FileText,
    Globe,
    Image as ImageIcon,
    Loader2,
    MousePointerClick,
    RefreshCw,
    SearchCheck,
    TrendingUp,
    UserRound,
} from "lucide-react";
import { moneaClient } from "@/lib/api-client";
import { useTranslation } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SeoIssue {
    id: string;
    coupleName: string;
    date: string;
    updatedAt: string;
    hasNames: boolean;
    hasSocialImage: boolean;
    url: string;
}

interface SeoAnalysis {
    siteUrl: string;
    checkedAt: string;
    summary: {
        activePages: number;
        missingNames: number;
        missingSocialImages: number;
        issuePages: number;
    };
    issues: SeoIssue[];
    issueSampleLimit: number;
    searchConsole: {
        status: "CONNECTED" | "NOT_CONFIGURED" | "ACCESS_DENIED" | "PROPERTY_NOT_FOUND" | "INVALID_CREDENTIALS" | "API_ERROR";
        property?: string;
        currentRange?: { startDate: string; endDate: string };
        previousRange?: { startDate: string; endDate: string };
        metrics?: { clicks: number; impressions: number; ctr: number; averagePosition: number };
        previousMetrics?: { clicks: number; impressions: number; ctr: number; averagePosition: number };
        topQueries?: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>;
        topPages?: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>;
    };
}

export default function MasterSeoAnalysisPage() {
    const { locale } = useTranslation();
    const isKm = locale === "km";
    const [data, setData] = useState<SeoAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const loadAnalysis = useCallback(async () => {
        setLoading(true);
        setLoadError(false);
        try {
            const response = await moneaClient.get<SeoAnalysis>("/api/admin/master/seo-analysis", { cache: "no-store" });
            if (response.error || !response.data?.summary || !Array.isArray(response.data.issues) || !response.data.searchConsole) {
                throw new Error(response.error || "SEO analysis response was invalid");
            }
            setData(response.data);
        } catch (error) {
            console.error("[SEO Analysis] Failed to load report:", error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAnalysis();
    }, [loadAnalysis]);

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString(isKm ? "km-KH" : "en-US", { timeZone: "Asia/Phnom_Penh" });
    };

    const metrics = [
        {
            label: isKm ? "ធៀបសាធារណៈសកម្ម" : "Active public invitations",
            value: data?.summary.activePages ?? 0,
            detail: isKm ? "អាចចូលមើលតាមតំណសាធារណៈ" : "Available at public invitation URLs",
            icon: Globe,
            tone: "text-teal-700 dark:text-teal-300 bg-teal-600/10 border-teal-600/20",
        },
        {
            label: isKm ? "ទំព័រខ្វះឈ្មោះសម្រាប់ Title" : "Pages with incomplete titles",
            value: data?.summary.missingNames ?? 0,
            detail: isKm ? "ឈ្មោះគូស្វាមីភរិយាបង្កើតចំណងជើង SEO" : "Couple names are used in the page title",
            icon: UserRound,
            tone: "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20",
        },
        {
            label: isKm ? "ទំព័រប្រើរូបភាពសង្គមលំនាំដើម" : "Pages without a custom share image",
            value: data?.summary.missingSocialImages ?? 0,
            detail: isKm ? "ប្រើរូប logo ជំនួសពេលចែករំលែក" : "Share previews fall back to the site logo",
            icon: ImageIcon,
            tone: "text-rose-700 dark:text-rose-300 bg-rose-500/10 border-rose-500/20",
        },
    ];

    const hasIssues = (data?.summary.missingNames ?? 0) > 0 || (data?.summary.missingSocialImages ?? 0) > 0;
    const gscConnected = data?.searchConsole.status === "CONNECTED";
    const searchMetrics = gscConnected ? data?.searchConsole.metrics : undefined;
    const searchConsoleStatusText = (() => {
        switch (data?.searchConsole.status) {
            case "NOT_CONFIGURED":
                return isKm ? "មិនទាន់កំណត់ Service Account ក្នុង Worker" : "Service account is not configured on the Worker";
            case "ACCESS_DENIED":
                return isKm ? "Service Account មិនទាន់មានសិទ្ធិលើ Property នេះទេ" : "The service account does not have access to this property";
            case "PROPERTY_NOT_FOUND":
                return isKm ? "រកមិនឃើញ Property; សូមពិនិត្យ GSC_SITE_URL" : "Property not found; check GSC_SITE_URL";
            case "INVALID_CREDENTIALS":
                return isKm ? "Service Account credential មិនត្រឹមត្រូវ" : "Service account credentials are invalid";
            case "API_ERROR":
                return isKm ? "Google Search Console API មិនអាចឆ្លើយតបបាន" : "Google Search Console API request failed";
            default:
                return "";
        }
    })();
    const gscMetrics = [
        { label: isKm ? "Clicks" : "Clicks", value: searchMetrics?.clicks.toLocaleString() ?? "—", icon: MousePointerClick },
        { label: isKm ? "បង្ហាញក្នុងលទ្ធផល (Impressions)" : "Impressions", value: searchMetrics?.impressions.toLocaleString() ?? "—", icon: Globe },
        { label: "CTR", value: searchMetrics ? `${(searchMetrics.ctr * 100).toFixed(2)}%` : "—", icon: TrendingUp },
        { label: isKm ? "ទីតាំងមធ្យម" : "Average position", value: searchMetrics ? searchMetrics.averagePosition.toFixed(1) : "—", icon: SearchCheck },
    ];

    return (
        <div className="w-full min-h-full pb-16 font-kantumruy">
            <header className="sticky top-0 z-20 border-b border-border/80 bg-card/80 backdrop-blur-md">
                <div className="mx-auto flex min-h-16 max-w-[1400px] items-center justify-between gap-3 px-3 sm:min-h-20 sm:px-8">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Button asChild variant="ghost" size="icon" aria-label={isKm ? "ត្រឡប់ទៅទំព័រគ្រប់គ្រង" : "Back to admin"} className="h-10 w-10 shrink-0 rounded-xl border border-border bg-card shadow-xs hover:bg-muted">
                            <Link to="/admin/master"><ArrowLeft size={17} className="text-muted-foreground" /></Link>
                        </Button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 sm:text-xs">
                                <SearchCheck size={14} />
                                <span>SEO Analysis</span>
                            </div>
                            <h1 className="truncate text-base font-bold text-foreground sm:text-xl">
                                {isKm ? "ការវិភាគ SEO" : "Search visibility report"}
                            </h1>
                        </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => void loadAnalysis()} disabled={loading} aria-label={isKm ? "វិភាគម្ដងទៀត" : "Run analysis again"} className="h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-xs font-bold shadow-xs sm:px-4">
                        <RefreshCw size={14} className={cn("sm:mr-2", loading && "animate-spin")} />
                        <span className="hidden sm:inline">{isKm ? "វិភាគម្ដងទៀត" : "Refresh analysis"}</span>
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] space-y-5 p-3 sm:space-y-6 sm:p-8">
                <section className="rounded-2xl border border-teal-600/20 bg-gradient-to-br from-teal-600/[0.08] via-card to-card p-4 sm:rounded-3xl sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                                <FileText size={15} />
                                {isKm ? "ការត្រួតពិនិត្យធៀបសាធារណៈ" : "Public invitation audit"}
                            </div>
                            <h2 className="text-lg font-black text-foreground sm:text-xl">
                                {isKm ? "ពិនិត្យព័ត៌មានដែលបង្ហាញនៅពេលចែករំលែកធៀប" : "Check invitation metadata used in search and share previews"}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {isKm
                                    ? "របាយការណ៍នេះពិនិត្យឈ្មោះគូ និងរូបភាព Cover របស់ធៀបសកម្ម។ វាមិនមែនជាពិន្ទុចំណាត់ថ្នាក់របស់ Google ទេ។"
                                    : "This report checks couple names and share-image coverage for active invitations. It is not a Google ranking score."}
                            </p>
                        </div>
                        {data && (
                            <a href={data.siteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-xs font-bold text-foreground transition hover:bg-muted">
                                <Globe size={15} />
                                <span>{new URL(data.siteUrl).hostname}</span>
                                <ExternalLink size={13} />
                            </a>
                        )}
                    </div>
                </section>

                <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
                    <CardHeader className="border-b border-border/60 p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300">
                                    <SearchCheck size={19} />
                                </div>
                                <div className="min-w-0">
                                    <CardTitle className="text-base font-black">Google Search Console</CardTitle>
                                    <p className="mt-1 break-all text-xs text-muted-foreground">
                                        {data?.searchConsole.property || "sc-domain:moneoez.com"}
                                    </p>
                                </div>
                            </div>
                            <Button asChild type="button" variant="outline" className="min-h-10 w-full shrink-0 rounded-xl px-3 text-xs font-bold sm:w-auto">
                                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                                    {isKm ? "បើក Search Console" : "Open Search Console"}
                                    <ExternalLink size={13} className="ml-2" />
                                </a>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 sm:p-5">
                        {gscConnected ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                        <CheckCircle2 size={14} />
                                        {isKm ? "បានភ្ជាប់" : "Connected"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {isKm ? "រយៈពេល៖ " : "Period: "}
                                        {data?.searchConsole.currentRange?.startDate} — {data?.searchConsole.currentRange?.endDate}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                                    {gscMetrics.map((metric) => (
                                        <div key={metric.label} className="flex min-h-24 items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-4">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold leading-4 text-muted-foreground">{metric.label}</p>
                                                <p className="mt-1 text-xl font-black tabular-nums text-foreground">{metric.value}</p>
                                            </div>
                                            <metric.icon className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-300" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    {isKm
                                        ? "Search Console អាចយឺតក្នុងការអាប់ដេតទិន្នន័យ។ Average position ជាមធ្យមតាម impressions ក្នុងរយៈពេលដែលបានជ្រើស មិនមែនលេខចំណាត់ថ្នាក់ថេរទេ។"
                                        : "Search Console data can be delayed. Average position is impression-weighted for this period, not a fixed ranking."}
                                </p>
                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                    {[
                                        {
                                            title: isKm ? "ពាក្យស្វែងរកកំពូល" : "Top search queries",
                                            rows: (data?.searchConsole.topQueries || []).map((row) => ({ ...row, label: row.query })),
                                        },
                                        {
                                            title: isKm ? "ទំព័រដែលទទួលចរាចរណ៍" : "Top pages",
                                            rows: (data?.searchConsole.topPages || []).map((row) => ({ ...row, label: row.page })),
                                        },
                                    ].map((table) => (
                                        <div key={table.title} className="min-w-0 overflow-hidden rounded-xl border border-border/60">
                                            <h3 className="border-b border-border/60 px-3 py-2.5 text-xs font-black text-foreground">{table.title}</h3>
                                            {table.rows.length ? (
                                                <div className="divide-y divide-border/60">
                                                    {table.rows.slice(0, 5).map((row) => (
                                                        <div key={row.label} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
                                                            <span className="min-w-0 truncate text-xs text-foreground" title={row.label}>{row.label}</span>
                                                            <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">{row.clicks.toLocaleString()} {isKm ? "ចុច" : "clicks"} · {row.impressions.toLocaleString()} {isKm ? "បង្ហាញ" : "impr."}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="px-3 py-5 text-center text-xs text-muted-foreground">{isKm ? "មិនមានទិន្នន័យសម្រាប់រយៈពេលនេះទេ" : "No data for this period"}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-100" role="status">
                                    <CircleAlert size={17} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold">{searchConsoleStatusText || (isKm ? "មិនទាន់ភ្ជាប់ Search Console API" : "Search Console API is not connected")}</p>
                                        <p className="mt-1 text-xs leading-5">
                                            {isKm
                                                ? "បើក Search Console API ក្នុង Google Cloud រួចដាក់ JSON Key របស់ Service Account ជា Worker secret GSC_SERVICE_ACCOUNT_JSON។ បន្ទាប់មកចែកសិទ្ធិ Property moneoez.com ទៅ email របស់ Service Account។"
                                                : "Enable the Search Console API in Google Cloud, add the service account JSON key as the Worker secret GSC_SERVICE_ACCOUNT_JSON, then grant that service-account email access to the moneoez.com property."}
                                        </p>
                                    </div>
                                </div>
                                <ol className="list-decimal space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
                                    <li>{isKm ? "បង្កើត Service Account ក្នុង Google Cloud ហើយបើក Search Console API។" : "Create a Google Cloud service account and enable the Search Console API."}</li>
                                    <li>{isKm ? "បន្ថែម email របស់វាជា Full user ក្នុង Search Console property moneoez.com។" : "Add its email as a user of the moneoez.com Search Console property."}</li>
                                    <li>{isKm ? "រក្សាទុក JSON key ជា Worker secret ដោយប្រើ Wrangler; កុំដាក់ Key ក្នុង Git ឬ browser។" : "Store the JSON key as a Worker secret with Wrangler; never put it in Git or the browser."}</li>
                                </ol>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {loadError && (
                    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <CircleAlert size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                            <div>
                                <p className="text-sm font-bold text-foreground">{isKm ? "មិនអាចដំណើរការរបាយការណ៍ SEO បានទេ" : "SEO analysis could not be loaded"}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{isKm ? "សូមពិនិត្យការភ្ជាប់ ឬសិទ្ធិ Admin រួចសាកល្បងម្ដងទៀត។" : "Check your connection or admin access, then retry."}</p>
                            </div>
                        </div>
                        <Button type="button" variant="outline" onClick={() => void loadAnalysis()} disabled={loading} className="min-h-11 rounded-xl">
                            {loading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <RefreshCw size={14} className="mr-2" />}
                            {isKm ? "សាកល្បងម្ដងទៀត" : "Retry"}
                        </Button>
                    </div>
                )}

                {loading && !data ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-700 dark:text-teal-300" />
                        <p className="text-sm font-bold text-muted-foreground">{isKm ? "កំពុងវិភាគទំព័រ..." : "Analyzing invitation pages..."}</p>
                    </div>
                ) : data && !loadError ? (
                    <>
                        <section aria-label={isKm ? "ស្ថិតិ SEO" : "SEO metrics"} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {metrics.map((metric) => (
                                <Card key={metric.label} className="rounded-2xl border-border bg-card shadow-sm">
                                    <CardContent className="flex min-h-[126px] items-center justify-between gap-4 p-4 sm:p-5">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold leading-5 text-muted-foreground">{metric.label}</p>
                                            {loading ? <div className="mt-3 h-8 w-16 animate-pulse rounded-lg bg-muted" /> : (
                                                <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-foreground">{metric.value.toLocaleString()}</p>
                                            )}
                                            <p className="mt-1 text-xs leading-4 text-muted-foreground">{metric.detail}</p>
                                        </div>
                                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", metric.tone)}>
                                            <metric.icon size={20} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>

                        <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
                            <CardHeader className="border-b border-border/60 p-4 sm:p-5">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base font-black">
                                        {hasIssues ? <CircleAlert size={18} className="text-amber-600" /> : <CheckCircle2 size={18} className="text-emerald-600" />}
                                        {isKm ? "ធៀបដែលត្រូវពិនិត្យ" : "Invitations to review"}
                                    </CardTitle>
                                    <span className="text-xs text-muted-foreground">
                                        {isKm
                                            ? `បង្ហាញ ${data.issues.length} ក្នុងចំណោម ${data.summary.issuePages} ទំព័រដែលមានបញ្ហា`
                                            : `Showing ${data.issues.length} of ${data.summary.issuePages} pages with issues`}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {data.issues.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                                        <CheckCircle2 size={30} className="text-emerald-600" />
                                        <p className="font-bold text-foreground">{isKm ? "មិនឃើញបញ្ហាក្នុងធៀបសកម្មទេ" : "No metadata issues found for active invitations"}</p>
                                        <p className="text-xs text-muted-foreground">{isKm ? "ឈ្មោះ និងរូបភាពសង្គមមានគ្រប់គ្រាន់តាមលក្ខខណ្ឌដែលបានត្រួតពិនិត្យ។" : "Names and share images passed the checks in this report."}</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {data.issues.map((issue) => (
                                            <article key={issue.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                                <div className="min-w-0">
                                                    <h3 className="break-words text-sm font-bold text-foreground">{issue.coupleName}</h3>
                                                    <p className="mt-1 break-all text-xs text-muted-foreground">{issue.url}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {!issue.hasNames && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">{isKm ? "ឈ្មោះមិនពេញ" : "Incomplete title names"}</span>}
                                                        {!issue.hasSocialImage && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-800 dark:text-rose-300">{isKm ? "ប្រើ Logo ជា Preview" : "Uses default share image"}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                                                    <span className="text-xs text-muted-foreground">{isKm ? "កែប្រែ៖ " : "Updated: "}{formatDate(issue.updatedAt)}</span>
                                                    <Button asChild type="button" variant="outline" className="min-h-10 shrink-0 rounded-xl px-3 text-xs font-bold">
                                                        <a href={issue.url} target="_blank" rel="noopener noreferrer">
                                                            {isKm ? "មើលធៀប" : "Open"}
                                                            <ExternalLink size={13} className="ml-2" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                                {data.summary.issuePages > data.issues.length && (
                                    <p className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground sm:px-5">
                                        {isKm ? `របាយការណ៍បង្ហាញតែ ${data.issueSampleLimit} ធៀបដំបូង។ ស្ថិតិខាងលើរាប់ទំព័រសកម្មទាំងអស់។` : `Only the first ${data.issueSampleLimit} issues are listed. Summary counts include all active invitations.`}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <p className="text-right text-xs text-muted-foreground">
                            {isKm ? "ពិនិត្យចុងក្រោយ៖ " : "Last checked: "}
                            {new Date(data.checkedAt).toLocaleString(isKm ? "km-KH" : "en-US", { timeZone: "Asia/Phnom_Penh" })}
                        </p>
                    </>
                ) : null}
            </main>
        </div>
    );
}
