import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Error in component [${this.props.name || "Unknown"}]:`, error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm [padding-bottom:calc(1rem+env(safe-area-inset-bottom))] [padding-top:calc(1rem+env(safe-area-inset-top))]">
                    <section
                        aria-labelledby="app-error-title"
                        aria-modal="true"
                        className="w-full max-w-md rounded-3xl border border-white/70 bg-white px-6 py-8 text-center shadow-2xl shadow-slate-950/25 sm:px-9 sm:py-10"
                        role="alertdialog"
                    >
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/60">
                            <AlertCircle aria-hidden="true" size={32} strokeWidth={2.25} />
                        </div>
                        <h2 id="app-error-title" className="mb-3 font-kantumruy text-xl font-black leading-snug text-slate-900 sm:text-2xl">
                            សុំទោស! កម្មវិធីមានបញ្ហា
                        </h2>
                        <p className="mx-auto mb-7 max-w-sm text-sm font-medium leading-7 text-slate-600 sm:text-base">
                            មានបញ្ហាមិនរំពឹងទុកកើតឡើង។ សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ។
                        </p>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                        <Button
                            onClick={this.handleReset}
                            className="h-12 w-full rounded-xl bg-red-600 px-5 font-bold text-white shadow-lg shadow-red-200/70 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:w-auto"
                        >
                            <RefreshCcw aria-hidden="true" size={18} />
                            ព្យាយាមម្ដងទៀត
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = "/"}
                            className="h-12 w-full rounded-xl border-slate-200 px-5 font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:w-auto"
                        >
                            <Home aria-hidden="true" size={18} />
                            ទៅទំព័រដើម
                        </Button>
                        </div>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="mt-6 max-h-32 overflow-auto rounded-xl border border-red-100 bg-red-50/70 p-3 text-left text-xs text-red-800">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </section>
                </div>
            );
        }

        return this.props.children;
    }
}
