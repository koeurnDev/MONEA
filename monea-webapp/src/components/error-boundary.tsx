"use client";

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
                <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-center bg-white rounded-[2.5rem] border border-red-50 shadow-xl shadow-red-50/50">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 animate-pulse">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 font-kantumruy">សុំទោស! មានបញ្ហាបច្ចេកទេស</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                        មានបញ្ហាមិនរំពឹងទុកបានកើតឡើងនៅក្នុងផ្នែកនេះ ({this.props.name || "Component"}).
                        សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ។
                    </p>
                    <div className="flex items-center gap-3 justify-center">
                        <Button
                            onClick={this.handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-red-200"
                        >
                            <RefreshCcw size={18} />
                            ព្យាយាមម្ដងទៀត
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = "/dashboard"}
                            className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold flex items-center gap-2"
                        >
                            <Home size={18} />
                            ត្រឡប់ទៅដើម
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                        <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left text-xs font-mono text-red-700 max-w-2xl overflow-auto border border-slate-100 italic">
                            {this.state.error?.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
